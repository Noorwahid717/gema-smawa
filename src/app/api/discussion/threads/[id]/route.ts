import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Get a single thread by ID
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const thread = await prisma.discussionThread.findUnique({
    where: { id: params.id },
    include: { replies: true },
  });
  if (!thread) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(thread);
}

// PUT: Update a thread
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { title, content } = await req.json();
  const thread = await prisma.discussionThread.update({
    where: { id: params.id },
    data: { title, content },
  });
  return NextResponse.json(thread);
}

// DELETE: Delete a thread
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.discussionThread.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
