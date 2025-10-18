-- CreateEnum
CREATE TYPE "CodingLabSubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'RETURNED', 'GRADED');

-- CreateEnum
CREATE TYPE "CodingLabArtifactType" AS ENUM ('EDITOR', 'UPLOAD');

-- CreateEnum
CREATE TYPE "CodingLabRubricCriterion" AS ENUM ('HTML_STRUCTURE', 'CSS_RESPONSIVE', 'JS_INTERACTIVITY', 'CODE_QUALITY', 'CREATIVITY_BRIEF');

-- CreateEnum
CREATE TYPE "WebLabDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "WebLabStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "WebLabSubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'GRADED', 'RETURNED');

-- CreateEnum
CREATE TYPE "WebLabEvaluationStatus" AS ENUM ('PENDING', 'COMPLETED', 'NEEDS_REVISION');

-- CreateEnum
CREATE TYPE "CodingDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "CodingSubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'EVALUATING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unread',
    "adminReply" TEXT,
    "repliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registrations" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "school" TEXT,
    "address" TEXT,
    "program" TEXT NOT NULL DEFAULT 'GEMA',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "showOnHomepage" BOOLEAN NOT NULL DEFAULT false,
    "publishDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "capacity" INTEGER,
    "registered" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "showOnHomepage" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "galleries" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "showOnHomepage" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "galleries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderEmail" TEXT NOT NULL,
    "senderType" TEXT NOT NULL DEFAULT 'user',
    "status" TEXT NOT NULL DEFAULT 'sent',
    "sessionId" TEXT,
    "replyTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_sessions" (
    "id" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "assignedTo" TEXT,
    "lastMessage" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "tags" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "maxSubmissions" INTEGER NOT NULL DEFAULT 30,
    "status" TEXT NOT NULL DEFAULT 'active',
    "instructions" TEXT,
    "allowedFileTypes" TEXT,
    "maxFileSize" INTEGER NOT NULL DEFAULT 10485760,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "grade" DOUBLE PRECISION,
    "feedback" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "isLate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coding_lab_tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "classLevel" TEXT NOT NULL,
    "tags" TEXT,
    "instructions" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coding_lab_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coding_lab_submissions" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "classLevel" TEXT NOT NULL,
    "tags" TEXT,
    "status" "CodingLabSubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "lastVersionId" TEXT,
    "grade" INTEGER,
    "reviewerId" TEXT,
    "reviewerNote" TEXT,
    "submittedAt" TIMESTAMP(3),
    "returnedAt" TIMESTAMP(3),
    "draftHtml" TEXT,
    "draftCss" TEXT,
    "draftJs" TEXT,
    "draftArtifact" "CodingLabArtifactType" NOT NULL DEFAULT 'EDITOR',
    "draftArchivePath" TEXT,
    "draftArchiveSize" INTEGER,
    "draftMetadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coding_lab_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coding_lab_versions" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "classLevel" TEXT NOT NULL,
    "tags" TEXT,
    "html" TEXT,
    "css" TEXT,
    "js" TEXT,
    "artifactType" "CodingLabArtifactType" NOT NULL DEFAULT 'EDITOR',
    "archivePath" TEXT,
    "archiveSize" INTEGER,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coding_lab_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coding_lab_evaluations" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "overallNote" TEXT,
    "status" "CodingLabSubmissionStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coding_lab_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coding_lab_rubric_scores" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "criterion" "CodingLabRubricCriterion" NOT NULL,
    "score" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "comment" TEXT,

    CONSTRAINT "coding_lab_rubric_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classroom_project_checklists" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "skills" JSONB NOT NULL,
    "basicTargets" JSONB NOT NULL,
    "advancedTargets" JSONB NOT NULL,
    "reflectionPrompt" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classroom_project_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classrooms" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT,
    "description" TEXT,
    "teacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classrooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "class" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "parentName" TEXT,
    "parentPhone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "profileImage" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT,
    "author" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" TEXT,
    "readTime" INTEGER,
    "views" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION,
    "totalFeedback" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_feedback" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "studentId" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "challenge" TEXT,
    "checklist" JSONB,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "web_lab_assignments" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" "WebLabDifficulty" NOT NULL DEFAULT 'BEGINNER',
    "classLevel" TEXT,
    "instructions" TEXT NOT NULL,
    "starterHtml" TEXT,
    "starterCss" TEXT,
    "starterJs" TEXT,
    "requirements" JSONB,
    "hints" JSONB,
    "solutionHtml" TEXT,
    "solutionCss" TEXT,
    "solutionJs" TEXT,
    "points" INTEGER NOT NULL DEFAULT 100,
    "timeLimit" INTEGER,
    "status" "WebLabStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "web_lab_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "web_lab_submissions" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "html" TEXT,
    "css" TEXT,
    "js" TEXT,
    "status" "WebLabSubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "gradedAt" TIMESTAMP(3),
    "score" INTEGER,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "web_lab_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "web_lab_evaluations" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "evaluatedBy" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "feedback" TEXT,
    "checklist" JSONB,
    "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "web_lab_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coding_labs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" "CodingDifficulty" NOT NULL DEFAULT 'BEGINNER',
    "language" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 100,
    "duration" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coding_labs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coding_exercises" (
    "id" TEXT NOT NULL,
    "labId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" "CodingDifficulty" NOT NULL DEFAULT 'BEGINNER',
    "points" INTEGER NOT NULL DEFAULT 10,
    "timeLimit" INTEGER NOT NULL,
    "memoryLimit" INTEGER NOT NULL,
    "instructions" TEXT NOT NULL,
    "starterCode" TEXT NOT NULL,
    "solutionCode" TEXT,
    "hints" TEXT,
    "tags" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coding_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coding_test_cases" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "expectedOutput" TEXT NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "explanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coding_test_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coding_submissions" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "CodingSubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "score" INTEGER,
    "executionTime" INTEGER,
    "memoryUsed" INTEGER,
    "testResults" JSONB,
    "submittedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coding_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coding_evaluations" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "evaluatedBy" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "feedback" TEXT,
    "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coding_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- CreateIndex
CREATE INDEX "chat_messages_sessionId_idx" ON "chat_messages"("sessionId");

-- CreateIndex
CREATE INDEX "chat_messages_createdAt_idx" ON "chat_messages"("createdAt");

-- CreateIndex
CREATE INDEX "chat_sessions_status_idx" ON "chat_sessions"("status");

-- CreateIndex
CREATE INDEX "chat_sessions_assignedTo_idx" ON "chat_sessions"("assignedTo");

-- CreateIndex
CREATE INDEX "chat_sessions_lastMessage_idx" ON "chat_sessions"("lastMessage");

-- CreateIndex
CREATE INDEX "assignments_status_idx" ON "assignments"("status");

-- CreateIndex
CREATE INDEX "assignments_dueDate_idx" ON "assignments"("dueDate");

-- CreateIndex
CREATE INDEX "submissions_assignmentId_idx" ON "submissions"("assignmentId");

-- CreateIndex
CREATE INDEX "submissions_studentId_idx" ON "submissions"("studentId");

-- CreateIndex
CREATE INDEX "submissions_submittedAt_idx" ON "submissions"("submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "coding_lab_tasks_title_classLevel_key" ON "coding_lab_tasks"("title", "classLevel");

-- CreateIndex
CREATE UNIQUE INDEX "coding_lab_submissions_lastVersionId_key" ON "coding_lab_submissions"("lastVersionId");

-- CreateIndex
CREATE INDEX "coding_lab_submissions_taskId_idx" ON "coding_lab_submissions"("taskId");

-- CreateIndex
CREATE INDEX "coding_lab_submissions_studentId_idx" ON "coding_lab_submissions"("studentId");

-- CreateIndex
CREATE INDEX "coding_lab_submissions_status_idx" ON "coding_lab_submissions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "coding_lab_submissions_studentId_taskId_key" ON "coding_lab_submissions"("studentId", "taskId");

-- CreateIndex
CREATE INDEX "coding_lab_versions_submissionId_idx" ON "coding_lab_versions"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "coding_lab_evaluations_versionId_key" ON "coding_lab_evaluations"("versionId");

-- CreateIndex
CREATE INDEX "coding_lab_evaluations_submissionId_idx" ON "coding_lab_evaluations"("submissionId");

-- CreateIndex
CREATE INDEX "coding_lab_rubric_scores_evaluationId_idx" ON "coding_lab_rubric_scores"("evaluationId");

-- CreateIndex
CREATE UNIQUE INDEX "coding_lab_rubric_scores_evaluationId_criterion_key" ON "coding_lab_rubric_scores"("evaluationId", "criterion");

-- CreateIndex
CREATE UNIQUE INDEX "classroom_project_checklists_slug_key" ON "classroom_project_checklists"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "classrooms_slug_key" ON "classrooms"("slug");

-- CreateIndex
CREATE INDEX "classrooms_teacherId_idx" ON "classrooms"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "students_studentId_key" ON "students"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "students_email_key" ON "students"("email");

-- CreateIndex
CREATE INDEX "students_studentId_idx" ON "students"("studentId");

-- CreateIndex
CREATE INDEX "students_status_idx" ON "students"("status");

-- CreateIndex
CREATE INDEX "students_class_idx" ON "students"("class");

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE INDEX "articles_status_idx" ON "articles"("status");

-- CreateIndex
CREATE INDEX "articles_category_idx" ON "articles"("category");

-- CreateIndex
CREATE INDEX "articles_publishedAt_idx" ON "articles"("publishedAt");

-- CreateIndex
CREATE INDEX "articles_featured_idx" ON "articles"("featured");

-- CreateIndex
CREATE INDEX "article_feedback_articleId_idx" ON "article_feedback"("articleId");

-- CreateIndex
CREATE INDEX "article_feedback_studentId_idx" ON "article_feedback"("studentId");

-- CreateIndex
CREATE INDEX "article_feedback_rating_idx" ON "article_feedback"("rating");

-- CreateIndex
CREATE INDEX "article_feedback_timestamp_idx" ON "article_feedback"("timestamp");

-- CreateIndex
CREATE INDEX "web_lab_assignments_status_idx" ON "web_lab_assignments"("status");

-- CreateIndex
CREATE INDEX "web_lab_assignments_difficulty_idx" ON "web_lab_assignments"("difficulty");

-- CreateIndex
CREATE INDEX "web_lab_assignments_classLevel_idx" ON "web_lab_assignments"("classLevel");

-- CreateIndex
CREATE INDEX "web_lab_submissions_assignmentId_idx" ON "web_lab_submissions"("assignmentId");

-- CreateIndex
CREATE INDEX "web_lab_submissions_studentId_idx" ON "web_lab_submissions"("studentId");

-- CreateIndex
CREATE INDEX "web_lab_submissions_status_idx" ON "web_lab_submissions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "web_lab_submissions_assignmentId_studentId_key" ON "web_lab_submissions"("assignmentId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "web_lab_evaluations_submissionId_key" ON "web_lab_evaluations"("submissionId");

-- CreateIndex
CREATE INDEX "web_lab_evaluations_evaluatedBy_idx" ON "web_lab_evaluations"("evaluatedBy");

-- CreateIndex
CREATE INDEX "coding_labs_difficulty_idx" ON "coding_labs"("difficulty");

-- CreateIndex
CREATE INDEX "coding_labs_language_idx" ON "coding_labs"("language");

-- CreateIndex
CREATE INDEX "coding_labs_isActive_idx" ON "coding_labs"("isActive");

-- CreateIndex
CREATE INDEX "coding_exercises_labId_idx" ON "coding_exercises"("labId");

-- CreateIndex
CREATE INDEX "coding_exercises_difficulty_idx" ON "coding_exercises"("difficulty");

-- CreateIndex
CREATE INDEX "coding_exercises_isActive_idx" ON "coding_exercises"("isActive");

-- CreateIndex
CREATE INDEX "coding_test_cases_exerciseId_idx" ON "coding_test_cases"("exerciseId");

-- CreateIndex
CREATE INDEX "coding_submissions_exerciseId_idx" ON "coding_submissions"("exerciseId");

-- CreateIndex
CREATE INDEX "coding_submissions_studentId_idx" ON "coding_submissions"("studentId");

-- CreateIndex
CREATE INDEX "coding_submissions_status_idx" ON "coding_submissions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "coding_submissions_exerciseId_studentId_key" ON "coding_submissions"("exerciseId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "coding_evaluations_submissionId_key" ON "coding_evaluations"("submissionId");

-- CreateIndex
CREATE INDEX "coding_evaluations_evaluatedBy_idx" ON "coding_evaluations"("evaluatedBy");

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_lab_submissions" ADD CONSTRAINT "coding_lab_submissions_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "coding_lab_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_lab_submissions" ADD CONSTRAINT "coding_lab_submissions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_lab_submissions" ADD CONSTRAINT "coding_lab_submissions_lastVersionId_fkey" FOREIGN KEY ("lastVersionId") REFERENCES "coding_lab_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_lab_versions" ADD CONSTRAINT "coding_lab_versions_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "coding_lab_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_lab_evaluations" ADD CONSTRAINT "coding_lab_evaluations_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "coding_lab_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_lab_evaluations" ADD CONSTRAINT "coding_lab_evaluations_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "coding_lab_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_lab_rubric_scores" ADD CONSTRAINT "coding_lab_rubric_scores_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "coding_lab_evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_feedback" ADD CONSTRAINT "article_feedback_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_feedback" ADD CONSTRAINT "article_feedback_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "web_lab_assignments" ADD CONSTRAINT "web_lab_assignments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "web_lab_submissions" ADD CONSTRAINT "web_lab_submissions_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "web_lab_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "web_lab_submissions" ADD CONSTRAINT "web_lab_submissions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "web_lab_evaluations" ADD CONSTRAINT "web_lab_evaluations_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "web_lab_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "web_lab_evaluations" ADD CONSTRAINT "web_lab_evaluations_evaluatedBy_fkey" FOREIGN KEY ("evaluatedBy") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_exercises" ADD CONSTRAINT "coding_exercises_labId_fkey" FOREIGN KEY ("labId") REFERENCES "coding_labs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_test_cases" ADD CONSTRAINT "coding_test_cases_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "coding_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_submissions" ADD CONSTRAINT "coding_submissions_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "coding_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_submissions" ADD CONSTRAINT "coding_submissions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_evaluations" ADD CONSTRAINT "coding_evaluations_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "coding_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_evaluations" ADD CONSTRAINT "coding_evaluations_evaluatedBy_fkey" FOREIGN KEY ("evaluatedBy") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
