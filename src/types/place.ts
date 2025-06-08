import { ObjectId } from 'mongodb'

export interface Place {
  _id?: ObjectId
  name: string
  description: string
  category: string
  location: {
    address: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  images: string[]
  submittedBy: string
  createdAt: Date
  updatedAt: Date
}

export interface CreatePlaceData {
  name: string
  description: string
  category: string
  location: {
    address: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  images?: string[]
  submittedBy?: string
}

export const PLACE_CATEGORIES = [
  'Restaurant',
  'Cafe',
  'Park',
  'Dog Walking',
  'Forest',
  'Museum',
  'Shopping',
  'Viewpoint',
  'Beach',
  'Other'
] as const

export type PlaceCategory = typeof PLACE_CATEGORIES[number]