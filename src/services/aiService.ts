
import { supabase } from '@/integrations/supabase/client';

export interface AIQuestion {
  id: string;
  type: 'theory' | 'coding';
  question: string;
  options?: string[];
  expectedAnswer: string;
  difficulty: string;
  topic: string;
  voiceEnabled?: boolean;
}

export interface AIFeedback {
  score: number;
  overallFeedback: string;
  questionFeedbacks: {
    questionId: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  focusAreas?: string[];
  recommendedTopics?: string[];
}

const fallbackQuestions: AIQuestion[] = [
  {
    id: 'fb-1',
    type: 'theory',
    question: 'What is the difference between == and === in JavaScript?',
    options: [
      '== checks type and value, === checks only value',
      '== checks only value, === checks type and value',
      'They are exactly the same',
      '== is for numbers, === is for strings'
    ],
    expectedAnswer: '== checks only value, === checks type and value',
    difficulty: 'medium',
    topic: 'JavaScript',
    voiceEnabled: true
  },
  {
    id: 'fb-2',
    type: 'theory',
    question: 'Explain what React hooks are and name three commonly used hooks.',
    expectedAnswer: 'React hooks are functions that allow you to use state and other React features in functional components. Three commonly used hooks are: useState (for managing state), useEffect (for side effects), and useContext (for consuming context).',
    difficulty: 'medium',
    topic: 'React',
    voiceEnabled: true
  },
  {
    id: 'fb-3',
    type: 'coding',
    question: 'Write a function that takes an array of numbers and returns the sum of all even numbers.',
    expectedAnswer: 'function sumEvenNumbers(arr) { return arr.filter(num => num % 2 === 0).reduce((sum, num) => sum + num, 0); }',
    difficulty: 'easy',
    topic: 'JavaScript'
  },
  {
    id: 'fb-4',
    type: 'theory',
    question: 'What is the purpose of the "key" prop in React lists?',
    options: [
      'To style list items',
      'To help React identify which items have changed',
      'To make lists sortable',
      'To add unique IDs to elements'
    ],
    expectedAnswer: 'To help React identify which items have changed',
    difficulty: 'easy',
    topic: 'React',
    voiceEnabled: true
  },
  {
    id: 'fb-5',
    type: 'coding',
    question: 'Write a function to check if a string is a palindrome (reads the same forwards and backwards).',
    expectedAnswer: 'function isPalindrome(str) { const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, ""); return cleaned === cleaned.split("").reverse().join(""); }',
    difficulty: 'medium',
    topic: 'JavaScript'
  },
  {
    id: 'fb-6',
    type: 'theory',
    question: 'Describe the concept of closures in JavaScript with an example.',
    expectedAnswer: 'A closure is when an inner function has access to variables from its outer function scope even after the outer function has returned. Example: function outer(x) { return function inner(y) { return x + y; }; } const add5 = outer(5); add5(3) returns 8.',
    difficulty: 'hard',
    topic: 'JavaScript',
    voiceEnabled: true
  },
  {
    id: 'fb-7',
    type: 'theory',
    question: 'What is the virtual DOM in React and why is it useful?',
    options: [
      'A copy of the HTML DOM stored in memory',
      'A JavaScript representation of the DOM that enables efficient updates',
      'A database for storing component state',
      'A tool for debugging React applications'
    ],
    expectedAnswer: 'A JavaScript representation of the DOM that enables efficient updates',
    difficulty: 'medium',
    topic: 'React',
    voiceEnabled: true
  }
];

export const generateQuestions = async (
  topic: string,
  difficulty: string,
  theoryCount: number,
  codingCount: number
): Promise<AIQuestion[]> => {
  console.log('Generating questions for:', { topic, difficulty, theoryCount, codingCount });
  
  try {
    const { data, error } = await supabase.functions.invoke('generate-questions', {
      body: {
        topic,
        difficulty,
        theoryCount,
        codingCount
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }

    if (data && data.questions && Array.isArray(data.questions)) {
      console.log('AI Generated questions:', data.questions);
      // Add voice enabled flag to some theory questions
      const questionsWithVoice = data.questions.map((q: AIQuestion, index: number) => ({
        ...q,
        voiceEnabled: q.type === 'theory' && index % 2 === 0 // Enable voice for every other theory question
      }));
      return questionsWithVoice;
    }
    
    throw new Error('Invalid response format from AI service');
  } catch (error) {
    console.error('Failed to generate questions with AI, using fallback:', error);
    
    // Filter fallback questions based on criteria
    let filtered = fallbackQuestions.filter(q => {
      if (topic !== 'All' && q.topic !== topic) return false;
      if (difficulty !== 'all' && q.difficulty !== difficulty) return false;
      return true;
    });
    
    // Separate theory and coding questions
    const theoryQuestions = filtered.filter(q => q.type === 'theory').slice(0, theoryCount);
    const codingQuestions = filtered.filter(q => q.type === 'coding').slice(0, codingCount);
    
    return [...theoryQuestions, ...codingQuestions];
  }
};

export const evaluateAnswers = async (
  questions: AIQuestion[],
  answers: Record<string, string>
): Promise<AIFeedback> => {
  console.log('Evaluating answers:', { questions, answers });
  
  try {
    const { data, error } = await supabase.functions.invoke('evaluate-answers', {
      body: {
        questions,
        answers
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }

    if (data && data.feedback) {
      console.log('AI Evaluation result:', data.feedback);
      return data.feedback;
    }
    
    throw new Error('Invalid response format from AI service');
  } catch (error) {
    console.error('Failed to evaluate with AI, using fallback:', error);
    
    // Fallback evaluation logic
    const questionFeedbacks = questions.map(question => {
      const userAnswer = answers[question.id] || '';
      const isCorrect = userAnswer.toLowerCase().includes(question.expectedAnswer.toLowerCase()) ||
                       question.expectedAnswer.toLowerCase().includes(userAnswer.toLowerCase());
      
      return {
        questionId: question.id,
        isCorrect,
        feedback: isCorrect 
          ? 'Good answer! You demonstrated understanding of the concept.'
          : 'This answer could be improved. Review the expected answer for better understanding.'
      };
    });

    const correctCount = questionFeedbacks.filter(f => f.isCorrect).length;
    const score = Math.round((correctCount / questions.length) * 100);

    return {
      score,
      overallFeedback: score >= 80 
        ? 'Excellent performance! You have a strong understanding of the topics.'
        : score >= 60 
        ? 'Good effort! There are some areas where you can improve.'
        : 'Keep practicing! Focus on understanding the fundamental concepts better.',
      questionFeedbacks,
      focusAreas: score < 80 ? ['Review fundamental concepts', 'Practice more coding problems'] : [],
      recommendedTopics: score < 60 ? ['JavaScript Basics', 'React Fundamentals'] : []
    };
  }
};
