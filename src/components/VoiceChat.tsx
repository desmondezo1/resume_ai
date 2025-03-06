import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Mic, MicOff, Loader2, WifiOff, ArrowLeft } from 'lucide-react';
import { BlandWebClient } from 'bland-client-js-sdk';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface VoiceChatProps {
  agentId: string;
  agentName: string;
}

export default function VoiceChat({ agentId, agentName }: VoiceChatProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<string>('Ready to start');
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [callId, setCallId] = useState<string>('');

  const clientRef = useRef<BlandWebClient | null>(null);
  const audioLevelIntervalRef = useRef<NodeJS.Timeout>();
  const router = useRouter();

  // Utility functions for cleanup
  const cleanupWebSocket = async (wsInstance: WebSocket): Promise<void> => {
    if (wsInstance && wsInstance.readyState !== WebSocket.CLOSED) {
      // Remove listeners
      wsInstance.onclose = null;
      wsInstance.onerror = null;
      wsInstance.onmessage = null;
      wsInstance.onopen = null;
      
      // Close connection
      wsInstance.close(1000, 'User disconnected');
      
      // Wait for closure
      await new Promise<void>((resolve) => {
        const checkClosed = setInterval(() => {
          if (wsInstance.readyState === WebSocket.CLOSED) {
            clearInterval(checkClosed);
            resolve();
          }
        }, 50);
        
        setTimeout(() => {
          clearInterval(checkClosed);
          resolve();
        }, 2000);
      });
    }
  };

  const cleanupMediaStream = (mediaStream: MediaStream) => {
    if (mediaStream?.getTracks) {
      mediaStream.getTracks().forEach((track: MediaStreamTrack) => {
        track.enabled = false;
        track.stop();
      });
    }
  };

  const cleanupAudioContext = async (audioContext: AudioContext) => {
    if (audioContext && audioContext.state !== 'closed') {
      await audioContext.close();
    }
  };

  const releaseMicrophone = async () => {
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
  };

  const cleanup = useCallback(async () => {
    setIsLoading(true);
    try {
      // Clear audio level interval
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current);
        audioLevelIntervalRef.current = undefined;
      }

      if (clientRef.current) {
        try {
          // Stop ongoing processes
          if (typeof (clientRef.current as any).stop === 'function') {
            await (clientRef.current as any).stop();
          }

          // Cleanup WebSocket
          const wsInstance = (clientRef.current as any)._ws || 
                           (clientRef.current as any).ws || 
                           (clientRef.current as any).webSocket;
          await cleanupWebSocket(wsInstance);

          // Note: Based on the original example, BlandWebClient might not have a disconnect method
          // Instead, we'll rely on the WebSocket cleanup and resource release

          // Cleanup media stream
          cleanupMediaStream((clientRef.current as any).mediaStream);

          // Cleanup audio context
          await cleanupAudioContext((clientRef.current as any).audioContext);

          clientRef.current = null;
        } catch (err) {
          console.error('Error stopping client:', err);
          throw new Error('Failed to disconnect properly');
        }
      }

      // Release microphone as final step
      await releaseMicrophone();

    } catch (err) {
      console.error('Error during cleanup:', err);
      setError(err instanceof Error ? err.message : 'Cleanup failed');
    } finally {
      // Reset states
      setIsConnected(false);
      setIsRecording(false);
      setStatus('Ready to start');
      setCallId('');
      setAudioLevel(0);
      setIsLoading(false);
    }
  }, []);

  // Handle voice toggle
  const handleVoiceToggle = async () => {
    if (isRecording) {
      setStatus('Disconnecting...');
      await cleanup();
    } else {
      initVoiceChat();
    }
  };

  // Add connection status effect
  useEffect(() => {
    return () => {
      if (isConnected) {
        cleanup();
      }
    };
  }, [isConnected, cleanup]);

  const initVoiceChat = async () => {
    if (!agentId) {
      setError('Agent ID is not set');
      return;
    }

    cleanup(); // Cleanup any existing connections
    setStatus('Initializing...');
    setError(null);
    setIsLoading(true);

    try {
      const response = await axios.post('/api/get-token', {
        agentId
      });
      
      const data = response.data;

      if (!data.token) {
        throw new Error('No token received');
      }

      setStatus('Connecting to voice service...');
      clientRef.current = new BlandWebClient(agentId, data.token);

      const currentCallId = Date.now().toString();
      await clientRef.current.initConversation({
        sampleRate: 44100,
        callId: currentCallId
      });

      setCallId(currentCallId);
      setStatus('Connected! Start speaking...');
      setIsRecording(true);
      setIsConnected(true);

      // Simulate audio levels for visualization
      audioLevelIntervalRef.current = setInterval(() => {
        setAudioLevel(Math.random());
      }, 100);

    } catch (err) {
      console.error('Voice chat error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to voice chat');
      setStatus('Error connecting');
      setIsRecording(false);
      cleanup();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-4 px-6 bg-netflix-black shadow-lg z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <ArrowLeft className="mr-2 h-5 w-5 text-netflix-gray" />
            <span className="text-netflix-light text-lg font-medium">Return to Home</span>
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-netflix-red">
            {agentName} <span className="text-netflix-gray">Voice Agent</span>
          </h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 bg-gradient-to-b from-netflix-black to-netflix-dark">
        <Card className="w-full max-w-md mx-auto h-[400px] overflow-hidden border-none bg-black/40 backdrop-blur-lg shadow-xl">
          <CardHeader className="pb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-netflix-red/10 to-transparent"></div>
            <CardTitle className="relative flex items-center justify-between text-2xl font-light tracking-tight text-white">
              <span className="flex items-center gap-3 w-full justify-center">
                Voice Assistant
                {isLoading && (
                  <Loader2 className="h-4 w-4 animate-spin text-white/70" />
                )}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-between h-[300px] px-8">
            <div className="text-center w-full flex flex-col items-center gap-6">
              <div className={`text-lg font-light transition-colors duration-300 ${
                isRecording ? 'text-white' : 
                isLoading ? 'text-white/70' : 'text-white/50'
              }`}>
                {status}
              </div>

              <Button 
                onClick={handleVoiceToggle} 
                size="icon" 
                className={`
                  w-24 h-24 rounded-full transition-colors duration-500 
                  ${isRecording 
                    ? 'bg-netflix-red/20 hover:bg-netflix-red/30' 
                    : 'bg-white/10 hover:bg-white/20'
                  } 
                  border-none shadow-xl hover:shadow-2xl
                  flex items-center justify-center
                  group
                `}
                disabled={isLoading}
              >
                {isRecording ? (
                  <MicOff className="h-8 w-8 text-netflix-red transition-transform duration-300 group-hover:scale-110" />
                ) : (
                  <Mic className="h-8 w-8 text-white transition-transform duration-300 group-hover:scale-110" />
                )}
              </Button>

              <div className="h-12 flex items-center justify-center">
                {isRecording ? (
                  <div className="flex justify-center items-center space-x-1">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-netflix-red/30 rounded-full animate-pulse"
                        style={{
                          height: `${Math.max(12, Math.random() * 48)}px`,
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: '0.5s'
                        }}
                      />
                    ))}
                  </div>
                ) : !isLoading && (
                  <div className="flex justify-center items-center gap-2 text-white/50">
                    <WifiOff className="h-4 w-4" />
                    <span className="text-sm font-light">Ready to start</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="text-red-300/90 text-sm bg-red-500/10 p-4 rounded-2xl backdrop-blur-sm">
                  {error}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}