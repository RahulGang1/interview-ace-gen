import React, { useState } from 'react';
import InterviewSetup, { InterviewConfig } from '@/components/InterviewSetup';
import Interview, { InterviewResults } from '@/components/Interview';
import Results from '@/components/Results';

type AppState = 'setup' | 'interview' | 'results';

const Index = () => {
  const [currentState, setCurrentState] = useState<AppState>('setup');
  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig | null>(null);
  const [interviewResults, setInterviewResults] = useState<InterviewResults | null>(null);

  const handleStartInterview = (config: InterviewConfig) => {
    // Use the exact configuration as provided by user
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
