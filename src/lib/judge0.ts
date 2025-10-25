/**
 * Judge0 API Integration Library
 * Handles code execution and submission to Judge0 CE API
 */

// Judge0 Language IDs
export const LANGUAGE_IDS = {
  python: 71,  // Python 3.8.1
  javascript: 63,  // JavaScript (Node.js 12.14.0)
  java: 62,  // Java (OpenJDK 13.0.1)
  cpp: 54,  // C++ (GCC 9.2.0)
  c: 50,  // C (GCC 9.2.0)
} as const;

export type LanguageKey = keyof typeof LANGUAGE_IDS;

interface Judge0SubmissionRequest {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: number;
  memory_limit?: number;
}

interface Judge0SubmissionResponse {
  token: string;
}

export interface Judge0StatusResponse {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string | null;  // Execution time in seconds
  memory: number | null;  // Memory in KB
  status: {
    id: number;
    description: string;
  };
}

// Judge0 Status IDs
export const JUDGE0_STATUS = {
  IN_QUEUE: 1,
  PROCESSING: 2,
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT_EXCEEDED: 5,
  COMPILATION_ERROR: 6,
  RUNTIME_ERROR_SIGSEGV: 7,
  RUNTIME_ERROR_SIGXFSZ: 8,
  RUNTIME_ERROR_SIGFPE: 9,
  RUNTIME_ERROR_SIGABRT: 10,
  RUNTIME_ERROR_NZEC: 11,
  RUNTIME_ERROR_OTHER: 12,
  INTERNAL_ERROR: 13,
  EXEC_FORMAT_ERROR: 14,
} as const;

/**
 * Submit code to Judge0 for execution
 */
export async function submitCodeToJudge0(
  code: string,
  languageId: number,
  stdin?: string,
  expectedOutput?: string,
  timeLimit: number = 5,
  memoryLimit: number = 128000
): Promise<string> {
  const apiUrl = process.env.JUDGE0_API_URL;
  const apiKey = process.env.JUDGE0_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error('Judge0 API credentials not configured');
  }

  const submissionData: Judge0SubmissionRequest = {
    source_code: Buffer.from(code).toString('base64'),
    language_id: languageId,
    stdin: stdin ? Buffer.from(stdin).toString('base64') : undefined,
    expected_output: expectedOutput ? Buffer.from(expectedOutput).toString('base64') : undefined,
    cpu_time_limit: timeLimit,
    memory_limit: memoryLimit,
  };

  try {
    const response = await fetch(`${apiUrl}/submissions?base64_encoded=true&wait=false`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      },
      body: JSON.stringify(submissionData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Judge0 API error: ${response.status} - ${errorText}`);
    }

    const result: Judge0SubmissionResponse = await response.json();
    return result.token;
  } catch (error) {
    console.error('Error submitting to Judge0:', error);
    throw error;
  }
}

/**
 * Get submission status and results from Judge0
 */
export async function getSubmissionStatus(token: string): Promise<Judge0StatusResponse> {
  const apiUrl = process.env.JUDGE0_API_URL;
  const apiKey = process.env.JUDGE0_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error('Judge0 API credentials not configured');
  }

  try {
    const response = await fetch(`${apiUrl}/submissions/${token}?base64_encoded=true`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Judge0 API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    // Decode base64 encoded fields
    return {
      stdout: result.stdout ? Buffer.from(result.stdout, 'base64').toString('utf-8') : null,
      stderr: result.stderr ? Buffer.from(result.stderr, 'base64').toString('utf-8') : null,
      compile_output: result.compile_output ? Buffer.from(result.compile_output, 'base64').toString('utf-8') : null,
      message: result.message ? Buffer.from(result.message, 'base64').toString('utf-8') : null,
      time: result.time,
      memory: result.memory,
      status: result.status,
    };
  } catch (error) {
    console.error('Error getting submission status:', error);
    throw error;
  }
}

/**
 * Submit code and wait for result with polling
 */
export async function submitAndWaitForResult(
  code: string,
  languageId: number,
  stdin?: string,
  expectedOutput?: string,
  timeLimit: number = 5,
  maxPollingAttempts: number = 10
): Promise<Judge0StatusResponse> {
  // Submit code
  const token = await submitCodeToJudge0(code, languageId, stdin, expectedOutput, timeLimit);

  // Poll for result
  let attempts = 0;
  while (attempts < maxPollingAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between polls

    const status = await getSubmissionStatus(token);

    // Check if processing is complete
    if (status.status.id > JUDGE0_STATUS.PROCESSING) {
      return status;
    }

    attempts++;
  }

  throw new Error('Submission timeout: Maximum polling attempts reached');
}

/**
 * Run test cases for a submission
 */
export async function runTestCases(
  code: string,
  languageId: number,
  testCases: Array<{ input: string; expectedOutput: string; name: string }>,
  timeLimit: number = 5
): Promise<Array<{
  name: string;
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string | null;
  error: string | null;
  time: string | null;
  memory: number | null;
}>> {
  const results = [];

  for (const testCase of testCases) {
    try {
      const result = await submitAndWaitForResult(
        code,
        languageId,
        testCase.input,
        testCase.expectedOutput,
        timeLimit
      );

      const passed = result.status.id === JUDGE0_STATUS.ACCEPTED;
      const actualOutput = result.stdout?.trim() || null;
      const error = result.stderr || result.compile_output || result.message || null;

      results.push({
        name: testCase.name,
        passed,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput,
        error,
        time: result.time,
        memory: result.memory,
      });
    } catch (error) {
      results.push({
        name: testCase.name,
        passed: false,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        time: null,
        memory: null,
      });
    }
  }

  return results;
}

/**
 * Map Judge0 status ID to our submission status
 */
export function mapJudge0StatusToSubmissionStatus(statusId: number): string {
  switch (statusId) {
    case JUDGE0_STATUS.IN_QUEUE:
    case JUDGE0_STATUS.PROCESSING:
      return 'PROCESSING';
    case JUDGE0_STATUS.ACCEPTED:
      return 'COMPLETED';
    case JUDGE0_STATUS.WRONG_ANSWER:
      return 'COMPLETED'; // Still completed, just wrong answer
    case JUDGE0_STATUS.TIME_LIMIT_EXCEEDED:
      return 'TIME_LIMIT_EXCEEDED';
    case JUDGE0_STATUS.COMPILATION_ERROR:
      return 'COMPILATION_ERROR';
    case JUDGE0_STATUS.RUNTIME_ERROR_SIGSEGV:
    case JUDGE0_STATUS.RUNTIME_ERROR_SIGXFSZ:
    case JUDGE0_STATUS.RUNTIME_ERROR_SIGFPE:
    case JUDGE0_STATUS.RUNTIME_ERROR_SIGABRT:
    case JUDGE0_STATUS.RUNTIME_ERROR_NZEC:
    case JUDGE0_STATUS.RUNTIME_ERROR_OTHER:
      return 'RUNTIME_ERROR';
    default:
      return 'FAILED';
  }
}
