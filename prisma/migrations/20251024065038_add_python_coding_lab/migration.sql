-- CreateEnum
CREATE TYPE "PythonTaskDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "PythonSubmissionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'RUNTIME_ERROR', 'COMPILATION_ERROR', 'TIME_LIMIT_EXCEEDED');

-- CreateTable
CREATE TABLE "python_coding_tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" "PythonTaskDifficulty" NOT NULL DEFAULT 'EASY',
    "category" TEXT NOT NULL DEFAULT 'general',
    "tags" TEXT,
    "starterCode" TEXT NOT NULL DEFAULT '# Write your Python code here

def solution():
    pass

# Test your solution
if __name__ == "__main__":
    print(solution())',
    "solutionCode" TEXT,
    "hints" JSONB,
    "timeLimit" INTEGER NOT NULL DEFAULT 5,
    "memoryLimit" INTEGER NOT NULL DEFAULT 128,
    "points" INTEGER NOT NULL DEFAULT 100,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "python_coding_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "python_test_cases" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "expectedOutput" TEXT NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "points" INTEGER NOT NULL DEFAULT 10,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "python_test_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "python_submissions" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'python',
    "status" "PythonSubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "judge0Token" TEXT,
    "stdout" TEXT,
    "stderr" TEXT,
    "compileOutput" TEXT,
    "message" TEXT,
    "time" DOUBLE PRECISION,
    "memory" INTEGER,
    "score" INTEGER NOT NULL DEFAULT 0,
    "totalTests" INTEGER NOT NULL DEFAULT 0,
    "passedTests" INTEGER NOT NULL DEFAULT 0,
    "testResults" JSONB,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "python_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "python_coding_tasks_slug_key" ON "python_coding_tasks"("slug");

-- CreateIndex
CREATE INDEX "python_coding_tasks_difficulty_idx" ON "python_coding_tasks"("difficulty");

-- CreateIndex
CREATE INDEX "python_coding_tasks_category_idx" ON "python_coding_tasks"("category");

-- CreateIndex
CREATE INDEX "python_coding_tasks_isActive_idx" ON "python_coding_tasks"("isActive");

-- CreateIndex
CREATE INDEX "python_coding_tasks_order_idx" ON "python_coding_tasks"("order");

-- CreateIndex
CREATE INDEX "python_test_cases_taskId_idx" ON "python_test_cases"("taskId");

-- CreateIndex
CREATE INDEX "python_test_cases_order_idx" ON "python_test_cases"("order");

-- CreateIndex
CREATE INDEX "python_submissions_taskId_idx" ON "python_submissions"("taskId");

-- CreateIndex
CREATE INDEX "python_submissions_studentId_idx" ON "python_submissions"("studentId");

-- CreateIndex
CREATE INDEX "python_submissions_status_idx" ON "python_submissions"("status");

-- CreateIndex
CREATE INDEX "python_submissions_submittedAt_idx" ON "python_submissions"("submittedAt");

-- AddForeignKey
ALTER TABLE "python_test_cases" ADD CONSTRAINT "python_test_cases_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "python_coding_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "python_submissions" ADD CONSTRAINT "python_submissions_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "python_coding_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "python_submissions" ADD CONSTRAINT "python_submissions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
