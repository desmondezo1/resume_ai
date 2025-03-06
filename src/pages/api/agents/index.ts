import type { NextApiRequest, NextApiResponse } from 'next';
import { listAgents, saveAgent } from '../../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const agents = await listAgents();
        res.status(200).json({ agents });
      } catch (error) {
        console.error('Error listing agents:', error);
        res.status(500).json({ 
          error: error instanceof Error ? error.message : 'Failed to list agents' 
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}