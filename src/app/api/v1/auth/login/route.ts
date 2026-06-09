import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { comparePassword, createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        adminProfile: true,
        teacherProfile: true,
        parentProfile: true,
      },
    });

    if (!user || user.status === 'DELETED') {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Account suspended. Please contact institutional support.' },
        { status: 403 }
      );
    }

    if (user.status === 'INACTIVE') {
      return NextResponse.json(
        { error: 'Account inactive. Please contact administration.' },
        { status: 403 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session cookie
    await createSession(user.id, user.role);

    // Write login activity to audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: 'USER_LOGIN',
        targetUserId: user.id,
        metadataJson: JSON.stringify({ ip: request.headers.get('x-forwarded-for') || '127.0.0.1' }),
      },
    });

    // Omit password hash in output
    const { passwordHash, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
