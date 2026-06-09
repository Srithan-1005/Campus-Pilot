import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-campus-pilot-key-2026';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  // If passwords match plaintext (for backward compatibility with seeded plain text passwords)
  if (password === hash) return true;
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string, role: string) {
  const token = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
  const cookieStore = await cookies();
  cookieStore.set('session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  return token;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session_token');
}

export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    if (!decoded.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        studentProfile: {
          include: {
            department: true,
          }
        },
        adminProfile: true,
        teacherProfile: true,
        parentProfile: {
          include: {
            student: true,
          }
        },
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}
