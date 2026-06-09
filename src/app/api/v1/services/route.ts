import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // canteen, library, transport, hostel
    const studentId = searchParams.get('studentId');

    if (!type) {
      return NextResponse.json({ error: 'type parameter is required' }, { status: 400 });
    }

    if (type === 'canteen') {
      if (studentId) {
        const orders = await prisma.canteenOrder.findMany({
          where: { studentId },
          orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ success: true, orders });
      } else {
        // Return food catalog
        const menu = [
          { id: 'c1', name: 'Veg Burger', price: 2.50, category: 'SNACKS', image: '🍔', available: true },
          { id: 'c2', name: 'French Fries', price: 1.50, category: 'SNACKS', image: '🍟', available: true },
          { id: 'c3', name: 'Paneer Pizza', price: 4.50, category: 'MEALS', image: '🍕', available: true },
          { id: 'c4', name: 'Chiken Sandwich', price: 3.00, category: 'SNACKS', image: '🥪', available: true },
          { id: 'c5', name: 'Coca Cola', price: 1.00, category: 'DRINKS', image: '🥤', available: true },
          { id: 'c6', name: 'Cappuccino', price: 1.80, category: 'DRINKS', image: '☕', available: true },
        ];
        return NextResponse.json({ success: true, menu });
      }
    }

    if (type === 'library') {
      if (studentId) {
        const books = await prisma.bookRequest.findMany({
          where: { studentId },
          orderBy: { dueDate: 'asc' }
        });
        return NextResponse.json({ success: true, books });
      } else {
        // Return library catalog
        const catalog = [
          { id: 'b1', title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest', available: 5 },
          { id: 'b2', title: 'Database System Concepts', author: 'Silberschatz, Korth, Sudarshan', available: 3 },
          { id: 'b3', title: 'Computer Networking', author: 'Kurose, Ross', available: 2 },
          { id: 'b4', title: 'Design Patterns', author: 'Gang of Four', available: 4 },
          { id: 'b5', title: 'Artificial Intelligence: A Modern Approach', author: 'Russell, Norvig', available: 1 },
        ];
        return NextResponse.json({ success: true, catalog });
      }
    }

    if (type === 'transport') {
      // Mock bus routes
      const routes = [
        { id: 'r1', routeName: 'Route 1A - North Campus Express', driverName: 'Robert Lang', driverPhone: '+1 (555) 019-2831', status: 'ON_TIME', delayMinutes: 0, currentStop: 'Main Gate' },
        { id: 'r2', routeName: 'Route 2B - South Suburbs Hub', driverName: 'Michael Chang', driverPhone: '+1 (555) 014-9844', status: 'DELAYED', delayMinutes: 12, currentStop: 'City Center Mall' },
        { id: 'r3', routeName: 'Route 3C - West Hostel Shuttle', driverName: 'David Miller', driverPhone: '+1 (555) 018-8744', status: 'ON_TIME', delayMinutes: 0, currentStop: 'Girls Hostel B' },
        { id: 'r4', routeName: 'Route 4D - East Metro Station Link', driverName: 'Sarah Connor', driverPhone: '+1 (555) 012-3211', status: 'DELAYED', delayMinutes: 5, currentStop: 'Metro Crossing' },
      ];
      return NextResponse.json({ success: true, routes });
    }

    if (type === 'hostel') {
      // Mock hostel rooms and allocations
      const rooms = [
        { block: 'Block A (Boys)', occupancy: '84%', roomsAvailable: 12, rating: '4.2/5' },
        { block: 'Block B (Boys)', occupancy: '92%', roomsAvailable: 4, rating: '3.8/5' },
        { block: 'Block C (Girls)', occupancy: '75%', roomsAvailable: 22, rating: '4.5/5' },
        { block: 'Block D (Girls)', occupancy: '88%', roomsAvailable: 8, rating: '4.1/5' },
      ];
      return NextResponse.json({ success: true, rooms });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error: any) {
    console.error('Services GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const body = await request.json();

    if (!type) {
      return NextResponse.json({ error: 'type parameter is required' }, { status: 400 });
    }

    if (type === 'canteen') {
      const { studentId, items, total } = body;
      if (!studentId || !items || !total) {
        return NextResponse.json({ error: 'studentId, items, and total are required' }, { status: 400 });
      }

      const order = await prisma.canteenOrder.create({
        data: {
          studentId,
          itemsJson: JSON.stringify(items),
          total: parseFloat(total),
          status: 'PENDING'
        }
      });
      return NextResponse.json({ success: true, order });
    }

    if (type === 'library') {
      const { studentId, bookTitle, author } = body;
      if (!studentId || !bookTitle || !author) {
        return NextResponse.json({ error: 'studentId, bookTitle, and author are required' }, { status: 400 });
      }

      const today = new Date();
      const dueDate = new Date();
      dueDate.setDate(today.getDate() + 14); // Due in 14 days

      const requestBook = await prisma.bookRequest.create({
        data: {
          studentId,
          bookTitle,
          author,
          status: 'REQUESTED',
          dueDate
        }
      });
      return NextResponse.json({ success: true, book: requestBook });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error: any) {
    console.error('Services POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
