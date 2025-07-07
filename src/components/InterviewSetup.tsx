
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Target, Zap, Brain, Code, Trophy, MessageSquare, Mic } from 'lucide-react';
import { topics, difficulties } from '@/data/questions';
import Header from './Header';

interface InterviewSetupProps {
  onStartInterview: (config: InterviewConfig) => void;
  onStartSimulator: () => void;
}

export interface InterviewConfig {
  topic: string;
  difficulty: string;
  theoryCount: number;
  codingCount: number;
  timeLimit: number;
}

const InterviewSetup: React.FC<InterviewSetupProps> = ({ onStartInterview, onStartSimulator }) => {
  const [config, setConfig] = useState<InterviewConfig>({
    topic: 'All',
    difficulty: 'all',
    theoryCount: 7,
    codingCount: 3,
    timeLimit: 30
  });

  const handleStart = () => {
    onStartInterview(config);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      
      <div className="flex items-center justify-center p-4 pt-8">
        <div className="w-full max-w-4xl">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Ready to Ace Your Interview?
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose between structured mock interviews or conversational practice sessions
            </p>
          </div>

          {/* Interview Mode Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6 text-center" onClick={handleStart}>
                <Brain className="w-12 h-12 mx-auto mb-4" />
                <h3 className="font-semibold text-xl mb-2">Mock Interview</h3>
                <p className="text-blue-100 mb-4">Structured interview with timed questions and AI evaluation</p>
                <div className="flex justify-center gap-4 text-sm">
                  <span>• Theory & Coding</span>
                  <span>• AI Feedback</span>
                  <span>• Scoring</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 cursor-pointer hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6 text-center" onClick={onStartSimulator}>
                <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                <h3 className="font-semibold text-xl mb-2">Interview Simulator</h3>
                <p className="text-purple-100 mb-4">Conversational practice with voice/text responses</p>
                <div className="flex justify-center gap-4 text-sm">
                  <span>• Voice Input</span>
                  <span>• One-on-One</span>
                  <span>• Interactive</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-6 text-center">
                <Code className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-semibold text-lg">Coding Challenges</h3>
                <p className="text-green-100">Practice real coding problems</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
              <CardContent className="p-6 text-center">
                <Mic className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-semibold text-lg">Voice Practice</h3>
                <p className="text-orange-100">Practice speaking your answers</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white border-0">
              <CardContent className="p-6 text-center">
                <Trophy className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-semibold text-lg">AI Feedback</h3>
                <p className="text-pink-100">Get instant performance insights</p>
              </CardContent>
            </Card>
          </div>

          {/* Mock Interview Configuration Card */}
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Target className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Mock Interview Configuration
              </CardTitle>
              <p className="text-gray-600 mt-2">Customize your structured interview experience</p>
            </CardHeader>
            
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="topic" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-500" />
                      Interview Topic
                    </Label>
                    <Select value={config.topic} onValueChange={(value) => setConfig({ ...config, topic: value })}>
                      <SelectTrigger className="w-full h-12 text-base">
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

                  <div className="space-y-3">
                    <Label htmlFor="difficulty" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-500" />
                      Difficulty Level
                    </Label>
                    <Select value={config.difficulty} onValueChange={(value) => setConfig({ ...config, difficulty: value })}>
                      <SelectTrigger className="w-full h-12 text-base">
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

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="time" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-500" />
                      Time Limit (minutes)
                    </Label>
                    <Input
                      id="time"
                      type="number"
                      min="10"
                      max="120"
                      value={config.timeLimit}
                      onChange={(e) => setConfig({ ...config, timeLimit: parseInt(e.target.value) || 30 })}
                      className="w-full h-12 text-base"
                    />
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                    <h3 className="font-bold text-gray-800 mb-4 text-lg">Interview Summary</h3>
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <Brain className="w-4 h-4" />
                          Theory Questions:
                        </span>
                        <span className="font-semibold">7</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <Code className="w-4 h-4" />
                          Coding Questions:
                        </span>
                        <span className="font-semibold">3</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Duration:
                        </span>
                        <span className="font-semibold">{config.timeLimit} minutes</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Topic:
                        </span>
                        <span className="font-semibold">{config.topic === 'All' ? 'All Topics' : config.topic}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Difficulty:
                        </span>
                        <span className="font-semibold">{config.difficulty === 'all' ? 'All Levels' : config.difficulty}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Button 
                  onClick={handleStart}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Start Mock Interview
                  <Target className="w-6 h-6 ml-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InterviewSetup;
