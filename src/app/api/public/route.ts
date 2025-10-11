import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const highlightOnly = searchParams.get('highlight') === 'true'

  try {
    switch (type) {
      case 'activities':
        const activities = await prisma.activity.findMany({
          where: {
            isActive: true,
            ...(highlightOnly ? { showOnHomepage: true } : {}),
          },
          orderBy: { date: 'asc' },
          take: highlightOnly ? 6 : 10
        })
        return NextResponse.json({
          success: true,
          data: activities.map(activity => ({
            id: activity.id,
            title: activity.title,
            description: activity.description,
            date: activity.date.toISOString().split('T')[0],
              time: '09:00', // Default time
              location: activity.location,
              capacity: activity.capacity,
              participants: activity.registered,
              category: 'workshop'
            }))
        })
        
      case 'announcements':
        const announcements = await prisma.announcement.findMany({
          where: {
            isActive: true,
            ...(highlightOnly ? { showOnHomepage: true } : {}),
          },
          orderBy: { publishDate: 'desc' },
          take: highlightOnly ? 6 : 5
        })
        return NextResponse.json({
          success: true,
          data: announcements.map(announcement => ({
            id: announcement.id,
            title: announcement.title,
              content: announcement.content,
              type: announcement.type,
              publishedAt: announcement.publishDate.toISOString().split('T')[0]
            }))
        })
        
      case 'gallery':
        const gallery = await prisma.gallery.findMany({
          where: {
            isActive: true,
            ...(highlightOnly ? { showOnHomepage: true } : {}),
          },
          orderBy: { createdAt: 'desc' },
          take: highlightOnly ? 9 : 8
        })
        return NextResponse.json({
          success: true,
          data: gallery.map(item => ({
            id: item.id,
            title: item.title,
            image: item.imageUrl,
            category: item.category,
            description: item.description
          }))
        })
        
      case 'stats':
        const totalRegistrations = await prisma.registration.count()
        const totalActivities = await prisma.activity.count({ where: { isActive: true } })
        const totalAnnouncements = await prisma.announcement.count({ where: { isActive: true } })
        const totalGallery = await prisma.gallery.count({ where: { isActive: true } })
        
        return NextResponse.json({
          success: true,
          data: {
            totalMembers: totalRegistrations,
            activeProjects: totalActivities,
            completedWorkshops: totalAnnouncements,
            achievements: totalGallery
          }
        })
        
      default:
        // Return all data for homepage
        const selectedActivities = await prisma.activity.findMany({
          where: { isActive: true, showOnHomepage: true },
          orderBy: { date: 'asc' },
          take: 3
        })
        const activitiesData = selectedActivities.length > 0
          ? selectedActivities
          : await prisma.activity.findMany({
              where: { isActive: true },
              orderBy: { date: 'asc' },
              take: 3
            })

        const selectedAnnouncements = await prisma.announcement.findMany({
          where: { isActive: true, showOnHomepage: true },
          orderBy: { publishDate: 'desc' },
          take: 3
        })
        const announcementsData = selectedAnnouncements.length > 0
          ? selectedAnnouncements
          : await prisma.announcement.findMany({
              where: { isActive: true },
              orderBy: { publishDate: 'desc' },
              take: 3
            })

        const selectedGallery = await prisma.gallery.findMany({
          where: { isActive: true, showOnHomepage: true },
          orderBy: { createdAt: 'desc' },
          take: 4
        })
        const galleryData = selectedGallery.length > 0
          ? selectedGallery
          : await prisma.gallery.findMany({
              where: { isActive: true },
              orderBy: { createdAt: 'desc' },
              take: 4
            })

        const statsData = {
          totalMembers: await prisma.registration.count(),
          activeProjects: await prisma.activity.count({ where: { isActive: true } }),
          completedWorkshops: 45,
          achievements: 12
        }
        
        return NextResponse.json({
          success: true,
          data: {
            activities: activitiesData.map(activity => ({
              id: activity.id,
              title: activity.title,
              description: activity.description,
              date: activity.date.toISOString().split('T')[0],
              time: '09:00',
              location: activity.location,
              capacity: activity.capacity,
              participants: activity.registered,
              category: 'workshop'
            })),
            announcements: announcementsData.map(announcement => ({
              id: announcement.id,
              title: announcement.title,
              content: announcement.content,
              type: announcement.type,
              publishedAt: announcement.publishDate.toISOString().split('T')[0]
            })),
            gallery: galleryData.map(item => ({
              id: item.id,
              title: item.title,
              image: item.imageUrl,
              category: item.category,
              description: item.description
            })),
            stats: statsData
          }
        })
    }
  } catch (error) {
    console.error('Error fetching public data:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
