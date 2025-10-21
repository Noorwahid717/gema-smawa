// Test script untuk memverifikasi artikel ketiga telah berhasil diupdate
async function testThirdArticle() {
  console.log('🧪 Testing Third Tutorial Article...\n');

  const baseUrl = 'http://localhost:3000';
  const articleSlug = 'tutorial-galeri-foto-responsif-css-grid';
  
  try {
    // Test 1: Check API endpoint
    console.log('1️⃣ Testing API endpoint...');
    const apiResponse = await fetch(`${baseUrl}/api/tutorial/articles/${articleSlug}`);
    
    if (apiResponse.ok) {
      const data = await apiResponse.json();
      console.log(`✅ API Response: ${apiResponse.status}`);
      console.log(`📄 Title: ${data.data.title}`);
      console.log(`📝 Content Length: ${data.data.content.length} characters`);
      console.log(`📊 Status: ${data.data.status}`);
      console.log(`👀 Views: ${data.data.views}`);
      
      // Check key content
      const hasSteps = data.data.content.includes('1) Struktur HTML') && data.data.content.includes('2) CSS Grid');
      const hasCodeBlocks = data.data.content.includes('<pre') && data.data.content.includes('code>');
      const hasImages = data.data.content.includes('images.unsplash.com');
      const hasGrid = data.data.content.includes('grid-template-columns');
      const hasLightbox = data.data.content.includes('lightbox');
      
      console.log(`🎯 Contains Steps: ${hasSteps}`);
      console.log(`💻 Contains Code: ${hasCodeBlocks}`);
      console.log(`🖼️ Contains Images: ${hasImages}`);
      console.log(`📐 Contains Grid CSS: ${hasGrid}`);
      console.log(`💡 Contains Lightbox: ${hasLightbox}`);
      
      if (hasSteps && hasCodeBlocks && hasImages && hasGrid) {
        console.log('🎉 Third Article Content is COMPLETE!');
      }
    } else {
      console.log(`❌ API Response: ${apiResponse.status}`);
    }

    // Test 2: Check tutorial page listing
    console.log('\n2️⃣ Testing tutorial page listing...');
    const tutorialResponse = await fetch(`${baseUrl}/tutorial`);
    if (tutorialResponse.ok) {
      const html = await tutorialResponse.text();
      const hasThirdArticle = html.includes('Galeri Foto Responsif yang Bikin Mata Terpukau');
      console.log(`📚 Third article in listing: ${hasThirdArticle}`);
    }

    // Test 3: Check article detail page
    console.log('\n3️⃣ Testing article detail page...');
    const pageResponse = await fetch(`${baseUrl}/tutorial/articles/${articleSlug}`);
    console.log(`📄 Page Response: ${pageResponse.status}`);
    
    if (pageResponse.ok) {
      const html = await pageResponse.text();
      console.log(`📖 Page HTML Length: ${html.length} characters`);
    }

    // Test 4: Check published articles count
    console.log('\n4️⃣ Testing published articles count...');
    const allArticlesResponse = await fetch(`${baseUrl}/api/tutorial/articles`);
    if (allArticlesResponse.ok) {
      const allData = await allArticlesResponse.json();
      const publishedCount = allData.articles?.length || 0;
      console.log(`📊 Total published articles: ${publishedCount}`);
      
      const articleTitles = allData.articles?.map(a => a.title) || [];
      console.log('📝 Published article titles:');
      articleTitles.forEach((title, index) => {
        console.log(`   ${index + 1}. ${title}`);
      });
    }

    console.log('\n✨ Third Tutorial Article Test Complete! 🚀');
    console.log('🎊 Ready untuk development tutorial selanjutnya!');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testThirdArticle();
