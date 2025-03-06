import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Mic, MicOff, Play, Square, AlertCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface VoiceRecorderProps {
  onVoiceRecorded: (audioBlob: Blob, voiceName: string) => void;
  onCancel: () => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onVoiceRecorded, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceName, setVoiceName] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Generate a default voice name
    const timestamp = new Date().toISOString().slice(0, 10);
    setVoiceName(`My Voice ${timestamp}`);
    
    return () => {
      // Clean up audio URL on component unmount
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setRecordingComplete(true);
        
        // Stop all tracks from the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingComplete(false);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check your permissions.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  const playRecording = () => {
    if (audioRef.current && audioURL) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };
  
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };
  
  const handleSubmit = () => {
    if (!audioURL) {
      toast.error('Please record your voice first');
      return;
    }
    
    if (!voiceName.trim()) {
      toast.error('Please enter a name for your voice');
      return;
    }
    
    // Convert audioURL back to blob and submit
    fetch(audioURL)
      .then(response => response.blob())
      .then(blob => {
        onVoiceRecorded(blob, voiceName.trim());
      })
      .catch(error => {
        console.error('Error processing audio:', error);
        toast.error('Error processing audio recording');
      });
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-b from-netflix-dark/90 to-netflix-dark border-none shadow-2xl">
      <CardHeader className="bg-netflix-black/30 border-b border-netflix-gray/10">
        <CardTitle className="text-2xl font-bold text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-netflix-red" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-netflix-red">
              Voice Cloning
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onCancel}
            className="text-netflix-gray hover:text-netflix-red hover:bg-netflix-black/40"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 p-6">
        <div className="text-netflix-light">
          <p className="mb-4">
            Record yourself talking about your background and experience. This will be used to create your AI agent's voice.
          </p>
          
          <div className="flex items-center gap-2 bg-netflix-black/40 p-3 rounded-lg border border-netflix-gray/10">
            <AlertCircle className="h-5 w-5 text-netflix-red flex-shrink-0" />
            <p className="text-sm">
              For best results, speak clearly for at least 30 seconds in a quiet environment.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center gap-4">
          {!recordingComplete ? (
            <>
              <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-netflix-gray/30 bg-netflix-black/30 shadow-inner">
                {isRecording ? (
                  <div className="text-netflix-red animate-pulse text-xl font-bold">
                    {formatTime(recordingTime)}
                  </div>
                ) : (
                  <Mic className="h-10 w-10 text-netflix-gray" />
                )}
              </div>
              
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  className="bg-gradient-to-r from-netflix-red to-[#ff4d4d] text-white hover:bg-opacity-90 shadow-lg"
                >
                  Start Recording
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  variant="outline"
                  className="border-netflix-red text-netflix-red hover:bg-netflix-red/10 bg-netflix-black/20"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Recording
                </Button>
              )}
            </>
          ) : (
            <>
              <div className="w-full">
                <label className="block text-sm text-netflix-gray mb-2">Voice Name</label>
                <input
                  type="text"
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  className="w-full px-4 py-2 bg-netflix-black/60 border border-netflix-gray/30 rounded text-netflix-light focus:outline-none focus:border-netflix-red focus:ring-1 focus:ring-netflix-red/50 transition-all duration-200"
                  placeholder="Enter a name for your voice"
                />
              </div>
              
              <div className="w-full bg-netflix-black/40 rounded-lg p-4 flex items-center justify-between border border-netflix-gray/10">
                <span className="text-netflix-light">Preview Recording</span>
                <Button
                  onClick={playRecording}
                  variant="ghost"
                  className="text-netflix-light hover:text-netflix-red hover:bg-netflix-black/60"
                  disabled={isPlaying}
                >
                  {isPlaying ? (
                    <span className="text-netflix-red animate-pulse">Playing...</span>
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
              </div>
              
              <audio
                ref={audioRef}
                src={audioURL || ''}
                onEnded={handleAudioEnded}
                className="hidden"
              />
              
              <div className="flex gap-3 mt-4 w-full">
                <Button
                  onClick={onCancel}
                  variant="outline"
                  className="flex-1 bg-netflix-black/30 border-netflix-gray/30 text-netflix-gray hover:bg-netflix-black/50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-netflix-red to-[#ff4d4d] text-white hover:from-[#ff4d4d] hover:to-netflix-red shadow-lg"
                >
                  Use This Voice
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceRecorder;