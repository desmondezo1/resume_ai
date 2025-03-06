import React, { useState } from 'react';
import { FileUpload } from './ui/file-upload';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Loader2, Mic, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import axios from 'axios';
import VoiceRecorder from './VoiceRecorder';

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [voiceName, setVoiceName] = useState<string | null>(null);
  const [showVoiceOption, setShowVoiceOption] = useState(false);
  const router = useRouter();

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setIsLoading(true);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      
      // If we have a voice ID, include it
      if (voiceId) {
        formData.append('voiceId', voiceId);
        formData.append('voiceName', voiceName || 'Custom Voice');
      }

      // First extract text from the file
      const extractResponse = await axios.post('/api/extract-text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { text, isResume } = extractResponse.data;

      if (!isResume) {
        // Instead of showing an error, create a sassy AI agent
        toast.success('Preparing a special surprise for you...', {
          duration: 3000
        });
        
        const generateResponse = await axios.post('/api/generate-agent', {
          isNotResume: true,
          fileType: file.type,
          fileContent: text.substring(0, 500), // Send partial content for context-aware roasts
          voiceId,
          voiceName,
        });

        const { agentId } = generateResponse.data;
        
        // Navigate to the agent page
        router.push(`/agent/${agentId}`);
        return;
      }

      // Generate agent config from the extracted text
      const generateResponse = await axios.post('/api/generate-agent', {
        resumeText: text,
        voiceId,
        voiceName,
      });

      const { agentId } = generateResponse.data;

      // Navigate to the agent page
      router.push(`/agent/${agentId}`);
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process your file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStartVoiceRecording = () => {
    setShowVoiceRecorder(true);
  };
  
  const handleVoiceRecorded = async (audioBlob: Blob, name: string) => {
    setIsLoading(true);
    
    try {
      // Create FormData for voice upload
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('name', name);
      
      // Send to API
      const response = await axios.post('/api/clone-voice', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const { voiceId, name: voiceName } = response.data;
      
      setVoiceId(voiceId);
      setVoiceName(voiceName);
      setShowVoiceRecorder(false);
      
      toast.success('Voice clone created successfully!');
    } catch (error) {
      console.error('Error creating voice clone:', error);
      toast.error('Failed to create voice clone. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelVoiceRecording = () => {
    setShowVoiceRecorder(false);
  };

  if (showVoiceRecorder) {
    return (
      <VoiceRecorder 
        onVoiceRecorded={handleVoiceRecorded} 
        onCancel={handleCancelVoiceRecording} 
      />
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto bg-gradient-to-b from-netflix-dark/90 to-netflix-dark border-none shadow-2xl overflow-hidden">
      <CardHeader className="border-b border-netflix-gray/10 bg-netflix-black/30">
        <CardTitle className="text-2xl md:text-3xl font-bold text-white">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-netflix-red">
            Upload Your Resume
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <FileUpload
            onFileSelected={handleFileSelected}
            isLoading={isLoading}
            className="h-64 shadow-xl border border-netflix-gray/10 bg-netflix-black/20 backdrop-blur-sm hover:bg-netflix-black/30 transition-all duration-300"
          />
          
          {file && (
            <div className="flex items-center justify-between px-4 py-3 bg-netflix-black/40 backdrop-blur-sm rounded-md shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-netflix-red to-purple-700 rounded-md flex items-center justify-center">
                  <span className="text-white text-lg font-bold">
                    {file.name.split('.').pop()?.toUpperCase()}
                  </span>
                </div>
                <div className="truncate">
                  <p className="text-netflix-light truncate max-w-[200px] md:max-w-sm">
                    {file.name}
                  </p>
                  <p className="text-xs text-netflix-gray">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setFile(null)}
                variant="ghost"
                className="text-netflix-gray hover:text-netflix-red"
                disabled={isLoading}
              >
                Remove
              </Button>
            </div>
          )}
          
          {/* Voice cloning option with toggle */}
          <div className="mt-8 border-t border-netflix-gray/10 pt-6">
            <button 
              onClick={() => setShowVoiceOption(!showVoiceOption)} 
              className="w-full flex items-center justify-between text-left bg-gradient-to-r from-netflix-black/40 to-transparent p-4 rounded-lg hover:from-netflix-black/60 transition-all duration-300"
            >
              <div>
                <h3 className="text-xl text-netflix-light font-bold flex items-center">
                  <Mic className="mr-2 h-5 w-5 text-netflix-red" />
                  Voice Cloning <span className="ml-2 text-netflix-gray text-sm">(Optional)</span>
                </h3>
              </div>
              {showVoiceOption ? 
                <ChevronUp className="h-5 w-5 text-netflix-gray" /> : 
                <ChevronDown className="h-5 w-5 text-netflix-gray" />
              }
            </button>
            
            {showVoiceOption && (
              <div className="p-4 mt-2 bg-netflix-black/20 backdrop-blur-sm rounded-lg animate-fade-in border border-netflix-gray/10">
                <p className="text-netflix-gray mb-4">
                  Want your AI agent to sound like you? Record your voice to create a custom voice clone.
                </p>
                
                {voiceId ? (
                  <div className="flex items-center justify-between p-3 bg-netflix-black/40 rounded-lg">
                    <div className="flex items-center text-green-400">
                      <CheckCircle className="mr-2 h-5 w-5" />
                      <span>Voice Clone Ready: {voiceName}</span>
                    </div>
                    <Button
                      onClick={() => { setVoiceId(null); setVoiceName(null); }}
                      variant="outline"
                      size="sm"
                      className="text-netflix-gray hover:text-netflix-red border-netflix-gray/20"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleStartVoiceRecording}
                    variant="outline"
                    className="w-full flex items-center justify-center border-netflix-red/50 text-netflix-red hover:bg-netflix-red/10 bg-netflix-black/30"
                    disabled={isLoading}
                  >
                    <Mic className="mr-2 h-4 w-4" />
                    Record Your Voice
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end border-t border-netflix-gray/10 pt-6 bg-netflix-black/20">
        <Button
          onClick={handleUpload}
          variant="netflix"
          size="lg"
          disabled={!file || isLoading}
          className="w-full md:w-auto bg-gradient-to-r from-netflix-red to-[#ff4d4d] hover:from-[#ff4d4d] hover:to-netflix-red shadow-lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Create AI Agent'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}