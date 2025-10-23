-- AlterTable: Add new columns for document submission
ALTER TABLE "submissions" ADD COLUMN IF NOT EXISTS "documentType" TEXT;
ALTER TABLE "submissions" ADD COLUMN IF NOT EXISTS "previewUrl" TEXT;

-- Update existing submissions to have documentType based on mimeType
UPDATE "submissions" 
SET "documentType" = CASE 
    WHEN "mimeType" = 'application/pdf' THEN 'pdf'
    WHEN "mimeType" = 'application/msword' THEN 'doc'
    WHEN "mimeType" = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' THEN 'docx'
    ELSE NULL
END
WHERE "documentType" IS NULL;

-- Update previewUrl to match filePath for existing submissions
UPDATE "submissions" 
SET "previewUrl" = "filePath"
WHERE "previewUrl" IS NULL AND "filePath" IS NOT NULL;

-- AlterTable: Update Assignment allowedFileTypes default
ALTER TABLE "assignments" 
ALTER COLUMN "allowedFileTypes" SET DEFAULT 'pdf,doc,docx';

-- Update existing assignments to new default if null
UPDATE "assignments" 
SET "allowedFileTypes" = 'pdf,doc,docx'
WHERE "allowedFileTypes" IS NULL OR "allowedFileTypes" = '';
