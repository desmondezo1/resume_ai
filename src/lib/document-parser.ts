import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import { getFileExtension } from './utils';

export async function extractTextFromFile(file: Buffer, filename: string): Promise<string> {
  const extension = getFileExtension(filename);

  try {
    switch (extension) {
      case 'pdf':
        return await extractFromPdf(file);
      case 'docx':
        return await extractFromDocx(file);
      case 'doc':
        throw new Error('DOC files are not directly supported. Please convert to DOCX or PDF.');
      case 'txt':
        return Buffer.from(file).toString('utf8');
      case 'rtf':
        // Basic RTF parsing - strip RTF tags
        const rtfText = Buffer.from(file).toString('utf8');
        return stripRtfTags(rtfText);
      default:
        throw new Error(`Unsupported file format: ${extension}`);
    }
  } catch (error) {
    console.error('Error extracting text:', error);
    throw new Error(`Failed to extract text from ${extension.toUpperCase()} file: ${(error as Error).message}`);
  }
}

async function extractFromPdf(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

async function extractFromDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

function stripRtfTags(rtfText: string): string {
  // Basic RTF tag stripping - this is not comprehensive
  // For production use, consider a dedicated RTF parser library
  return rtfText
    .replace(/[\\][a-z0-9\-*]+/g, '') // Remove RTF commands
    .replace(/[\\][\'"][0-9a-f]{2}/g, '') // Remove hex character codes
    .replace(/[{}]/g, '') // Remove braces
    .replace(/\\par/g, '\n') // Replace paragraph breaks with newlines
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

export function isResumeContent(text: string): boolean {
  // Check if the text contains common resume keywords
  const resumeKeywords = [
    'experience', 'education', 'skills', 'objective', 'profile', 'employment',
    'job', 'work', 'qualification', 'achievement', 'certificate', 'resume', 'cv'
  ];
  
  const lowerText = text.toLowerCase();
  
  // Count how many resume keywords are found
  const keywordCount = resumeKeywords.filter(keyword => 
    lowerText.includes(keyword)
  ).length;
  
  // If multiple resume keywords are found, it's likely a resume
  return keywordCount >= 3;
}