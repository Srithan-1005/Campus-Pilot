import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await getSessionUser();
    if (!actor || actor.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only Super Administrators can modify roles' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    const updated = await prisma.role.update({
      where: { id },
      data: {
        name: name || role.name,
        description: description !== undefined ? description : role.description,
      }
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: actor.id,
        action: 'UPDATE_ROLE',
        metadataJson: JSON.stringify({ roleId: id, name: updated.name }),
      }
    });

    return NextResponse.json({ success: true, role: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
