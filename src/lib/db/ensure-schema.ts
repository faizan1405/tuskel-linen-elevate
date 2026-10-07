import { prisma } from "@/lib/db/prisma";

let schemaEnsured = false;
let schemaCheckPromise: Promise<void> | null = null;

/**
 * Ensures that the database schema is up-to-date with recent changes,
 * specifically ensuring the `sku` column exists on the `products` table.
 *
 * This provides zero-downtime, self-healing database schema synchronization
 * for production environments (like Hostinger MySQL) where manual Prisma
 * migration commands may not have been executed via CLI.
 */
export async function ensureProductSchema(): Promise<void> {
  if (schemaEnsured) return;

  if (schemaCheckPromise) {
    return schemaCheckPromise;
  }

  schemaCheckPromise = (async () => {
    try {
      // 1. Check if the 'sku' column already exists in 'products' table
      const columns: any = await prisma.$queryRawUnsafe(`
        SELECT COLUMN_NAME 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'products' 
          AND COLUMN_NAME = 'sku'
        LIMIT 1;
      `);

      const hasSku = Array.isArray(columns) && columns.length > 0;

      if (!hasSku) {
        console.log("[db-schema] Column 'sku' missing from 'products' table. Applying auto-migration...");

        try {
          await prisma.$executeRawUnsafe(`
            ALTER TABLE \`products\` ADD COLUMN \`sku\` VARCHAR(191) NULL;
          `);
          console.log("[db-schema] Successfully added 'sku' column to 'products' table.");
        } catch (addColErr: any) {
          const msg = String(addColErr?.message || "");
          if (!msg.includes("Duplicate column") && !msg.includes("already exists")) {
            console.error("[db-schema] Failed to add 'sku' column:", addColErr);
          }
        }

        try {
          await prisma.$executeRawUnsafe(`
            CREATE UNIQUE INDEX \`products_sku_key\` ON \`products\`(\`sku\`);
          `);
          console.log("[db-schema] Successfully created 'products_sku_key' unique index.");
        } catch (idxErr: any) {
          const msg = String(idxErr?.message || "");
          if (!msg.includes("Duplicate key") && !msg.includes("already exists") && !msg.includes("Duplicate entry")) {
            console.warn("[db-schema] Notice creating 'products_sku_key' index:", idxErr?.message);
          }
        }
      }

      schemaEnsured = true;
    } catch (err: any) {
      console.warn("[db-schema] Schema check warning:", err?.message || err);
    } finally {
      schemaCheckPromise = null;
    }
  })();

  return schemaCheckPromise;
}
