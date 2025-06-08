import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongoose';
import Place from '@/models/Place';
import { CreatePlaceData } from '@/types/place';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();
    console.log('Connected to MongoDB');

    // Check raw collection data
    const db = mongoose.connection.db;

    if (!db) {
      console.error('Database connection is not established');
      return NextResponse.json(
        { error: 'Database connection is not established' },
        { status: 500 }
      );
    }
    const rawCount = await db.collection('places').countDocuments();
    console.log('Raw collection count:', rawCount);

    const rawSample = await db.collection('places').findOne();
    console.log('Raw sample document:', JSON.stringify(rawSample, null, 2));

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const query: Record<string, unknown> = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
      ];
    }

    console.log('Mongoose query:', query);
    const places = await Place.find(query).sort({ createdAt: -1 });

    console.log('Mongoose found places:', places.length);
    console.log('Sample place from Mongoose:', places[0]);

    return NextResponse.json({ places }, { status: 200 });
  } catch (error) {
    console.error('Error fetching places:', error);
    return NextResponse.json(
      { error: 'Failed to fetch places' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectMongoDB();

    const body: CreatePlaceData = await request.json();

    if (!body.name || !body.description || !body.category || !body.location) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: name, description, category, location',
        },
        { status: 400 }
      );
    }

    const place = await Place.create({
      name: body.name,
      description: body.description,
      category: body.category,
      location: body.location,
      images: body.images || [],
      submittedBy: body.submittedBy || 'Anonymous',
    });

    return NextResponse.json({ place }, { status: 201 });
  } catch (error) {
    console.error('Error creating place:', error);
    return NextResponse.json(
      { error: 'Failed to create place' },
      { status: 500 }
    );
  }
}
