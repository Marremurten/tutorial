import { NextRequest, NextResponse } from 'next/server'
import connectMongoDB from '@/lib/mongoose'
import Place from '@/models/Place'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoDB()
    
    const place = await Place.findById(params.id)
    
    if (!place) {
      return NextResponse.json(
        { error: 'Place not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ place }, { status: 200 })
  } catch (error) {
    console.error('Error fetching place:', error)
    return NextResponse.json(
      { error: 'Failed to fetch place' },
      { status: 500 }
    )
  }
}