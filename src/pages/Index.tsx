
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import InterviewSetup, { InterviewConfig } from '@/components/InterviewSetup';
import Interview, { InterviewResults } from '@/components/Interview';
import Results from '@/components/Results';
import AuthPage from '@/components/AuthPage';

type AppState = 'setup' | 'interview' | 'results';

const Index = () => {
  const { user, loading } = useAuth();
  const [currentState, setCurrentState] = useState<AppState>('setup');
  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig | null>(null);
  const [interviewResults, setInterviewResults] = useState<InterviewResults | null>(null);

  const handleStartInterview = (config: InterviewConfig) => {
    setInterviewConfig(config);
    setCurrentState('interview');
  };

  const handleInterviewComplete = (results: InterviewResults) => {
    setInterviewResults(results);
    setCurrentState('results');
  };

  const handleRetry = () => {
    if (interviewConfig) {
      setCurrentState('interview');
    }
  };

  const handleNewInterview = () => {
    setInterviewConfig(null);
    setInterviewResults(null);
    setCurrentState('setup');
  };

  const handleBackToSetup = () => {
    setCurrentState('setup');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  switch (currentState) {
    case 'setup':
      return <InterviewSetup onStartInterview={handleStartInterview} />;
    
    case 'interview':
      return interviewConfig ? (
        <Interview 
          config={interviewConfig} 
          onComplete={handleInterviewComplete}
          onBack={handleBackToSetup}
        />
      ) : null;
    
    case 'results':
      return interviewResults ? (
        <Results 
          results={interviewResults}
          onRetry={handleRetry}
          onNewInterview={handleNewInterview}
        />
      ) : null;
    
    default:
      return <InterviewSetup onStartInterview={handleStartInterview} />;
  }
};

export default Index;
