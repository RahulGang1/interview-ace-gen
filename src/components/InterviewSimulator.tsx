
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Send, RotateCcw, Home, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ConversationMessage {
  type: 'interviewer' | 'candidate';
  content: string;
  timestamp: Date;
  questionNumber?: number;
}

interface InterviewSimulatorProps {
  onBack: () => void;
}

const InterviewSimulator: React.FC<InterviewSimulatorProps> = ({ onBack }) => {
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  // Sample interview questions (you could expand this or make it dynamic)
  const sampleQuestions = [
    "Tell me about yourself and your background.",
    "Why are you interested in this position?",
    "What is your greatest strength?",
    "Describe a challenging situation you faced and how you handled it.",
    "Where do you see yourself in 5 years?",
    "What motivates you in your work?",
    "How do you handle working under pressure?",
    "What's your approach to learning new technologies?",
    "Tell me about a time you worked in a team.",
    "Do you have any questions for us?"
  ];

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setCurrentAnswer(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: "Could not access microphone. Please type your answer instead.",
          variant: "destructive"
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [toast]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const startInterview = () => {
    setInterviewStarted(true);
    setQuestionCount(1);
    const firstQuestion = sampleQuestions[0];
    
    setConversation([{
      type: 'interviewer',
      content: `Let's begin your interview practice. Here's your first question:\n\n${firstQuestion}`,
      timestamp: new Date(),
      questionNumber: 1
    }]);
  };

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Your browser doesn't support speech recognition. Please type your answer instead.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const submitAnswer = async () => {
    if (!currentAnswer.trim()) {
      toast({
        title: "Empty Answer",
        description: "Please provide an answer before submitting.",
        variant: "destructive"
      });
      return;
    }

    // Add candidate's answer to conversation
    const candidateMessage: ConversationMessage = {
      type: 'candidate',
      content: currentAnswer,
      timestamp: new Date()
    };

    setConversation(prev => [...prev, candidateMessage]);
    setCurrentAnswer('');
    setIsWaitingForResponse(true);

    // Simulate AI processing time
    setTimeout(() => {
      let feedback = "Thank you for your answer. ";
      
      // Simple feedback based on answer length and content
      if (currentAnswer.length < 50) {
        feedback += "Consider providing more detail in your responses. ";
      } else if (currentAnswer.length > 200) {
        feedback += "Great detailed response! ";
      } else {
        feedback += "Good response. ";
      }

      // Determine if we should ask next question or end interview
      const shouldContinue = questionCount < sampleQuestions.length && questionCount < 5; // Limit to 5 questions for demo
      
      if (shouldContinue) {
        const nextQuestion = sampleQuestions[questionCount];
        const nextQuestionNumber = questionCount + 1;
        
        const interviewerResponse: ConversationMessage = {
          type: 'interviewer',
          content: `${feedback}\n\nNext question:\n\n${nextQuestion}`,
          timestamp: new Date(),
          questionNumber: nextQuestionNumber
        };
        
        setConversation(prev => [...prev, interviewerResponse]);
        setQuestionCount(nextQuestionNumber);
      } else {
        // End interview
        const interviewerResponse: ConversationMessage = {
          type: 'interviewer',
          content: `${feedback}\n\nThat concludes our interview practice session. You did well! Remember to practice articulating your thoughts clearly and providing specific examples. Good luck with your real interviews!`,
          timestamp: new Date()
        };
        
        setConversation(prev => [...prev, interviewerResponse]);
      }
      
      setIsWaitingForResponse(false);
    }, 1500);
  };

  const resetInterview = () => {
    setConversation([]);
    setCurrentAnswer('');
    setQuestionCount(0);
    setInterviewStarted(false);
    setIsWaitingForResponse(false);
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg px-4 py-2">
              Interview Simulator
            </Badge>
            {interviewStarted && (
              <Button variant="outline" onClick={resetInterview} className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversation Area */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎯 Interview Practice Session
                  {questionCount > 0 && (
                    <Badge variant="secondary">Question {questionCount}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {!interviewStarted ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-6">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-3xl">🎤</span>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        Ready for Interview Practice?
                      </h2>
                      <p className="text-gray-600 max-w-md">
                        I'll act as your interviewer and ask you questions one at a time. 
                        You can answer by typing or using your microphone.
                      </p>
                      <Button 
                        onClick={startInterview}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
                      >
                        Start Interview Practice
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col">
                    {/* Conversation History */}
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                      {conversation.map((message, index) => (
                        <div key={index} className={`flex ${message.type === 'candidate' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-4 rounded-lg ${
                            message.type === 'candidate' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <div className="flex items-start gap-2">
                              <div className="flex-1">
                                <div className="font-semibold text-sm mb-1">
                                  {message.type === 'candidate' ? 'You' : 'Interviewer'}
                                  {message.questionNumber && ` (Q${message.questionNumber})`}
                                </div>
                                <div className="whitespace-pre-wrap">{message.content}</div>
                              </div>
                              {message.type === 'interviewer' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => speakText(message.content)}
                                  className="text-gray-600 hover:text-gray-800"
                                >
                                  <Volume2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {isWaitingForResponse && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 text-gray-800 p-4 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              <span className="ml-2 text-sm">Interviewer is thinking...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={conversationEndRef} />
                    </div>

                    {/* Answer Input */}
                    {interviewStarted && !isWaitingForResponse && questionCount <= 5 && (
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Type your answer here or use the microphone..."
                          value={currentAnswer}
                          onChange={(e) => setCurrentAnswer(e.target.value)}
                          className="min-h-[100px]"
                        />
                        <div className="flex justify-between items-center">
                          <Button
                            variant="outline"
                            onClick={toggleSpeechRecognition}
                            className={`flex items-center gap-2 ${isListening ? 'bg-red-50 border-red-300' : ''}`}
                          >
                            {isListening ? (
                              <>
                                <MicOff className="w-4 h-4" />
                                Stop Recording
                              </>
                            ) : (
                              <>
                                <Mic className="w-4 h-4" />
                                Use Microphone
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={submitAnswer}
                            disabled={!currentAnswer.trim() || isWaitingForResponse}
                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                          >
                            <Send className="w-4 h-4" />
                            Submit Answer
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Instructions Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    <p className="text-sm text-gray-700">Click "Start Interview Practice" to begin</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    <p className="text-sm text-gray-700">Read each question carefully</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    <p className="text-sm text-gray-700">Answer by typing or using the microphone</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                    <p className="text-sm text-gray-700">Receive feedback and continue to the next question</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tips for Success</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>• Be specific and provide examples</p>
                  <p>• Keep your answers focused and concise</p>
                  <p>• Show enthusiasm and confidence</p>
                  <p>• Practice speaking clearly if using voice</p>
                  <p>• Take your time to think before answering</p>
                </div>
              </CardContent>
            </Card>

            {isListening && (
              <Card className="border-red-300 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-700">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold">Recording...</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">Speak clearly into your microphone</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSimulator;
