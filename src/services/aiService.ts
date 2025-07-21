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

let usedQuestionIds: Set<string> = new Set();

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
  },
  {
    id: 'fb-8',
    type: 'theory',
    question: 'What is event bubbling in JavaScript?',
    options: [
      'Events that create bubbles in the UI',
      'Events that propagate from child to parent elements',
      'Events that happen in sequence',
      'Events that are delayed'
    ],
    expectedAnswer: 'Events that propagate from child to parent elements',
    difficulty: 'medium',
    topic: 'JavaScript',
    voiceEnabled: true
  },
  {
    id: 'fb-9',
    type: 'coding',
    question: 'Write a function to find the maximum number in an array without using Math.max().',
    expectedAnswer: 'function findMax(arr) { let max = arr[0]; for (let i = 1; i < arr.length; i++) { if (arr[i] > max) max = arr[i]; } return max; }',
    difficulty: 'easy',
    topic: 'JavaScript'
  },
  {
    id: 'fb-10',
    type: 'theory',
    question: 'What is the difference between let, const, and var in JavaScript?',
    expectedAnswer: 'var has function scope and can be redeclared, let has block scope and can be reassigned but not redeclared, const has block scope and cannot be reassigned or redeclared.',
    difficulty: 'medium',
    topic: 'JavaScript',
    voiceEnabled: true
  },
  {
    id: 'fb-11',
    type: 'coding',
    question: 'Write a function to remove duplicates from an array.',
    expectedAnswer: 'function removeDuplicates(arr) { return [...new Set(arr)]; } // or arr.filter((item, index) => arr.indexOf(item) === index)',
    difficulty: 'easy',
    topic: 'JavaScript'
  },
  {
    id: 'fb-12',
    type: 'theory',
    question: 'What is the difference between props and state in React?',
    expectedAnswer: 'Props are read-only data passed from parent to child components, while state is mutable data that belongs to a component and can be changed using setState or hooks.',
    difficulty: 'easy',
    topic: 'React',
    voiceEnabled: true
  }
];

// Function to get unique questions
const getUniqueQuestions = (questions: AIQuestion[], count: number): AIQuestion[] => {
  const availableQuestions = questions.filter(q => !usedQuestionIds.has(q.id));
  
  // If we don't have enough unused questions, reset the used set partially
  if (availableQuestions.length < count) {
    const halfUsed = Math.floor(usedQuestionIds.size / 2);
    const usedArray = Array.from(usedQuestionIds);
    // Keep only the most recent half of used questions
    usedQuestionIds = new Set(usedArray.slice(halfUsed));
  }
  
  const finalAvailable = questions.filter(q => !usedQuestionIds.has(q.id));
  const shuffled = [...finalAvailable].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);
  
  // Mark selected questions as used
  selected.forEach(q => usedQuestionIds.add(q.id));
  
  return selected;
};

export const generateQuestions = async (
  topic: string,
  difficulty: string,
  theoryCount: number,
  codingCount: number,
  language?: string
): Promise<AIQuestion[]> => {
  console.log('Generating unique questions for:', { topic, difficulty, theoryCount, codingCount });
  
  try {
    const { data, error } = await supabase.functions.invoke('generate-questions', {
      body: {
        topic,
        difficulty,
        theoryCount,
        codingCount,
        language,
        excludeIds: Array.from(usedQuestionIds) // Send used IDs to avoid repetition
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }

    if (data && data.questions && Array.isArray(data.questions)) {
      console.log('AI Generated questions:', data.questions);
      // Add voice enabled flag and mark as used
      const questionsWithVoice = data.questions.map((q: AIQuestion, index: number) => ({
        ...q,
        voiceEnabled: q.type === 'theory' && index % 2 === 0
      }));
      
      // Mark these questions as used
      questionsWithVoice.forEach((q: AIQuestion) => usedQuestionIds.add(q.id));
      
      return questionsWithVoice;
    }
    
    throw new Error('Invalid response format from AI service');
  } catch (error) {
    console.error('Failed to generate questions with AI, using fallback:', error);
    
    // Filter fallback questions based on criteria
    let filtered = fallbackQuestions.filter(q => {
      if (topic !== 'All' && q.topic !== topic) return false;
      if (difficulty !== 'all' && q.difficulty !== difficulty) return false;
      if (language && language !== 'All' && q.topic !== language) return false;
      return true;
    });
    
    // Get unique theory and coding questions
    const theoryQuestions = getUniqueQuestions(filtered.filter(q => q.type === 'theory'), theoryCount);
    const codingQuestions = getUniqueQuestions(filtered.filter(q => q.type === 'coding'), codingCount);
    
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
    console.error('Failed to evaluate with AI, using enhanced fallback:', error);
    
    // Enhanced fallback evaluation logic
    const questionFeedbacks = questions.map(question => {
      const userAnswer = answers[question.id] || '';
      let isCorrect = false;
      let feedback = '';
      
      if (question.type === 'theory' && question.options) {
        // MCQ questions
        isCorrect = userAnswer === question.expectedAnswer;
        feedback = isCorrect 
          ? 'Correct! You selected the right answer.' 
          : `Incorrect. The correct answer is: "${question.expectedAnswer}". Your answer was: "${userAnswer}".`;
      } else if (question.type === 'theory') {
        // Open-ended theory questions
        const userLower = userAnswer.toLowerCase();
        const expectedLower = question.expectedAnswer.toLowerCase();
        const keyWords = expectedLower.split(' ').filter(word => word.length > 3);
        const matchedWords = keyWords.filter(word => userLower.includes(word));
        
        isCorrect = matchedWords.length >= Math.ceil(keyWords.length * 0.6); // 60% keyword match
        feedback = isCorrect 
          ? 'Good answer! You covered the key concepts well.' 
          : `Your answer partially addresses the question. Key points to include: ${question.expectedAnswer}`;
      } else {
        // Coding questions
        isCorrect = userAnswer.length > 20 && (
          userAnswer.includes('function') || 
          userAnswer.includes('=>') || 
          userAnswer.includes('return')
        );
        feedback = isCorrect 
          ? 'Good coding approach! Your solution shows understanding of the problem.' 
          : `Your code could be improved. Consider this approach: ${question.expectedAnswer}`;
      }
      
      return {
        questionId: question.id,
        isCorrect,
        feedback
      };
    });

    const correctCount = questionFeedbacks.filter(f => f.isCorrect).length;
    const score = Math.round((correctCount / questions.length) * 100);

    // Enhanced feedback based on performance
    let overallFeedback = '';
    let focusAreas: string[] = [];
    let recommendedTopics: string[] = [];

    if (score >= 90) {
      overallFeedback = 'Outstanding performance! You have excellent command over the topics. You\'re well-prepared for technical interviews.';
    } else if (score >= 75) {
      overallFeedback = 'Great job! You have a solid understanding of most concepts. With a bit more practice, you\'ll be ready for any interview.';
      focusAreas = ['Review the questions you got wrong', 'Practice similar problems'];
    } else if (score >= 60) {
      overallFeedback = 'Good effort! You understand the basics but need to strengthen your knowledge in some areas.';
      focusAreas = ['Focus on fundamental concepts', 'Practice coding problems daily', 'Review theory questions'];
      recommendedTopics = ['JavaScript Fundamentals', 'React Basics'];
    } else if (score >= 40) {
      overallFeedback = 'You\'re on the right track but need significant improvement. Focus on understanding core concepts before moving to advanced topics.';
      focusAreas = ['Study fundamental programming concepts', 'Practice basic coding exercises', 'Review theory thoroughly'];
      recommendedTopics = ['Programming Basics', 'JavaScript Fundamentals', 'Problem Solving'];
    } else {
      overallFeedback = 'Don\'t worry! Everyone starts somewhere. Focus on building a strong foundation with basic concepts and practice regularly.';
      focusAreas = ['Start with programming fundamentals', 'Take online tutorials', 'Practice daily with simple problems'];
      recommendedTopics = ['Programming Fundamentals', 'Basic JavaScript', 'Logic Building'];
    }

    return {
      score,
      overallFeedback,
      questionFeedbacks,
      focusAreas,
      recommendedTopics
    };
  }
};

// Reset used questions (can be called when user wants fresh start)
export const resetQuestionHistory = () => {
  usedQuestionIds.clear();
  console.log('Question history reset');
};
