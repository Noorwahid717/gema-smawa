// Test script untuk feedback system
const baseUrl = 'http://localhost:3000';

async function testFeedbackSystem() {
  console.log('🧪 Testing GEMA Feedback System...\n');

  try {
    // 1. Test tanpa login (harus gagal)
    console.log('1. Testing feedback tanpa login...');
    const unauthorizedResponse = await fetch(`${baseUrl}/api/tutorial/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        articleId: 'test-article-id',
        rating: 5,
        comment: 'Test feedback',
        challenge: 'CSS Grid setup',
        checklist: {
          responsive: true,
          lightbox: false,
          performance: true,
          hover: false,
          navigation: true
        }
      }),
    });

    const unauthorizedData = await unauthorizedResponse.json();
    console.log('Response:', unauthorizedData);
    
    if (unauthorizedResponse.status === 401) {
      console.log('✅ Unauthorized test passed - feedback rejected without login\n');
    } else {
      console.log('❌ Unauthorized test failed - should require login\n');
    }

    // 2. Test dengan login siswa
    console.log('2. Untuk test dengan login, silakan:');
    console.log('   - Buka http://localhost:3000/student/login');
    console.log('   - Login dengan NIS: 2024001, Password: student123');
    console.log('   - Buka artikel dan coba submit feedback\n');

    // 3. Test API endpoint structure
    console.log('3. Testing API endpoint accessibility...');
    const optionsResponse = await fetch(`${baseUrl}/api/tutorial/feedback`, {
      method: 'OPTIONS'
    });
    console.log('API endpoint accessible:', optionsResponse.status !== 404);

    console.log('\n✅ Basic feedback system tests completed!');
    console.log('\n📋 Manual Test Checklist:');
    console.log('□ Login sebagai siswa berhasil');
    console.log('□ Feedback form muncul setelah login'); 
    console.log('□ Rating bisa dipilih 1-5 bintang');
    console.log('□ Challenge dropdown berfungsi');
    console.log('□ Testing checklist bisa dicentang');
    console.log('□ Submit feedback berhasil');
    console.log('□ Feedback tersimpan ke database');
    console.log('□ Duplicate feedback ditolak');

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run test
testFeedbackSystem();
