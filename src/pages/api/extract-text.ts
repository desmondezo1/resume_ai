import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { extractTextFromFile, isResumeContent } from '../../lib/document-parser';
import { getFileExtension } from '../../lib/utils';

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
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Form data might include voiceId
    const voiceId = Array.isArray(fields.voiceId) ? fields.voiceId[0] : fields.voiceId;
    const voiceName = Array.isArray(fields.voiceName) ? fields.voiceName[0] : fields.voiceName;


    // Check file extension
    const extension = getFileExtension(file.originalFilename || '');
    const allowedExtensions = ['pdf', 'docx', 'doc', 'txt', 'rtf'];
    
    if (!allowedExtensions.includes(extension)) {
      return res.status(400).json({ 
        error: 'File type not supported', 
        isResume: false, 
        fileType: extension
      });
    }

 // Read file buffer
    const fileBuffer = fs.readFileSync(file.filepath);
    
    // Extract text from file
    const text = await extractTextFromFile(fileBuffer, file.originalFilename || 'document');
    
    // Check if it's a resume
    const isResume = isResumeContent(text);

    // Clean up temp file
    fs.unlinkSync(file.filepath);
    
    res.status(200).json({ 
      text, 
      isResume,
      fileType: extension,
      voiceId: voiceId || null,
      voiceName: voiceName || null
    });
  } catch (error) {
    console.error('Text extraction error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to extract text from file',
      isResume: false
    });
  }
}



