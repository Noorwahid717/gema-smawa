import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

const getThread = async (threadId: string) => {
  const thread = await prisma.discussionThread.findUnique({
    where: { id: threadId },
    include: { replies: true },
  });

  if (!thread) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(thread);
};

// GET: Get a single thread by ID
export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return getThread(id);
}

// PUT: Update a thread
export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const { title, content } = await req.json();
  const thread = await prisma.discussionThread.update({
    where: { id },
    data: { title, content },
  });
  return NextResponse.json(thread);
}

// DELETE: Delete a thread
export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  await prisma.discussionThread.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
