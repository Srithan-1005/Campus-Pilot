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

    const records = await prisma.attendanceRecord.findMany({
      where: { studentId },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json({ success: true, records });
  } catch (error: any) {
    console.error('Attendance GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, date, status, subjectId, subjectName } = body;

    if (!studentId || !date || !status || !subjectId) {
      return NextResponse.json(
        { error: 'studentId, date, status, and subjectId are required' },
        { status: 400 }
      );
    }

    const parsedDate = new Date(date);

    // Look for an existing record on that day for that subject
    // We can define day range boundaries
    const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999));

    const existingRecord = await prisma.attendanceRecord.findFirst({
      where: {
        studentId,
        subjectId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    let record;
    if (existingRecord) {
      record = await prisma.attendanceRecord.update({
        where: { id: existingRecord.id },
        data: { status }
      });
    } else {
      record = await prisma.attendanceRecord.create({
        data: {
          studentId,
          date: new Date(date),
          status,
          subjectId,
          subjectName: subjectName || 'Course Subject'
        }
      });
    }

    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    console.error('Attendance POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
