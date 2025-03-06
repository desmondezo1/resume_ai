import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Agent } from '../../types/agent';
import LoadingState from '../../components/LoadingState';
import { Button } from '../../components/ui/button';
import AudioReactiveGlobe from '../../components/AudioReactiveGlobe';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AgentPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [clientRef, setClientRef] = useState<any>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchAgent = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/agents/${id}`);
        setAgent(response.data.agent);
      } catch (error) {
        console.error('Error fetching agent:', error);
        setIsError(true);
        toast.error('Failed to load agent data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgent();
  }, [id]);

  const initAudio = useCallback(async () => {
    try {
      // Create audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Get user microphone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: false 
      });
      
      // Create source from microphone
      const source = audioContext.createMediaStreamSource(stream);
      
      // Create analyzer
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Connect source to analyzer
      source.connect(analyser);
      
      return { analyser, dataArray };
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast.error('Failed to access microphone');
      throw err;
    }
  }, []);

const startListening = async () => {
    if (!id) return;
    
    try {
      // Get user microphone stream first
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: false 
      });
      
      setAudioStream(stream);
      
      // Get token and initiate Bland AI connection
      const response = await axios.post('/api/get-token', {
        agentId: id
      });
      
      if (!response.data.token) {
        throw new Error('No token received');
      }

      // Import BlandWebClient dynamically to avoid SSR issues
      const { BlandWebClient } = await import('bland-client-js-sdk');
      
      // Initialize the Bland client
      const client = new BlandWebClient(id as string, response.data.token);
      
      // Initialize conversation
      await client.initConversation({
        sampleRate: 44100,
        callId: Date.now().toString()
      });
      
      // Store client reference for later cleanup
      setClientRef(client);

      setIsListening(true);
      toast.success('Voice chat activated! Start speaking...');
      
    } catch (error) {
      console.error('Failed to start voice chat:', error);
      toast.error('Failed to connect to voice service');
      
      // Clean up any partial resources
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        setAudioStream(null);
      }
    }
  };

//   const startListening = async () => {
//     if (!id) return;
    
//     try {
//       // Get token and initiate Bland AI connection
//       const response = await axios.post('/api/get-token', {
//         agentId: id
//       });
      
//       if (!response.data.token) {
//         throw new Error('No token received');
//       }

//       // Import BlandWebClient dynamically to avoid SSR issues
//       const { BlandWebClient } = await import('bland-client-js-sdk');
      
//       // Initialize the Bland client
//       const client = new BlandWebClient(id as string, response.data.token);
      
//       // Initialize conversation
//       await client.initConversation({
//         sampleRate: 44100,
//         callId: Date.now().toString()
//       });

//       setIsListening(true);
//       toast.success('Voice chat activated! Start speaking...');
      
//     } catch (error) {
//       console.error('Failed to start voice chat:', error);
//       toast.error('Failed to connect to voice service');
//     }
//   };

const stopListening = useCallback(async () => {
    if (clientRef) {
      try {
        // Try to use the stop method if available (checking implementation from original code)
        if (typeof clientRef.stop === 'function') {
          await clientRef.stop();
        }
        
        // Clean up any WebSocket connections from the Bland client
        const wsInstance = (clientRef as any)._ws || 
                           (clientRef as any).ws || 
                           (clientRef as any).webSocket;
                           
        if (wsInstance && wsInstance.readyState !== WebSocket.CLOSED) {
          // Remove all event listeners
          wsInstance.onclose = null;
          wsInstance.onerror = null;
          wsInstance.onmessage = null;
          wsInstance.onopen = null;
          
          // Close the connection
          wsInstance.close(1000, 'User stopped conversation');
          
          // Wait for the connection to fully close
          await new Promise<void>((resolve) => {
            const checkClosed = setInterval(() => {
              if (wsInstance.readyState === WebSocket.CLOSED) {
                clearInterval(checkClosed);
                resolve();
              }
            }, 50);
            
            // Timeout after 2 seconds in case it doesn't close properly
            setTimeout(() => {
              clearInterval(checkClosed);
              resolve();
            }, 2000);
          });
        }
        
        // Clean up audio context if present
        if ((clientRef as any).audioContext && 
            (clientRef as any).audioContext.state !== 'closed') {
          await (clientRef as any).audioContext.close();
        }
        
        // Release the client
        setClientRef(null);
      } catch (err) {
        console.error('Error stopping client:', err);
      }
    }
    
    // Stop all audio tracks
    if (audioStream) {
      audioStream.getTracks().forEach(track => {
        track.enabled = false;
        track.stop();
      });
      setAudioStream(null);
    }
    
    // Release microphone completely
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      
      for (const device of audioDevices) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: device.deviceId }
        });
        stream.getTracks().forEach(track => {
          track.enabled = false;
          track.stop();
        });
      }
    } catch (err) {
      console.warn('Could not release microphone:', err);
    }
    
    setIsListening(false);
    toast.success('Voice chat stopped');
  }, [clientRef, audioStream]);
  
  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (isListening) {
        stopListening();
      }
    };
  }, [isListening, stopListening]);


  if (isLoading) {
    return <LoadingState message="Loading AI Agent..." />;
  }

  if (isError || !agent) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="max-w-md w-full text-center p-8">
          <div className="text-netflix-red text-4xl mb-4">404</div>
          <h1 className="text-netflix-light text-2xl mb-4">Agent Not Found</h1>
          <p className="text-netflix-gray mb-6">
            The AI agent you're looking for doesn't exist or was deleted.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-netflix-red text-white py-2 px-6 rounded hover:bg-opacity-90 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black flex flex-col">
      <header className="py-4 px-6 bg-netflix-black/80 backdrop-blur-md sticky top-0 z-10 border-b border-netflix-gray/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center text-netflix-light hover:text-netflix-red transition-colors">
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span className="text-lg font-medium">Return Home</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Agent Name and Start Button */}
        <div className="text-center pt-8 pb-4">
          <h1 className="text-netflix-red text-4xl md:text-5xl font-bold mb-6">
            {agent.config.prompt.name}
          </h1>
          
          {/* {!isListening && (
            <Button 
              onClick={startListening}
              variant="netflix"
              size="xl"
              className="mx-auto shadow-lg hover:shadow-xl"
            >
              Start Speaking
            </Button>
          )} */}

          {!isListening && (
            <Button 
              onClick={startListening}
              variant="netflix"
              size="xl"
              className="mx-auto shadow-lg hover:shadow-xl"
            >
              Start Speaking
            </Button>
          )}
          
          {isListening && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-netflix-light text-xl animate-pulse">
                Listening... speak now
              </p>
              <Button 
                onClick={stopListening}
                variant="outline"
                size="lg"
                className="bg-red-950/30 text-netflix-red border-netflix-red/30 hover:bg-red-950/50"
              >
                Stop Conversation
              </Button>
            </div>
          )}
          
          {/* {isListening && (
            <p className="text-netflix-light text-xl animate-pulse">
              Listening... speak now
            </p>
          )} */}
        </div>
        
        {/* 3D Globe Visualization */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl h-[600px] rounded-2xl overflow-hidden shadow-2xl">
            <AudioReactiveGlobe 
              isListening={isListening} 
              onInitAudio={initAudio} 
            />
          </div>
        </div>
      </main>
      
      <footer className="py-4 px-6 bg-netflix-black/80 backdrop-blur-md border-t border-netflix-gray/10">
        <div className="max-w-7xl mx-auto text-center text-netflix-gray text-sm">
          Resume AI Voice Chat • Powered by Next.js, Three.js and Bland AI
        </div>
      </footer>
    </div>
  );
}