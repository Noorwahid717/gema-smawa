-- CreateTable
CREATE TABLE "web_lab_submission_versions" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "html" TEXT,
    "css" TEXT,
    "js" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "web_lab_submission_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "web_lab_submission_versions_submissionId_idx" ON "web_lab_submission_versions"("submissionId");

-- AddForeignKey
ALTER TABLE "web_lab_submission_versions" ADD CONSTRAINT "web_lab_submission_versions_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "web_lab_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
