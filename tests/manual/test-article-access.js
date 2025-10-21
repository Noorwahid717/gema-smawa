// Test script untuk memverifikasi artikel tutorial bisa diakses
// Run: node test-article-access.js

const https = require('https');
const http = require('http');

const testUrls = [
  'http://localhost:3000/api/tutorial/articles?status=published',
  'http://localhost:3000/api/tutorial/articles/tutorial-kartu-ucapan-interaktif-html-css',
  'http://localhost:3000/tutorial/articles/tutorial-kartu-ucapan-interaktif-html-css'
];

function testUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          headers: res.headers,
          dataLength: data.length,
          data: data.length > 500 ? data.substring(0, 500) + '...' : data
        });
      });
    });
    
    req.on('error', (error) => {
      reject({
        url,
        error: error.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject({
        url,
        error: 'Request timeout'
      });
    });
  });
}

async function runTests() {
  console.log('🧪 Testing article access...\n');
  
  for (const url of testUrls) {
    try {
      console.log(`Testing: ${url}`);
      const result = await testUrl(url);
      
      if (result.status === 200) {
        console.log(`✅ SUCCESS: Status ${result.status}`);
        console.log(`   Data length: ${result.dataLength} bytes`);
        
        // Check if it's JSON
        if (result.headers['content-type']?.includes('application/json')) {
          try {
            const jsonData = JSON.parse(result.data);
            if (jsonData.success) {
              console.log(`   API Response: Success = ${jsonData.success}`);
              if (jsonData.data) {
                if (Array.isArray(jsonData.data)) {
                  console.log(`   Articles found: ${jsonData.data.length}`);
                } else {
                  console.log(`   Article title: ${jsonData.data.title || 'N/A'}`);
                }
              }
            }
          } catch (e) {
            console.log('   JSON parse error:', e.message);
          }
        } else if (result.headers['content-type']?.includes('text/html')) {
          console.log('   HTML page loaded successfully');
        }
      } else {
        console.log(`❌ FAILED: Status ${result.status}`);
      }
      
      console.log('---\n');
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.error || error.message}`);
      console.log('---\n');
    }
  }
}

// Test image loading from Unsplash
async function testUnsplashImage() {
  console.log('🖼️  Testing Unsplash image access...\n');
  
  const imageUrl = 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80';
  
  try {
    const result = await testUrl(imageUrl);
    
    if (result.status === 200) {
      console.log(`✅ Unsplash image loaded successfully`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Content-Type: ${result.headers['content-type']}`);
      console.log(`   Content-Length: ${result.headers['content-length']} bytes`);
    } else {
      console.log(`❌ Failed to load Unsplash image: Status ${result.status}`);
    }
  } catch (error) {
    console.log(`❌ Unsplash image error: ${error.error || error.message}`);
  }
  
  console.log('---\n');
}

// Run all tests
runTests()
  .then(() => testUnsplashImage())
  .then(() => {
    console.log('🎉 All tests completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  });
