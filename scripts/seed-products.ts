/**
 * Seed script safeguard.
 * Seeding demo catalogue products is permanently disabled to prevent overwriting or polluting the Hostinger MySQL database.
 * Genuine products must be managed exclusively through the Admin Panel.
 */
console.warn("Manual seeding is permanently disabled to safeguard the MySQL production catalogue.");
process.exit(0);
