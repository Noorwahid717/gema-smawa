import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: List all threads
export async function GET() {
  const threads = await prisma.discussionThread.findMany({
    orderBy: { createdAt: 'desc' },
    include: { replies: true },
  });
  return NextResponse.json(threads);
}

// POST: Create a new thread
export async function POST(req: NextRequest) {
  const { title, authorId, authorName, content } = await req.json();
  if (!title || !authorId || !authorName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const thread = await prisma.discussionThread.create({
    data: { title, authorId, authorName, content },
  });
  return NextResponse.json(thread);
}
