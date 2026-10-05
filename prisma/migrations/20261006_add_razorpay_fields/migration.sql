-- AlterTable
ALTER TABLE `orders` ADD COLUMN `razorpayOrderId` VARCHAR(191) NULL,
    ADD COLUMN `razorpayPaymentId` VARCHAR(191) NULL,
    ADD COLUMN `paymentProvider` VARCHAR(191) NULL DEFAULT 'cod',
    ADD COLUMN `paidAt` DATETIME(3) NULL,
    ADD COLUMN `paymentFailureReason` TEXT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `orders_razorpayOrderId_key` ON `orders`(`razorpayOrderId`);

-- CreateIndex
CREATE UNIQUE INDEX `orders_razorpayPaymentId_key` ON `orders`(`razorpayPaymentId`);
