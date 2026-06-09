import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await getSessionUser();
    if (!actor || actor.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only Super Administrators can assign permissions' }, { status: 403 });
    }

    const { id: roleId } = await params;
    const body = await request.json();
    const { permissionIds } = body; // Array of permission ID strings

    if (!permissionIds || !Array.isArray(permissionIds)) {
      return NextResponse.json({ error: 'Invalid permissions format' }, { status: 400 });
    }

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Update role permissions in link table
    await prisma.$transaction([
      prisma.rolePermission.deleteMany({
        where: { roleId }
      }),
      prisma.rolePermission.createMany({
        data: permissionIds.map(pId => ({
          roleId,
          permissionId: pId
        }))
      })
    ]);

    // Write audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: actor.id,
        action: 'UPDATE_ROLE_PERMISSIONS',
        metadataJson: JSON.stringify({ roleId, permissionCount: permissionIds.length }),
      }
    });

    return NextResponse.json({ success: true, message: 'Permissions updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
