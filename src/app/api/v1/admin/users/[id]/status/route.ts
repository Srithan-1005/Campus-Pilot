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
    const body = await request.json();
    const { status } = body; // ACTIVE, INACTIVE, SUSPENDED, DELETED

    if (!status || !['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Admins cannot change admin/super admin status unless actor is super admin
    if ((user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && actor.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only Super Administrators can modify admin status' }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status }
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: actor.id,
        action: `CHANGE_USER_STATUS_${status}`,
        targetUserId: user.id,
        metadataJson: JSON.stringify({ oldStatus: user.status, newStatus: status }),
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
