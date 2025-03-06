import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AgentConfig } from '../types/agent';
import { UserIcon, BriefcaseIcon, TargetIcon, BrainIcon, MessageSquareIcon, ShieldCheckIcon } from 'lucide-react';

interface ResumeAnalysisProps {
  config: AgentConfig;
  onStartChat: () => void;
  isLoading: boolean;
}

export default function ResumeAnalysis({ config, onStartChat, isLoading }: ResumeAnalysisProps) {
  // Extract data from the correct nested structure
  const { name, role, objective, personalityTraits, conversationStyle, rules } = config.prompt;

  return (
    <Card className="w-full max-w-5xl mx-auto bg-netflix-dark border-none shadow-netflix">
      <CardHeader className="bg-gradient-to-r from-netflix-red/90 to-purple-900/90 rounded-t-lg">
        <CardTitle className="text-white flex flex-col md:flex-row items-center justify-between">
          <span className="text-2xl md:text-3xl font-bold">{name} - AI Agent Profile</span>
          <Button 
            variant="netflix" 
            size="lg" 
            onClick={onStartChat}
            disabled={isLoading}
            className="mt-4 md:mt-0 bg-white text-netflix-red hover:bg-white/90"
          >
            Start Voice Chat
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <UserIcon className="w-6 h-6 text-netflix-red mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-netflix-light mb-2">Professional Role</h3>
              <p className="text-netflix-gray">{role || 'Not specified'}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <TargetIcon className="w-6 h-6 text-netflix-red mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-netflix-light mb-2">Objective</h3>
              <p className="text-netflix-gray">{objective || 'Not specified'}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <BrainIcon className="w-6 h-6 text-netflix-red mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-netflix-light mb-2">Personality Traits</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <h4 className="text-sm text-netflix-red mb-1">Core</h4>
                  <ul className="space-y-1">
                    {personalityTraits?.core?.map((trait, index) => (
                      <li key={index} className="text-sm text-netflix-gray flex items-center">
                        <span className="w-1.5 h-1.5 bg-netflix-red rounded-full mr-2"></span>
                        {trait}
                      </li>
                    )) || (
                      <li className="text-sm text-netflix-gray flex items-center">
                        <span className="w-1.5 h-1.5 bg-netflix-red rounded-full mr-2"></span>
                        Data not available
                      </li>
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm text-netflix-red mb-1">Style</h4>
                  <ul className="space-y-1">
                    {personalityTraits?.style?.map((trait, index) => (
                      <li key={index} className="text-sm text-netflix-gray flex items-center">
                        <span className="w-1.5 h-1.5 bg-netflix-red rounded-full mr-2"></span>
                        {trait}
                      </li>
                    )) || (
                      <li className="text-sm text-netflix-gray flex items-center">
                        <span className="w-1.5 h-1.5 bg-netflix-red rounded-full mr-2"></span>
                        Data not available
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <MessageSquareIcon className="w-6 h-6 text-netflix-red mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-netflix-light mb-2">Conversation Style</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <h4 className="text-sm text-netflix-red mb-1">Communication</h4>
                  <ul className="space-y-1">
                    {conversationStyle?.communication?.map((style, index) => (
                      <li key={index} className="text-sm text-netflix-gray flex items-center">
                        <span className="w-1.5 h-1.5 bg-netflix-red rounded-full mr-2"></span>
                        {style}
                      </li>
                    )) || (
                      <li className="text-sm text-netflix-gray flex items-center">
                        <span className="w-1.5 h-1.5 bg-netflix-red rounded-full mr-2"></span>
                        Data not available
                      </li>
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm text-netflix-red mb-1">Problem Solving</h4>
                  <ul className="space-y-1">
                    {conversationStyle?.problemSolving?.map((style, index) => (
                      <li key={index} className="text-sm text-netflix-gray flex items-center">
                        <span className="w-1.5 h-1.5 bg-netflix-red rounded-full mr-2"></span>
                        {style}
                      </li>
                    )) || (
                      <li className="text-sm text-netflix-gray flex items-center">
                        <span className="w-1.5 h-1.5 bg-netflix-red rounded-full mr-2"></span>
                        Data not available
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <ShieldCheckIcon className="w-6 h-6 text-netflix-red mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-netflix-light mb-2">Guidelines</h3>
              <ul className="space-y-1">
                {rules?.map((rule, index) => (
                  <li key={index} className="text-sm text-netflix-gray flex items-center">
                    <span className="w-1.5 h-1.5 bg-netflix-red rounded-full mr-2"></span>
                    {rule}
                  </li>
                )) || (
                  <li className="text-sm text-netflix-gray flex items-center">
                    <span className="w-1.5 h-1.5 bg-netflix-red rounded-full mr-2"></span>
                    Data not available
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}