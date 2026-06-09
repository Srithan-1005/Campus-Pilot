import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const actor = await getSessionUser();
    if (!actor || (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized administrative access required' }, { status: 403 });
    }

    const body = await request.json();
    const { users } = body; // Array of user objects parsed from CSV

    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'No user data provided' }, { status: 400 });
    }

    let importedCount = 0;
    const errors: string[] = [];

    // Loop through users to create them
    for (const item of users) {
      const { email, phone, password = 'TempPassword123!', fullName, role = 'STUDENT', studentCode, departmentCode = 'CSE', courseId = 'B.Tech' } = item;

      if (!email || !fullName) {
        errors.push(`Skipped row: missing email or full name`);
        continue;
      }

      // Check privilege escalation
      if ((role === 'ADMIN' || role === 'SUPER_ADMIN') && actor.role !== 'SUPER_ADMIN') {
        errors.push(`Skipped: Only Super Administrators can bulk-import administrative accounts (${email})`);
        continue;
      }

      // Check unique constraints
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) {
        errors.push(`Skipped: Email ${email} already exists`);
        continue;
      }

      try {
        const passwordHash = await hashPassword(password);
        
        // Find department by code
        const dept = await prisma.department.findUnique({
          where: { code: departmentCode }
        });

        const deptId = dept?.id || 'cse-dept-id';

        await prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              email,
              phone: phone || null,
              fullName,
              passwordHash,
              role,
              status: 'ACTIVE',
              createdBy: actor.id,
            }
          });

          if (role === 'STUDENT') {
            await tx.studentProfile.create({
              data: {
                userId: user.id,
                studentCode: studentCode || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
                fullName,
                departmentId: deptId,
                courseId: courseId,
                currentSemester: 1,
                section: 'A',
                admissionYear: 2023,
                guardianName: '',
                guardianPhone: '',
              }
            });
          } else if (role === 'TEACHER') {
            await tx.teacherProfile.create({
              data: {
                userId: user.id,
                employeeId: `TCH-${Math.floor(1000 + Math.random() * 9000)}`,
                departmentId: deptId,
                designation: 'Faculty member',
                subjectsAssigned: '',
              }
            });
          } else if (role === 'PARENT') {
            await tx.parentProfile.create({
              data: {
                userId: user.id,
                linkedStudentId: '', // needs linking manually or through CSV roll link
                relationship: 'GUARDIAN',
                occupation: '',
              }
            });
          } else if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
            await tx.adminProfile.create({
              data: {
                userId: user.id,
                fullName,
                department: 'Administration',
                roleTitle: 'Staff Member',
                employeeId: `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
                designation: 'Officer',
                permissionsJson: '[]',
              }
            });
          }
        });

        importedCount++;
      } catch (err: any) {
        errors.push(`Error importing ${email}: ${err.message}`);
      }
    }

    // Write audit log for bulk action
    await prisma.auditLog.create({
      data: {
        actorUserId: actor.id,
        action: 'BULK_IMPORT_USERS',
        metadataJson: JSON.stringify({ count: importedCount, errorCount: errors.length }),
      }
    });

    return NextResponse.json({
      success: true,
      importedCount,
      errors
    });
  } catch (error: any) {
    console.error('Bulk import API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
