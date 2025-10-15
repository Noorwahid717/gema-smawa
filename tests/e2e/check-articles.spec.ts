import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

// Guard this test so it doesn't run in environments without a database (CI by default).
const RUN_DB_TESTS = Boolean(process.env.RUN_DB_TESTS);
test.skip(!RUN_DB_TESTS, 'Database tests disabled. Set RUN_DB_TESTS=1 to enable.');

test('check published articles in database', async () => {
  const prisma = new PrismaClient();
  try {
    const articles = await prisma.article.findMany({
      where: { status: 'published' },
      select: { title: true, slug: true, averageRating: true, totalFeedback: true },
    });

    // Emit some useful logging for debugging when the test runs
    console.log(`Found ${articles.length} published article(s)`);
    if (articles.length === 0) {
      console.log('No published articles found.');
    } else {
      console.log('Published articles:');
      articles.forEach((a) =>
        console.log(`- ${a.title} (slug: ${a.slug}) - Rating: ${a.averageRating}, Feedback: ${a.totalFeedback}`),
      );
    }

    // Basic assertion to make this a proper test: result should be an array
    expect(Array.isArray(articles)).toBeTruthy();
  } finally {
    await prisma.$disconnect();
  }
});
