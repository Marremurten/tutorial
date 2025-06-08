import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongoose';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectMongoDB();
    
    // Get the raw collection
    const db = mongoose.connection.db;
    const collection = db?.collection('places');
    
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 500 });
    }
    
    const rawPlaces = await collection.find({}).limit(2).toArray();
    
    console.log('Raw places from collection:', JSON.stringify(rawPlaces, null, 2));
    
    return NextResponse.json({ 
      message: 'Check server console for raw data',
      count: rawPlaces.length,
      sample: rawPlaces[0]
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: 'Debug failed' }, { status: 500 });
  }
}