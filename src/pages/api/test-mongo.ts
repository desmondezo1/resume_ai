import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../db/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { db } = await connectToDatabase();
    const collections = await db.listCollections().toArray();
    res.status(200).json({ 
      success: true, 
      message: 'Connected to MongoDB successfully',
      collections: collections.map(c => c.name) 
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to connect to MongoDB',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}