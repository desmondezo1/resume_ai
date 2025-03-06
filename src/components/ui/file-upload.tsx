import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '../../lib/utils';
import { Upload, FileType2 } from 'lucide-react';

interface FileUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  onFileSelected: (file: File) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  isLoading?: boolean;
}

export function FileUpload({
  onFileSelected,
  accept = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt'],
    'application/rtf': ['.rtf'],
  },
  maxSize = 5242880, // 5MB
  isLoading = false,
  className,
  ...props
}: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelected(acceptedFiles[0]);
      }
    },
    [onFileSelected]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled: isLoading,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300',
        isDragActive ? 'border-netflix-red bg-netflix-red/10 shadow-lg scale-102' : 'border-netflix-gray/30 hover:border-netflix-red/50 hover:shadow-lg',
        isDragReject && 'border-red-500 bg-red-500/10',
        isLoading && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center gap-6 text-center p-6">
        {isDragActive ? (
          <div className="w-16 h-16 rounded-full bg-netflix-red/10 flex items-center justify-center animate-pulse">
            <Upload className="w-8 h-8 text-netflix-red" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-netflix-gray/10 flex items-center justify-center transition-all duration-300 group-hover:bg-netflix-red/10">
            <FileType2 className="w-8 h-8 text-netflix-gray group-hover:text-netflix-red transition-colors duration-300" />
          </div>
        )}
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-netflix-light">
            {isDragActive ? "Drop it here" : "Upload Resume or CV"}
          </h3>
          
          <p className="text-sm text-netflix-gray">
            {isDragReject ? (
              "File type not accepted, sorry!"
            ) : (
              <>
                Drag & drop your file or <span className="text-netflix-red font-medium">browse</span>
              </>
            )}
          </p>
          
          <p className="text-xs text-netflix-gray/70 px-6 py-2 bg-netflix-black/30 rounded-full inline-block mt-2">
            Supports PDF, DOCX, DOC, TXT, RTF (max 5MB)
          </p>
        </div>
      </div>
    </div>
  );
}