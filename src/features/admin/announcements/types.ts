export type AnnouncementType = 'info' | 'warning' | 'success' | 'error'

export interface Announcement {
  id: string
  title: string
  content: string
  type: AnnouncementType
  isActive: boolean
  showOnHomepage: boolean
  publishDate: string
  createdAt: string
}

export interface AnnouncementFormData {
  title: string
  content: string
  type: AnnouncementType
  isActive: boolean
  showOnHomepage: boolean
}

export interface AnnouncementTypeOption {
  value: AnnouncementType
  label: string
  badgeClass: string
}
