import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { createVoiceClone } from '../../lib/bland';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB max for audio files
    });

    const [fields, files] = await form.parse(req);
    const audioFile = Array.isArray(files.audio) ? files.audio[0] : files.audio;
    const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;

    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    if (!name) {
      return res.status(400).json({ error: 'No voice name provided' });
    }

    // Read audio file buffer
    const fileBuffer = fs.readFileSync(audioFile.filepath);
    
    // Convert buffer to Blob
    const audioBlob = new Blob([fileBuffer], { type: 'audio/wav' });
    
    // Create voice clone using Bland AI API
    const voiceId = await createVoiceClone(audioBlob, name);
    
    // Clean up temp file
    fs.unlinkSync(audioFile.filepath);
    
    res.status(200).json({ 
      voiceId, 
      name 
    });
  } catch (error) {
    console.error('Voice cloning error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to create voice clone'
    });
  }
}