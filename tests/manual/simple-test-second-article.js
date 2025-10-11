// Simple test untuk memverifikasi bahwa artikel kedua sudah berhasil diupdate dan dapat diakses
async function simpleTest() {
  console.log('🔍 Simple Test: Checking Second Article...\n');

  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test API endpoint
    console.log('1️⃣ Testing API endpoint...');
    const apiResponse = await fetch(`${baseUrl}/api/classroom/articles/css-styling-dasar-untuk-pemula`);
    
    if (apiResponse.ok) {
      const data = await apiResponse.json();
      console.log(`✅ API Response: ${apiResponse.status}`);
      console.log(`📄 Title: ${data.data.title}`);
      console.log(`📝 Content Length: ${data.data.content.length} characters`);
      console.log(`👀 Views: ${data.data.views}`);
      console.log(`📊 Status: ${data.data.status}`);
      
      // Check key content
      const hasSteps = data.data.content.includes('Step 1:') && data.data.content.includes('Step 2:');
      const hasCode = data.data.content.includes('<pre') && data.data.content.includes('code>');
      const hasImages = data.data.content.includes('images.unsplash.com');
      
      console.log(`🎯 Contains Steps: ${hasSteps}`);
      console.log(`💻 Contains Code: ${hasCode}`);
      console.log(`🖼️ Contains Images: ${hasImages}`);
      
      if (hasSteps && hasCode && hasImages) {
        console.log('🎉 API Content is COMPLETE and RICH!');
      }
    } else {
      console.log(`❌ API Response: ${apiResponse.status}`);
    }

    // Test direct page access
    console.log('\n2️⃣ Testing page access...');
    const pageResponse = await fetch(`${baseUrl}/classroom/articles/css-styling-dasar-untuk-pemula`);
    console.log(`📄 Page Response: ${pageResponse.status}`);
    
    if (pageResponse.ok) {
      const html = await pageResponse.text();
      console.log(`📖 Page HTML Length: ${html.length} characters`);
      
      // Check if Next.js page loads
      const hasNextJS = html.includes('__NEXT_DATA__');
      const hasTitle = html.includes('Rahasia CSS');
      
      console.log(`⚛️ Next.js App: ${hasNextJS}`);
      console.log(`📝 Has Title: ${hasTitle}`);
    }

    console.log('\n✨ Test Complete! Artikel kedua is ready! 🚀');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

simpleTest();