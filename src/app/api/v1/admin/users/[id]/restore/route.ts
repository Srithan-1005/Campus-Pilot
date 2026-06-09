import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await getSessionUser();
    if (!actor || (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const restoredUser = await prisma.user.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        deletedAt: null
      }
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: actor.id,
        action: 'RESTORE_USER',
        targetUserId: user.id,
        metadataJson: JSON.stringify({ email: user.email }),
      }
    });

    return NextResponse.json({ success: true, user: restoredUser });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
