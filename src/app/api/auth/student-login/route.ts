import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { studentId, password } = await request.json()

    console.log('Student login attempt:', { studentId, hasPassword: !!password })

    if (!studentId || !password) {
      return NextResponse.json(
        { success: false, error: 'Student ID and password are required' },
        { status: 400 }
      )
    }

    // Find student by studentId
    const student = await prisma.student.findUnique({
      where: {
        studentId: studentId
      }
    })

    console.log('Student found:', !!student, student ? { id: student.id, studentId: student.studentId, status: student.status } : null)

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 401 }
      )
    }

    if (student.status.toLowerCase() !== 'active') {
      console.log('Student account not active:', student.status)
      return NextResponse.json(
        { success: false, error: 'Student account is not active' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, student.password)
    console.log('Password validation:', isPasswordValid)

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Update last login
    await prisma.student.update({
      where: { id: student.id },
      data: { lastLoginAt: new Date() }
    })

    console.log('Student login successful:', student.id)

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        studentId: student.studentId,
        fullName: student.fullName,
        email: student.email,
        class: student.class
      }
    })

  } catch (error) {
    console.error('Student login API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}