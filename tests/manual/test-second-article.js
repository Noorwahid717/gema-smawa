// Test script untuk memverifikasi artikel kedua telah berhasil diupdate
// Using Node.js built-in fetch (available in Node 18+)

async function testSecondArticle() {
  console.log('🧪 Testing Second Tutorial Article...\n');

  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test 1: Check classroom page (artikel listing)
    console.log('📚 Test 1: Checking classroom page with articles...');
    const classroomResponse = await fetch(`${baseUrl}/classroom`);
    console.log(`   Status: ${classroomResponse.status} ${classroomResponse.statusText}`);
    
    if (classroomResponse.ok) {
      const classroomHtml = await classroomResponse.text();
      const hasSecondArticle = classroomHtml.includes('✨ Rahasia CSS yang Bikin Website Kamu Makin Kece!');
      console.log(`   ✅ Second article found in listing: ${hasSecondArticle}`);
      
      if (hasSecondArticle) {
        console.log('   ✅ Article title appears correctly in classroom page');
      }
    }

    // Test 2: Check second article detail page
    console.log('\n🎨 Test 2: Checking second article detail page...');
    const articleResponse = await fetch(`${baseUrl}/classroom/articles/css-styling-dasar-untuk-pemula`);
    console.log(`   Status: ${articleResponse.status} ${articleResponse.statusText}`);
    
    if (articleResponse.ok) {
      const articleHtml = await articleResponse.text();
      const contentLength = articleHtml.length;
      console.log(`   📄 Page HTML length: ${contentLength} characters`);
      
      // Check for key content indicators
      const hasMainTitle = articleHtml.includes('Rahasia CSS yang Bikin Website Kamu Makin Kece!');
      const hasSteps = articleHtml.includes('Step 1:') && articleHtml.includes('Step 2:') && articleHtml.includes('Step 3:');
      const hasCodeBlocks = articleHtml.includes('<pre') && articleHtml.includes('code>');
      const hasImages = articleHtml.includes('images.unsplash.com');
      const hasFunFacts = articleHtml.includes('CSS Fun Facts');
      const hasNextSteps = articleHtml.includes('CSS Wizard');
      
      console.log('   🔍 Content Analysis:');
      console.log(`   ✅ Main title present: ${hasMainTitle}`);
      console.log(`   ✅ Step-by-step structure: ${hasSteps}`);
      console.log(`   ✅ Code blocks present: ${hasCodeBlocks}`);
      console.log(`   ✅ Images from Unsplash: ${hasImages}`);
      console.log(`   ✅ Fun facts section: ${hasFunFacts}`);
      console.log(`   ✅ Next steps section: ${hasNextSteps}`);
      
      if (hasMainTitle && hasSteps && hasCodeBlocks && hasImages) {
        console.log('   🎉 Article content is comprehensive and well-structured!');
      }
    }

    // Test 3: Check API endpoint for articles
    console.log('\n🔗 Test 3: Checking articles API endpoint...');
    const apiResponse = await fetch(`${baseUrl}/api/classroom/articles`);
    console.log(`   Status: ${apiResponse.status} ${apiResponse.statusText}`);
    
    if (apiResponse.ok) {
      const articlesData = await apiResponse.json();
      console.log(`   📊 Total articles from API: ${articlesData.articles?.length || 0}`);
      
      const secondArticle = articlesData.articles?.find(article => 
        article.slug === 'css-styling-dasar-untuk-pemula'
      );
      
      if (secondArticle) {
        console.log('   ✅ Second article found in API response');
        console.log(`   📄 Title: ${secondArticle.title}`);
        console.log(`   📝 Status: ${secondArticle.status}`);
        console.log(`   🎯 Category: ${secondArticle.category}`);
        console.log(`   ⏱️ Read time: ${secondArticle.readTime} minutes`);
        console.log(`   👀 Views: ${secondArticle.views}`);
        console.log(`   📅 Published: ${secondArticle.publishedAt ? 'Yes' : 'No'}`);
      }
    }

    // Test 4: Check database statistics
    console.log('\n📈 Test 4: Database statistics verification...');
    const statsResponse = await fetch(`${baseUrl}/api/admin/dashboard`);
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log(`   Total articles: ${stats.totalArticles || 'N/A'}`);
      console.log(`   Published articles: ${stats.publishedArticles || 'N/A'}`);
    }

    console.log('\n✨ Second Tutorial Article Test Complete! ✨');
    console.log('🎊 Ready untuk tutorial selanjutnya atau testing lebih lanjut!');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Run the test
testSecondArticle();