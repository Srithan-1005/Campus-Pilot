import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, token, newPassword } = await request.json();
    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Email and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.status === 'DELETED') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update password
    const hashed = await hashPassword(newPassword);
    await prisma.user.update({
      where: { email },
      data: { passwordHash: hashed },
    });

    // Log update action to audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: 'PASSWORD_RESET_SUCCESSFUL',
        targetUserId: user.id,
        metadataJson: JSON.stringify({ tokenUsed: token }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now login.',
    });
  } catch (error: any) {
    console.error('Reset password API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
