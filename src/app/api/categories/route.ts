import { NextResponse } from 'next/server'
import { PLACE_CATEGORIES } from '@/types/place'

export async function GET() {
  try {
    return NextResponse.json({ categories: PLACE_CATEGORIES }, { status: 200 })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}