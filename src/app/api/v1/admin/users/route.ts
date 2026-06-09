import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, hashPassword } from '@/lib/auth';

// GET /api/v1/admin/users - List users with searching, filtering, and paging
export async function GET(request: Request) {
  try {
    const actor = await getSessionUser();
    if (!actor || (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';
    const department = searchParams.get('department') || '';

    // Build Prisma query condition
    const whereCondition: any = {
      deletedAt: null, // Default to soft delete filter
    };

    if (search) {
      whereCondition.OR = [
        { email: { contains: search } },
        { fullName: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    if (role) {
      whereCondition.role = role;
    }

    if (status) {
      whereCondition.status = status;
    } else {
      // By default, exclude DELETED users unless requested
      whereCondition.status = { not: 'DELETED' };
    }

    if (department) {
      whereCondition.OR = [
        { studentProfile: { department: { code: department } } },
        { teacherProfile: { departmentId: department } },
        { adminProfile: { department: department } }
      ];
    }

    const users = await prisma.user.findMany({
      where: whereCondition,
      include: {
        studentProfile: {
          include: {
            department: true
          }
        },
        adminProfile: true,
        teacherProfile: true,
        parentProfile: {
          include: {
            student: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error('List users API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/v1/admin/users - Add a new user with subprofiles based on role
export async function POST(request: Request) {
  try {
    const actor = await getSessionUser();
    if (!actor || (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized administrative access required' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      email, 
      phone, 
      password, 
      fullName, 
      role, 
      status = 'ACTIVE',
      // Subprofile dynamic fields
      studentCode, departmentId, courseId, currentSemester = 1, section = 'A', admissionYear = 2023, guardianName = '', guardianPhone = '',
      employeeId, designation, subjectsAssigned = '',
      roleTitle, department, permissionsJson = '[]',
      linkedStudentId, relationship = 'GUARDIAN', occupation = ''
    } = body;

    // Validate email & passwords
    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ error: 'Missing required credentials' }, { status: 400 });
    }

    // Role-based privilege checks
    if ((role === 'ADMIN' || role === 'SUPER_ADMIN') && actor.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only Super Administrators can provision administrative accounts' }, { status: 403 });
    }

    // Check unique email and phone constraints
    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists) {
      return NextResponse.json({ error: 'A user account with this email already exists' }, { status: 400 });
    }

    if (phone) {
      const phoneExists = await prisma.user.findFirst({ where: { phone } });
      if (phoneExists) {
        return NextResponse.json({ error: 'A user account with this phone number already exists' }, { status: 400 });
      }
    }

    // Unique checks for roll number or employee id
    if (role === 'STUDENT' && studentCode) {
      const codeExists = await prisma.studentProfile.findUnique({ where: { studentCode } });
      if (codeExists) {
        return NextResponse.json({ error: 'Roll code must be unique' }, { status: 400 });
      }
    }

    if (role === 'TEACHER' && employeeId) {
      const codeExists = await prisma.teacherProfile.findUnique({ where: { employeeId } });
      if (codeExists) {
        return NextResponse.json({ error: 'Teacher employee ID must be unique' }, { status: 400 });
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user in transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          phone,
          fullName,
          passwordHash,
          role,
          status,
          createdBy: actor.id,
        }
      });

      if (role === 'STUDENT') {
        await tx.studentProfile.create({
          data: {
            userId: user.id,
            studentCode: studentCode || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
            fullName,
            departmentId: departmentId || 'cse-dept-id', // default or custom
            courseId: courseId || 'B.Tech',
            currentSemester: Number(currentSemester),
            section,
            admissionYear: Number(admissionYear),
            guardianName,
            guardianPhone,
          }
        });
      } else if (role === 'TEACHER') {
        await tx.teacherProfile.create({
          data: {
            userId: user.id,
            employeeId: employeeId || `TCH-${Math.floor(1000 + Math.random() * 9000)}`,
            departmentId: departmentId || 'cse-dept-id',
            designation: designation || 'Lecturer',
            subjectsAssigned: subjectsAssigned || '',
          }
        });
      } else if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        await tx.adminProfile.create({
          data: {
            userId: user.id,
            fullName,
            department: department || 'Operations',
            roleTitle: roleTitle || 'Administrator',
            employeeId: employeeId || `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
            designation: designation || 'Officer',
            permissionsJson: permissionsJson || '[]',
          }
        });
      } else if (role === 'PARENT') {
        await tx.parentProfile.create({
          data: {
            userId: user.id,
            linkedStudentId: linkedStudentId,
            relationship,
            occupation,
          }
        });
      }

      return user;
    });

    // Save to Audit Log
    await prisma.auditLog.create({
      data: {
        actorUserId: actor.id,
        action: 'CREATE_USER',
        targetUserId: newUser.id,
        metadataJson: JSON.stringify({ role, email, status }),
      }
    });

    const { passwordHash: _, ...result } = newUser;
    return NextResponse.json({ success: true, user: result });
  } catch (error: any) {
    console.error('Create user API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
