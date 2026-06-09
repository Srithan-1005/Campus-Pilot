import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');

    let tickets;

    if (studentId) {
      tickets = await prisma.supportTicket.findMany({
        where: { studentId },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Admin request - fetch all tickets
      tickets = await prisma.supportTicket.findMany({
        where: status ? { status } : undefined,
        include: {
          student: {
            select: {
              fullName: true,
              studentCode: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    return NextResponse.json({ success: true, tickets });
  } catch (error: any) {
    console.error('Tickets GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, title, description, category, priority } = body;

    if (!studentId || !title || !description || !category || !priority) {
      return NextResponse.json(
        { error: 'studentId, title, description, category, and priority are required' },
        { status: 400 }
      );
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        studentId,
        title,
        description,
        category,
        priority,
        status: 'OPEN'
      }
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    console.error('Tickets POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { ticketId, status, resolutionNotes } = body;

    if (!ticketId || !status) {
      return NextResponse.json(
        { error: 'ticketId and status are required' },
        { status: 400 }
      );
    }

    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status,
        resolutionNotes,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    console.error('Tickets PUT API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
