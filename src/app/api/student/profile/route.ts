import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      )
    }

    const student = await prisma.student.findUnique({
      where: { studentId: studentId },
      select: {
        id: true,
        studentId: true,
        email: true,
        fullName: true,
        class: true,
        phone: true,
        address: true,
        parentName: true,
        parentPhone: true,
        profileImage: true,
        joinedAt: true,
        lastLoginAt: true,
        createdAt: true
      }
    })

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: student
    })

  } catch (error) {
    console.error('Student profile GET error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, fullName, phone, address, parentName, parentPhone } = body

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      )
    }

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { studentId: studentId }
    })

    if (!existingStudent) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }

    // Update student profile
    const updatedStudent = await prisma.student.update({
      where: { studentId: studentId },
      data: {
        fullName: fullName || existingStudent.fullName,
        phone: phone || null,
        address: address || null,
        parentName: parentName || null,
        parentPhone: parentPhone || null,
        updatedAt: new Date()
      },
      select: {
        id: true,
        studentId: true,
        email: true,
        fullName: true,
        class: true,
        phone: true,
        address: true,
        parentName: true,
        parentPhone: true,
        profileImage: true,
        joinedAt: true,
        lastLoginAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedStudent,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Student profile PUT error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}