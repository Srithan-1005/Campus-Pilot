import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const actor = await getSessionUser();
    if (!actor || (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const roles = await prisma.role.findMany();
    // Default system roles fallback
    if (roles.length === 0) {
      const defaultRoles = [
        { id: 'role-sa', name: 'SUPER_ADMIN', description: 'System-wide owner with complete permissions' },
        { id: 'role-ad', name: 'ADMIN', description: 'Institutional administrative manager' },
        { id: 'role-tr', name: 'TEACHER', description: 'Academic instructor and grader' },
        { id: 'role-st', name: 'STUDENT', description: 'Campus attendee and service consumer' },
        { id: 'role-pt', name: 'PARENT', description: 'Student guardian' },
      ];
      return NextResponse.json({ success: true, roles: defaultRoles });
    }

    return NextResponse.json({ success: true, roles });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const actor = await getSessionUser();
    if (!actor || actor.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only Super Administrators can create roles' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Role name is required' }, { status: 400 });
    }

    const exists = await prisma.role.findUnique({
      where: { name }
    });

    if (exists) {
      return NextResponse.json({ error: 'Role already exists' }, { status: 400 });
    }

    const newRole = await prisma.role.create({
      data: { name, description }
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: actor.id,
        action: 'CREATE_ROLE',
        metadataJson: JSON.stringify({ name }),
      }
    });

    return NextResponse.json({ success: true, role: newRole });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
