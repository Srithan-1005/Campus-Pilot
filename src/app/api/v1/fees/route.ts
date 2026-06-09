import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let studentId = searchParams.get('studentId');

    if (!studentId) {
      const alex = await prisma.studentProfile.findFirst({
        where: { studentCode: 'STU001' }
      });
      if (alex) {
        studentId = alex.id;
      } else {
        return NextResponse.json({ error: 'No student found' }, { status: 404 });
      }
    }

    const fees = await prisma.feeAssignment.findMany({
      where: { studentId },
      orderBy: { dueDate: 'asc' }
    });

    return NextResponse.json({ success: true, fees });
  } catch (error: any) {
    console.error('Fees GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Simulated payment gateway gateway processing
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { feeId, amountPaid } = body;

    if (!feeId || amountPaid === undefined || amountPaid <= 0) {
      return NextResponse.json(
        { error: 'feeId and valid positive amountPaid are required' },
        { status: 400 }
      );
    }

    const fee = await prisma.feeAssignment.findUnique({
      where: { id: feeId }
    });

    if (!fee) {
      return NextResponse.json({ error: 'Fee assignment not found' }, { status: 404 });
    }

    const newAmountPaid = fee.amountPaid + amountPaid;
    let status = 'PENDING';
    if (newAmountPaid >= fee.amountDue) {
      status = 'PAID';
    } else if (newAmountPaid > 0) {
      status = 'PARTIAL';
    }

    const updatedFee = await prisma.feeAssignment.update({
      where: { id: feeId },
      data: {
        amountPaid: Math.min(newAmountPaid, fee.amountDue),
        status
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Payment completed successfully (Sandbox simulated)',
      fee: updatedFee
    });
  } catch (error: any) {
    console.error('Fees POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
