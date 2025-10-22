#!/bin/bash

# 🌱 GEMA Tutorial Articles Seeder
# Script untuk menjalankan seeding artikel tutorial berdasarkan roadmap pembelajaran

echo "🌱 Starting GEMA Tutorial Articles Seeding Process..."
echo "================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if database is accessible
echo "🔍 Checking database connection..."
if ! npx prisma db push --accept-data-loss > /dev/null 2>&1; then
    echo "❌ Error: Cannot connect to database. Please check your DATABASE_URL"
    exit 1
fi

echo "✅ Database connection successful!"

# Run tutorial articles seeding
echo ""
echo "📚 Seeding tutorial articles based on classroom roadmap..."
echo "========================================================="

if npx tsx seed/seed-tutorial-articles.ts; then
    echo ""
    echo "🎉 Tutorial articles seeding completed successfully!"
    echo ""
    
    # Show final statistics
    echo "📊 Final Database Statistics:"
    echo "============================="
    
    # Get article counts using Prisma
    npx tsx -e "
    import { PrismaClient } from '@prisma/client';
    const prisma = new PrismaClient();
    async function showStats() {
        const total = await prisma.article.count();
        const draft = await prisma.article.count({ where: { status: 'draft' } });
        const published = await prisma.article.count({ where: { status: 'published' } });
        const featured = await prisma.article.count({ where: { featured: true } });
        const tutorial = await prisma.article.count({ where: { category: 'tutorial' } });
        
        console.log(\`📖 Total Articles: \${total}\`);
        console.log(\`📝 Draft Articles: \${draft}\`);
        console.log(\`✅ Published Articles: \${published}\`);
        console.log(\`⭐ Featured Articles: \${featured}\`);
        console.log(\`🎓 Tutorial Articles: \${tutorial}\`);
        
        await prisma.\$disconnect();
    }
    showStats().catch(console.error);
    "
    
    echo ""
    echo "🚀 Next Steps:"
    echo "=============="
    echo "1. 📝 Develop full content for each tutorial article"
    echo "2. 🎨 Add featured images and visual elements"
    echo "3. 🔗 Create learning paths and article connections"
    echo "4. 📱 Test the tutorial articles in the classroom interface"
    echo "5. ✅ Change status from 'draft' to 'published' when ready"
    echo ""
    echo "💡 Tip: Use 'npx prisma studio' to view and manage articles in browser"
    echo ""
    echo "🎊 Happy coding and teaching! Let's make learning fun! ✨"
    
else
    echo ""
    echo "❌ Tutorial articles seeding failed!"
    echo "Please check the error messages above and try again."
    exit 1
fi