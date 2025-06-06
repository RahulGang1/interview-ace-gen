
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Code, BookOpen, Target } from 'lucide-react';
import { topics, difficulties } from '@/data/questions';

interface InterviewSetupProps {
  onStartInterview: (config: InterviewConfig) => void;
}

export interface InterviewConfig {
  topic: string;
  difficulty: string;
  theoryCount: number;
  codingCount: number;
  timeLimit: number;
}

const InterviewSetup: React.FC<InterviewSetupProps> = ({ onStartInterview }) => {
  const [config, setConfig] = useState<InterviewConfig>({
    topic: 'All',
    difficulty: 'all',
    theoryCount: 5,
    codingCount: 3,
    timeLimit: 30
  });

  const handleStart = () => {
    if (config.theoryCount + config.codingCount === 0) {
      alert('Please select at least one question type');
      return;
    }
    // Remove the automatic adjustment - respect user's selection
    onStartInterview(config);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <Target className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Mock Technical Interview
          </CardTitle>
          <p className="text-gray-600 mt-2">Configure your interview settings and test your skills</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-sm font-medium text-gray-700">Topic</Label>
              <Select value={config.topic} onValueChange={(value) => setConfig({ ...config, topic: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Topics</SelectItem>
                  {topics.map(topic => (
                    <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty" className="text-sm font-medium text-gray-700">Difficulty</Label>
              <Select value={config.difficulty} onValueChange={(value) => setConfig({ ...config, difficulty: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {difficulties.map(difficulty => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="theory" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Theory Questions
              </Label>
              <Input
                id="theory"
                type="number"
                min="0"
                max="10"
                value={config.theoryCount}
                onChange={(e) => setConfig({ ...config, theoryCount: parseInt(e.target.value) || 0 })}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coding" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Coding Questions
              </Label>
              <Input
                id="coding"
                type="number"
                min="0"
                max="5"
                value={config.codingCount}
                onChange={(e) => setConfig({ ...config, codingCount: parseInt(e.target.value) || 0 })}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time (minutes)
              </Label>
              <Input
                id="time"
                type="number"
                min="10"
                max="120"
                value={config.timeLimit}
                onChange={(e) => setConfig({ ...config, timeLimit: parseInt(e.target.value) || 30 })}
                className="w-full"
              />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-800 mb-2">Interview Summary</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• {config.theoryCount} theory questions + {config.codingCount} coding questions</p>
              <p>• Total duration: {config.timeLimit} minutes</p>
              <p>• Topic: {config.topic === 'All' ? 'All Topics' : config.topic}</p>
              <p>• Difficulty: {config.difficulty === 'all' ? 'All Levels' : config.difficulty}</p>
            </div>
          </div>

          <Button 
            onClick={handleStart}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold transition-all duration-200 transform hover:scale-105"
          >
            Start Interview
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewSetup;
