import type { NextApiRequest, NextApiResponse } from 'next';
import { getSessionToken } from '../../lib/bland';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { agentId } = req.body;
    
    if (!agentId) {
      return res.status(400).json({ error: 'Agent ID is required' });
    }
    
    const token = await getSessionToken(agentId);
    
    res.status(200).json({ token });
  } catch (error) {
    console.error('Token error:', error);
    res.status(500).json({ 
      error: 'Failed to get token',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}