/*
  Warnings:

  - You are about to drop the column `roles` on the `User` table. All the data in the column will be lost.
  - Added the required column `provider` to the `Authenticator` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Authenticator" ADD COLUMN     "provider" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "roles",
ADD COLUMN     "password" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';
