import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: List all replies (optionally filter by threadId)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url!);
  const threadId = searchParams.get('threadId');
  const where = threadId ? { threadId } : {};
  const replies = await prisma.discussionReply.findMany({
    where,
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(replies);
}

// POST: Create a new reply
export async function POST(req: NextRequest) {
  const { threadId, authorId, authorName, content } = await req.json();
  if (!threadId || !authorId || !authorName || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const reply = await prisma.discussionReply.create({
    data: { threadId, authorId, authorName, content },
  });
  return NextResponse.json(reply);
}
