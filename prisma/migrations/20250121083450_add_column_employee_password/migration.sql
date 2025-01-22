/*
  Warnings:

  - Added the required column `password` to the `orb_employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orb_employee" ADD COLUMN     "password" TEXT NOT NULL;
