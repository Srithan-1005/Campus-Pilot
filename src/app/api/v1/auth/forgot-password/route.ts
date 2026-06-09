import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.status === 'DELETED') {
      // For security, don't reveal if user does not exist
      return NextResponse.json({ success: true, message: 'If the email exists, a password reset link has been dispatched.' });
    }

    // In a production app, we would send a real email with a JWT reset token.
    // For this smart campus app, we'll return a simulated success payload along with a simulated reset token.
    const resetToken = `reset_${Math.random().toString(36).substring(2, 15)}`;
    
    // Log recovery request to audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        targetUserId: user.id,
        metadataJson: JSON.stringify({ resetToken }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'If the email exists, a password reset link has been dispatched.',
      // Providing token for simulator interface
      resetToken,
    });
  } catch (error: any) {
    console.error('Forgot password API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
