import React, { useEffect, useState } from 'react';
import FileUploader from '../components/FileUploader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import axios from 'axios';
import { formatDate } from '../lib/utils';
import Link from 'next/link';
import { Trash2, ChevronDown, ChevronUp, Play } from 'lucide-react';
import toast from 'react-hot-toast';

interface AgentItem {
  id: string;
  name: string;
  created_at: string;
}

export default function HomePage() {
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setIsLoadingAgents(true);
    try {
      const response = await axios.get('/api/agents');
      setAgents(response.data.agents || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setIsLoadingAgents(false);
    }
  };

  const handleDeleteAgent = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this agent?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/agents/${id}`);
      toast.success('Agent deleted successfully');
      fetchAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error('Failed to delete agent');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-netflix-black via-[#1a0a1f] to-netflix-black">
      {/* Hero section */}
      <div className="relative h-[500px] bg-hero-pattern bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-b from-netflix-black/30 via-transparent to-[#1a0a1f]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-transparent to-netflix-red/30"></div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 text-shadow">
              Resume<span className="text-netflix-red">AI</span> Voice Chat
            </h1>
            <p className="text-lg md:text-xl text-netflix-light max-w-2xl mb-8 leading-relaxed">
              Upload your resume and create an AI voice agent that represents your professional profile. 
              Experience natural voice conversations about your qualifications.
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-12 -mt-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* File upload section */}
          <div className="lg:col-span-2">
            <FileUploader />
          </div>

          {/* Previous agents section */}
          <div>
            <Card className="bg-gradient-to-b from-netflix-dark/90 to-netflix-dark border-none shadow-xl">
              <CardHeader className="border-b border-netflix-gray/10">
                <CardTitle className="text-2xl font-bold text-netflix-light flex items-center">
                  <span className="mr-2">Your Agents</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-netflix-red/50 to-transparent ml-4"></div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingAgents ? (
                  <div className="p-6 text-center text-netflix-gray">
                    <div className="animate-pulse">Loading agents...</div>
                  </div>
                ) : agents.length === 0 ? (
                  <div className="p-6 text-center text-netflix-gray">
                    <div className="p-8 rounded-xl bg-netflix-black/40 backdrop-blur-sm">
                      <p className="mb-4">No agents created yet.</p> 
                      <p className="text-sm">Upload a resume to create your first agent!</p>
                    </div>
                  </div>
                ) : (
                  <ul className="divide-y divide-netflix-gray/10">
                    {agents.map((agent) => (
                      <li key={agent.id} className="relative group">
                        <Link href={`/agent/${agent.id}`}>
                          <div className="p-4 hover:bg-netflix-black/30 transition-colors duration-200 group flex justify-between items-center">
                            <div className="flex-1">
                              <h3 className="text-netflix-light font-medium group-hover:text-netflix-red transition-colors">{agent.name}</h3>
                              <p className="text-netflix-gray text-sm">
                                {formatDate(agent.created_at)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-netflix-gray hover:text-netflix-red hover:bg-netflix-red/10"
                                onClick={(e) => handleDeleteAgent(agent.id, e)}
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                              <Link href={`/agent/${agent.id}`} className="flex items-center">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-netflix-light hover:text-netflix-red hover:bg-netflix-red/10"
                                >
                                  <Play className="h-5 w-5" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-netflix-gray/10 bg-gradient-to-b from-transparent to-netflix-black/90">
        <div className="max-w-7xl mx-auto px-4 text-netflix-gray text-center">
          <p className="mb-2">© {new Date().getFullYear()} ResumeAI Voice Chat</p>
          <p className="text-sm">Built with Next.js, Three.js and Bland AI</p>
        </div>
      </footer>
      
      {/* Floating gradients for visual flair */}
      <div className="fixed top-1/4 left-0 w-64 h-64 bg-purple-700/10 rounded-full filter blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-1/3 right-0 w-96 h-96 bg-netflix-red/10 rounded-full filter blur-3xl pointer-events-none"></div>
    </div>
  );
}