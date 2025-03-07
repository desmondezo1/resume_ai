// pages/api/db-handler.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { saveAgent } from '../../db/mongodb'; // Your MongoDB utility function

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { agent_id, name, resumeText, agentConfig } = req.body;

    // Save agent to MongoDB
    const agentId = await saveAgent(agent_id, name, resumeText, agentConfig);


    // Return the agent ID
    res.status(200).json({ agentId });
  } catch (error) {
    console.error('Database operation error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to perform database operation'
    });
  }
}