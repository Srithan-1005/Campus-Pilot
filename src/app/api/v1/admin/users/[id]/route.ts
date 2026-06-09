import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, hashPassword } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await getSessionUser();
    if (!actor || (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: { include: { department: true } },
        adminProfile: true,
        teacherProfile: true,
        parentProfile: { include: { student: true } }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return NextResponse.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await getSessionUser();
    if (!actor || (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { 
      fullName, email, phone, role, password, 
      // subprofile updates
      studentCode, departmentId, courseId, currentSemester, section, admissionYear, guardianName, guardianPhone,
      employeeId, designation, subjectsAssigned,
      roleTitle, department, permissionsJson,
      linkedStudentId, relationship, occupation
    } = body;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: true,
        adminProfile: true,
        teacherProfile: true,
        parentProfile: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Role-based privilege checks
    if ((user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'SUPER_ADMIN') && actor.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only Super Administrators can modify administrative accounts' }, { status: 403 });
    }

    // Prevent privilege escalation: check if user changes their own role
    if (user.id === actor.id && role && role !== user.role && actor.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'You cannot change your own role' }, { status: 403 });
    }

    const dataToUpdate: any = {};
    if (fullName) dataToUpdate.fullName = fullName;
    if (email) dataToUpdate.email = email;
    if (phone) dataToUpdate.phone = phone;
    if (role) dataToUpdate.role = role;
    if (password) {
      dataToUpdate.passwordHash = await hashPassword(password);
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: dataToUpdate
      });

      // Update appropriate profiles
      if (user.role === 'STUDENT' && user.studentProfile) {
        await tx.studentProfile.update({
          where: { id: user.studentProfile.id },
          data: {
            fullName: fullName || user.studentProfile.fullName,
            studentCode: studentCode || user.studentProfile.studentCode,
            departmentId: departmentId || user.studentProfile.departmentId,
            courseId: courseId || user.studentProfile.courseId,
            currentSemester: currentSemester !== undefined ? Number(currentSemester) : user.studentProfile.currentSemester,
            section: section || user.studentProfile.section,
            admissionYear: admissionYear !== undefined ? Number(admissionYear) : user.studentProfile.admissionYear,
            guardianName: guardianName || user.studentProfile.guardianName,
            guardianPhone: guardianPhone || user.studentProfile.guardianPhone,
          }
        });
      } else if (user.role === 'TEACHER' && user.teacherProfile) {
        await tx.teacherProfile.update({
          where: { id: user.teacherProfile.id },
          data: {
            employeeId: employeeId || user.teacherProfile.employeeId,
            departmentId: departmentId || user.teacherProfile.departmentId,
            designation: designation || user.teacherProfile.designation,
            subjectsAssigned: subjectsAssigned || user.teacherProfile.subjectsAssigned,
          }
        });
      } else if ((user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && user.adminProfile) {
        await tx.adminProfile.update({
          where: { id: user.adminProfile.id },
          data: {
            fullName: fullName || user.adminProfile.fullName,
            department: department || user.adminProfile.department,
            roleTitle: roleTitle || user.adminProfile.roleTitle,
            employeeId: employeeId || user.adminProfile.employeeId,
            designation: designation || user.adminProfile.designation,
            permissionsJson: permissionsJson || user.adminProfile.permissionsJson,
          }
        });
      } else if (user.role === 'PARENT' && user.parentProfile) {
        await tx.parentProfile.update({
          where: { id: user.parentProfile.id },
          data: {
            linkedStudentId: linkedStudentId || user.parentProfile.linkedStudentId,
            relationship: relationship || user.parentProfile.relationship,
            occupation: occupation || user.parentProfile.occupation,
          }
        });
      }
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: actor.id,
        action: 'EDIT_USER',
        targetUserId: user.id,
        metadataJson: JSON.stringify({ updatedFields: Object.keys(dataToUpdate) }),
      }
    });

    return NextResponse.json({ success: true, message: 'User updated successfully' });
  } catch (error: any) {
    console.error('Update user API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await getSessionUser();
    if (!actor || (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Role-based privilege checks
    if ((user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && actor.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only Super Administrators can soft-delete administrative accounts' }, { status: 403 });
    }

    // Soft delete
    await prisma.user.update({
      where: { id },
      data: {
        status: 'DELETED',
        deletedAt: new Date(),
      }
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: actor.id,
        action: 'SOFT_DELETE_USER',
        targetUserId: user.id,
        metadataJson: JSON.stringify({ email: user.email }),
      }
    });

    return NextResponse.json({ success: true, message: 'User soft-deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
