
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
    // Ensure minimum 10 questions
    const totalQuestions = config.theoryCount + config.codingCount;
    if (totalQuestions < 10) {
      const adjustedConfig = { ...config };
      const remaining = 10 - totalQuestions;
      adjustedConfig.theoryCount += Math.ceil(remaining / 2);
      adjustedConfig.codingCount += Math.floor(remaining / 2);
      setInterviewConfig(adjustedConfig);
    } else {
      setInterviewConfig(config);
    }
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
