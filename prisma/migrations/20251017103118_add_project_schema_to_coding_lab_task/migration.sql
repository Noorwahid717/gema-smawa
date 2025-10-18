-- AlterTable
ALTER TABLE "coding_lab_tasks" ADD COLUMN     "files" JSONB,
ADD COLUMN     "previewMode" TEXT,
ADD COLUMN     "project" JSONB;
