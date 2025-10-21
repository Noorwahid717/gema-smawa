// Test script untuk verifikasi session setelah login
const baseUrl = 'http://localhost:3000';

async function testSessionAfterLogin() {
  console.log('🧪 Testing Session after Student Login...\n');

  try {
    // Simulasi test dengan cookie session jika ada
    console.log('Instructions untuk manual test:');
    console.log('1. Login dengan NIS: 2024001, Password: student123');
    console.log('2. Buka browser dev tools (F12)');
    console.log('3. Check console untuk session debug info');
    console.log('4. Coba submit feedback');
    console.log('5. Periksa terminal untuk error details\n');

    // Test artikel endpoint
    console.log('Testing artikel endpoint...');
    const articleResponse = await fetch(`${baseUrl}/api/tutorial/articles/responsive-css-grid-gallery`);
    if (articleResponse.ok) {
      console.log('✅ Article endpoint accessible');
    } else {
      console.log('❌ Article endpoint error:', articleResponse.status);
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testSessionAfterLogin();
