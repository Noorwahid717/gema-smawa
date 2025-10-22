import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Get a single thread by ID
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const thread = await prisma.discussionThread.findUnique({
    where: { id },
    include: { replies: true },
  });
  if (!thread) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(thread);
}

// PUT: Update a thread
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { title, content } = await req.json();
  const thread = await prisma.discussionThread.update({
    where: { id },
    data: { title, content },
  });
  return NextResponse.json(thread);
}

// DELETE: Delete a thread
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.discussionThread.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
