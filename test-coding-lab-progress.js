import fetch from 'node-fetch';

async function testCodingLabProgress() {
  console.log('Testing coding lab progress API...');

  try {
    // First, login as a student
    const loginResponse = await fetch('http://localhost:3000/api/auth/student-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId: '2024001',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginData.success) {
      console.log('Login failed, trying to create test student...');
      return;
    }

    // Get progress
    const progressResponse = await fetch('http://localhost:3000/api/student/coding-lab/progress', {
      headers: {
        'Cookie': loginResponse.headers.get('set-cookie') || ''
      }
    });

    const progressData = await progressResponse.json();
    console.log('Progress response:', JSON.stringify(progressData, null, 2));

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCodingLabProgress();