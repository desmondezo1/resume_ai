import { useState, useCallback } from 'react';
import { isResumeFile } from '../lib/utils';
import toast from 'react-hot-toast';

export default function useFileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onFileSelected = useCallback((selectedFile: File) => {
    // Check if file is a valid resume file
    if (!isResumeFile(selectedFile)) {
      toast.error('Please upload a valid resume file (PDF, DOCX, DOC, TXT, RTF)');
      return;
    }

    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds the maximum limit of 5MB');
      return;
    }

    setFile(selectedFile);
    toast.success(`${selectedFile.name} selected`);
  }, []);

  const resetFile = useCallback(() => {
    setFile(null);
    setUploadProgress(0);
  }, []);

  return {
    file,
    isUploading,
    uploadProgress,
    onFileSelected,
    resetFile,
    setIsUploading,
    setUploadProgress
  };
}