
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Send, RotateCcw, Home, Volume2, Play, Square, Code, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ConversationMessage {
  type: 'interviewer' | 'candidate';
  content: string;
  timestamp: Date;
  questionNumber?: number;
  questionType?: 'coding' | 'mcq' | 'written';
  audioUrl?: string;
}

interface InterviewSimulatorProps {
  onBack: () => void;
}

const InterviewSimulator: React.FC<InterviewSimulatorProps> = ({ onBack }) => {
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [currentQuestionType, setCurrentQuestionType] = useState<'coding' | 'mcq' | 'written'>('written');
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  // Different types of interview questions
  const questionsByType = {
    coding: [
      "Write a function to reverse a string without using built-in reverse methods. Please explain your approach step by step.",
      "How would you find the largest element in an array? Write the code and explain the time complexity.",
      "Implement a function to check if a string is a palindrome. Walk me through your solution.",
      "Write a function to remove duplicates from an array. What approach would you use?",
      "How would you implement a simple calculator that handles addition, subtraction, multiplication, and division?"
    ],
    mcq: [
      "Which of the following is NOT a JavaScript data type?\nA) String\nB) Boolean\nC) Float\nD) Undefined\n\nPlease say your answer choice and explain why.",
      "What does HTML stand for?\nA) Hyper Text Markup Language\nB) High Tech Modern Language\nC) Home Tool Markup Language\nD) Hyperlink and Text Markup Language\n\nChoose your answer and explain.",
      "Which HTTP method is used to update existing data?\nA) GET\nB) POST\nC) PUT\nD) DELETE\n\nSelect your answer and provide reasoning.",
      "What is the time complexity of binary search?\nA) O(n)\nB) O(log n)\nC) O(n²)\nD) O(1)\n\nChoose and explain your answer.",
      "Which CSS property is used to change text color?\nA) font-color\nB) text-color\nC) color\nD) background-color\n\nPick your answer and justify it."
    ],
    written: [
      "Tell me about yourself and your professional background. Please speak clearly about your experience and skills.",
      "Why are you interested in this position? Describe your motivation and what attracts you to this role.",
      "Describe a challenging project you worked on. What was the problem and how did you solve it?",
      "How do you handle working under pressure and tight deadlines? Give me specific examples.",
      "Where do you see yourself in 5 years? What are your career goals and aspirations?"
    ]
  };

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
          description: "Could not access microphone for voice typing. Please check permissions.",
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

  const getRandomQuestionType = (): 'coding' | 'mcq' | 'written' => {
    const types: ('coding' | 'mcq' | 'written')[] = ['coding', 'mcq', 'written'];
    return types[Math.floor(Math.random() * types.length)];
  };

  const getQuestionIcon = (type: 'coding' | 'mcq' | 'written') => {
    switch (type) {
      case 'coding':
        return <Code className="w-4 h-4" />;
      case 'mcq':
        return <CheckCircle className="w-4 h-4" />;
      case 'written':
        return <FileText className="w-4 h-4" />;
    }
  };

  const startInterview = () => {
    setInterviewStarted(true);
    setQuestionCount(1);
    const questionType = getRandomQuestionType();
    setCurrentQuestionType(questionType);
    const firstQuestion = questionsByType[questionType][0];
    
    setConversation([{
      type: 'interviewer',
      content: `Let's begin your interview practice with a ${questionType} question:\n\n${firstQuestion}`,
      timestamp: new Date(),
      questionNumber: 1,
      questionType: questionType
    }]);

    // Speak the first question
    speakText(`Let's begin your interview practice with a ${questionType} question: ${firstQuestion}`);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Speak your answer clearly. Click stop when finished.",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast({
        title: "Recording Stopped",
        description: "Your audio has been recorded. You can play it back or submit your answer.",
      });
    }
  };

  const playRecordedAudio = () => {
    if (recordedAudioUrl) {
      const audio = new Audio(recordedAudioUrl);
      audio.play();
    }
  };

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice Typing Not Available",
        description: "Your browser doesn't support voice typing. Please use the recording feature instead.",
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
      toast({
        title: "Voice Typing Started",
        description: "Speak clearly and your words will appear in the text box.",
      });
    }
  };

  const submitAnswer = async () => {
    if (!currentAnswer.trim() && !recordedAudioUrl) {
      toast({
        title: "No Answer Provided",
        description: "Please provide an answer by typing, speaking, or recording audio.",
        variant: "destructive"
      });
      return;
    }

    // Add candidate's answer to conversation
    const candidateMessage: ConversationMessage = {
      type: 'candidate',
      content: currentAnswer || "Audio response recorded",
      timestamp: new Date(),
      audioUrl: recordedAudioUrl || undefined
    };

    setConversation(prev => [...prev, candidateMessage]);
    setCurrentAnswer('');
    setRecordedAudioUrl(null);
    setIsWaitingForResponse(true);

    // Enhanced feedback based on question type and answer analysis
    setTimeout(() => {
      let feedback = "Thank you for your response. ";
      
      // Type-specific feedback
      if (currentQuestionType === 'coding' && currentAnswer) {
        const hasCode = currentAnswer.includes('function') || currentAnswer.includes('for') || currentAnswer.includes('if');
        const explainedApproach = currentAnswer.toLowerCase().includes('approach') || currentAnswer.toLowerCase().includes('method');
        
        if (hasCode) {
          feedback += "Good job including code in your answer. ";
        } else {
          feedback += "Consider providing actual code examples in coding questions. ";
        }
        
        if (explainedApproach) {
          feedback += "Excellent explanation of your approach. ";
        }
      } else if (currentQuestionType === 'mcq' && currentAnswer) {
        const hasChoice = /[A-D]/.test(currentAnswer.toUpperCase());
        const hasExplanation = currentAnswer.split(' ').length > 10;
        
        if (hasChoice) {
          feedback += "Good job selecting an option. ";
        } else {
          feedback += "Make sure to clearly state your choice (A, B, C, or D). ";
        }
        
        if (hasExplanation) {
          feedback += "Great explanation of your reasoning. ";
        } else {
          feedback += "Try to explain why you chose that option. ";
        }
      } else if (currentQuestionType === 'written' && currentAnswer) {
        const wordCount = currentAnswer.split(' ').length;
        const hasExamples = currentAnswer.toLowerCase().includes('example') || currentAnswer.toLowerCase().includes('instance');
        
        if (wordCount < 30) {
          feedback += "Consider providing more detailed responses. ";
        } else if (wordCount > 100) {
          feedback += "Well-detailed response! ";
        }
        
        if (hasExamples) {
          feedback += "Excellent use of specific examples. ";
        }
      }

      // Determine if we should ask next question or end interview
      const shouldContinue = questionCount < 5;
      
      if (shouldContinue) {
        const nextQuestionType = getRandomQuestionType();
        const questionTypeIndex = Math.floor(Math.random() * questionsByType[nextQuestionType].length);
        const nextQuestion = questionsByType[nextQuestionType][questionTypeIndex];
        const nextQuestionNumber = questionCount + 1;
        
        setCurrentQuestionType(nextQuestionType);
        
        const interviewerResponse: ConversationMessage = {
          type: 'interviewer',
          content: `${feedback}\n\nNext question (${nextQuestionType}):\n\n${nextQuestion}`,
          timestamp: new Date(),
          questionNumber: nextQuestionNumber,
          questionType: nextQuestionType
        };
        
        setConversation(prev => [...prev, interviewerResponse]);
        setQuestionCount(nextQuestionNumber);
        
        // Speak the feedback and next question
        speakText(`${feedback} Next question: ${nextQuestion}`);
      } else {
        // End interview
        const finalFeedback = `${feedback}\n\nThat concludes our interview practice session. You practiced different question types:\n\n• Coding questions: Focus on clear logic and explanation\n• MCQ questions: Always explain your reasoning\n• Written questions: Use specific examples\n\nGreat job practicing! Keep improving your interview skills.`;
        
        const interviewerResponse: ConversationMessage = {
          type: 'interviewer',
          content: finalFeedback,
          timestamp: new Date()
        };
        
        setConversation(prev => [...prev, interviewerResponse]);
        speakText("That concludes our interview practice session. Great job practicing different question types!");
      }
      
      setIsWaitingForResponse(false);
    }, 2000);
  };

  const resetInterview = () => {
    setConversation([]);
    setCurrentAnswer('');
    setQuestionCount(0);
    setInterviewStarted(false);
    setIsWaitingForResponse(false);
    setRecordedAudioUrl(null);
    setCurrentQuestionType('written');
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    if (isRecording) {
      stopRecording();
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
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
              Multi-Type Interview Simulator
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
                  🎯 Voice Interview Practice
                  {questionCount > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Question {questionCount}/5</Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getQuestionIcon(currentQuestionType)}
                        {currentQuestionType.toUpperCase()}
                      </Badge>
                    </div>
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
                        Multi-Type Interview Practice
                      </h2>
                      <p className="text-gray-600 max-w-md">
                        Practice with 3 types of questions: Coding, MCQ, and Written. 
                        Answer by typing or speaking with voice-to-text conversion!
                      </p>
                      <div className="flex justify-center gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Code className="w-4 h-4 text-blue-600" />
                          <span>Coding</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>MCQ</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-purple-600" />
                          <span>Written</span>
                        </div>
                      </div>
                      <Button 
                        onClick={startInterview}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
                      >
                        Start Multi-Type Interview
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
                                <div className="font-semibold text-sm mb-1 flex items-center gap-2">
                                  {message.type === 'candidate' ? 'You' : 'Interviewer'}
                                  {message.questionNumber && (
                                    <span className="flex items-center gap-1">
                                      (Q{message.questionNumber})
                                      {message.questionType && getQuestionIcon(message.questionType)}
                                    </span>
                                  )}
                                </div>
                                <div className="whitespace-pre-wrap">{message.content}</div>
                                {message.audioUrl && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const audio = new Audio(message.audioUrl);
                                      audio.play();
                                    }}
                                    className="mt-2 text-white hover:text-gray-200"
                                  >
                                    <Play className="w-4 h-4 mr-1" />
                                    Play Recording
                                  </Button>
                                )}
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
                              <span className="ml-2 text-sm">Analyzing your response...</span>
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
                          placeholder="Type your answer here, or use voice typing to speak your response..."
                          value={currentAnswer}
                          onChange={(e) => setCurrentAnswer(e.target.value)}
                          className="min-h-[100px]"
                        />
                        
                        {/* Voice Input Controls */}
                        <div className="flex flex-wrap gap-2 items-center justify-between">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={toggleSpeechRecognition}
                              className={`flex items-center gap-2 ${isListening ? 'bg-green-50 border-green-300 text-green-700' : ''}`}
                            >
                              {isListening ? (
                                <>
                                  <MicOff className="w-4 h-4" />
                                  Stop Voice Typing
                                </>
                              ) : (
                                <>
                                  <Mic className="w-4 h-4" />
                                  Start Voice Typing
                                </>
                              )}
                            </Button>
                            
                            <Button
                              variant="outline"
                              onClick={isRecording ? stopRecording : startRecording}
                              className={`flex items-center gap-2 ${isRecording ? 'bg-red-50 border-red-300 text-red-700' : ''}`}
                            >
                              {isRecording ? (
                                <>
                                  <Square className="w-4 h-4" />
                                  Stop Recording
                                </>
                              ) : (
                                <>
                                  <Mic className="w-4 h-4" />
                                  Record Audio
                                </>
                              )}
                            </Button>
                            
                            {recordedAudioUrl && (
                              <Button
                                variant="outline"
                                onClick={playRecordedAudio}
                                className="flex items-center gap-2"
                              >
                                <Play className="w-4 h-4" />
                                Play Back
                              </Button>
                            )}
                          </div>
                          
                          <Button
                            onClick={submitAnswer}
                            disabled={(!currentAnswer.trim() && !recordedAudioUrl) || isWaitingForResponse}
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
                <CardTitle className="text-lg">Question Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Code className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Coding Questions</p>
                      <p className="text-xs text-gray-600">Write code, explain logic, discuss complexity</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">MCQ Questions</p>
                      <p className="text-xs text-gray-600">Choose answer and explain reasoning</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Written Questions</p>
                      <p className="text-xs text-gray-600">Behavioral and experience-based questions</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Voice Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    <p className="text-sm text-gray-700"><strong>Voice Typing:</strong> Speak and see text appear automatically</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    <p className="text-sm text-gray-700"><strong>Audio Recording:</strong> Record your complete response</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    <p className="text-sm text-gray-700"><strong>Text Input:</strong> Traditional typing option</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tips by Question Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-700">
                  <div>
                    <p className="font-semibold text-blue-600">Coding:</p>
                    <p>• Explain your thought process</p>
                    <p>• Write clean, readable code</p>
                    <p>• Discuss time/space complexity</p>
                  </div>
                  <div>
                    <p className="font-semibold text-green-600">MCQ:</p>
                    <p>• State your choice clearly</p>
                    <p>• Explain your reasoning</p>
                    <p>• Eliminate wrong options</p>
                  </div>
                  <div>
                    <p className="font-semibold text-purple-600">Written:</p>
                    <p>• Use specific examples</p>
                    <p>• Structure your response</p>
                    <p>• Be authentic and detailed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {(isListening || isRecording) && (
              <Card className={`border-2 ${isListening ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                <CardContent className="pt-6">
                  <div className={`flex items-center gap-2 ${isListening ? 'text-green-700' : 'text-red-700'}`}>
                    <div className={`w-3 h-3 rounded-full animate-pulse ${isListening ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="font-semibold">
                      {isListening ? 'Voice Typing Active...' : 'Recording Audio...'}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${isListening ? 'text-green-600' : 'text-red-600'}`}>
                    {isListening 
                      ? 'Speak clearly - your words will appear in the text box as you speak' 
                      : 'Recording your complete response - click Stop Recording when finished'
                    }
                  </p>
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
