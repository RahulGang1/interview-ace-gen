
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, MessageCircle, Zap, Users, Star, ChevronRight, BookOpen, Code, Mic, Bot } from 'lucide-react';
import InterviewSimulator from '@/components/InterviewSimulator';
import EnhancedAssessment from '@/components/EnhancedAssessment';

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'simulator' | 'assessment'>('home');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('React');

  const languages = ['React', 'JavaScript', 'HTML', 'CSS', 'Express.js', 'Node.js'];

  if (currentView === 'simulator') {
    return <InterviewSimulator onBack={() => setCurrentView('home')} selectedLanguage={selectedLanguage} />;
  }

  if (currentView === 'assessment') {
    return <EnhancedAssessment onBack={() => setCurrentView('home')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                <Brain className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              AI Interview{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Practice
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Master your interview skills with AI-powered practice sessions, voice interaction, 
              and comprehensive coding assessments.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge variant="outline" className="text-sm px-4 py-2">
                <Zap className="w-4 h-4 mr-2" />
                AI-Powered Questions
              </Badge>
              <Badge variant="outline" className="text-sm px-4 py-2">
                <Mic className="w-4 h-4 mr-2" />
                Voice Recognition
              </Badge>
              <Badge variant="outline" className="text-sm px-4 py-2">
                <Code className="w-4 h-4 mr-2" />
                Code Evaluation
              </Badge>
            </div>
            
            {/* Language Selection */}
            <div className="max-w-md mx-auto mb-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Choose Your Interview Language</h3>
                  <p className="text-sm text-gray-600">Select the technology you want to focus on</p>
                </div>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-full h-12 text-base bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang} value={lang}>
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4" />
                          {lang}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-3 text-center">
                  <Badge variant="secondary" className="text-xs">
                    Selected: {selectedLanguage}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Features */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          {/* Voice Interview Simulator */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-300 cursor-pointer"
                onClick={() => setCurrentView('simulator')}>
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <MessageCircle className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl mb-2">Voice Interview Simulator</CardTitle>
              <p className="text-gray-600 text-sm">
                Theory questions only - speak your answers naturally
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Theory questions only
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Voice-to-text conversion
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Interactive conversation
                </div>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                Start Simulator
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Enhanced AI Assessment */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-green-300 cursor-pointer"
                onClick={() => setCurrentView('assessment')}>
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <Bot className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl mb-2">AI Assessment Suite</CardTitle>
              <p className="text-gray-600 text-sm">
                Comprehensive evaluation with MCQ, coding, and voice questions
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  7 MCQ + 2 Coding + 3 Voice
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  AI-powered code evaluation
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Comprehensive score analysis
                </div>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                Take Assessment
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need to Ace Your Interview
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI-powered platform provides comprehensive interview preparation 
            with cutting-edge voice recognition and intelligent evaluation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI Question Generation</h3>
            <p className="text-sm text-gray-600">
              Dynamic questions tailored to your chosen topics and difficulty level
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Mic className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Voice Recognition</h3>
            <p className="text-sm text-gray-600">
              Practice speaking with real-time speech-to-text conversion
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Code className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Code Evaluation</h3>
            <p className="text-sm text-gray-600">
              Automated assessment of coding solutions with detailed feedback
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Feedback</h3>
            <p className="text-sm text-gray-600">
              Detailed analysis and recommendations for improvement
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Master Your Next Interview?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Choose your preferred practice mode and start improving your interview skills today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => setCurrentView('simulator')}
            >
              Start Voice Practice
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-600"
              onClick={() => setCurrentView('assessment')}
            >
              Take AI Assessment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
