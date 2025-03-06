import type { NextApiRequest, NextApiResponse } from 'next';
import { getAgent, deleteAgent } from '../../../db';
import { deleteAgent as deleteBlandAgent } from '../../../lib/bland';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid agent ID' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const agent = await getAgent(id);
        
        if (!agent) {
          return res.status(404).json({ error: 'Agent not found' });
        }
        
        res.status(200).json({ agent });
      } catch (error) {
        console.error('Error getting agent:', error);
        res.status(500).json({ 
          error: error instanceof Error ? error.message : 'Failed to get agent' 
        });
      }
      break;

    case 'DELETE':
      try {
        // First delete from Bland API
        try {
          await deleteBlandAgent(id);
        } catch (error) {
          console.warn('Error deleting from Bland API (continuing):', error);
        }
        
        // Then delete from database
        await deleteAgent(id);
        
        res.status(200).json({ success: true });
      } catch (error) {
        console.error('Error deleting agent:', error);
        res.status(500).json({ 
          error: error instanceof Error ? error.message : 'Failed to delete agent' 
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}