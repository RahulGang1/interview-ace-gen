
import { AIQuestion } from '@/services/aiService';

export const fallbackQuestions: AIQuestion[] = [
  {
    id: 'fallback-1',
    type: 'theory',
    question: 'What is the Virtual DOM in React and how does it improve performance?',
    options: [
      'A virtual representation of the real DOM that enables efficient updates',
      'A backup copy of the DOM stored in memory',
      'A debugging tool for React applications',
      'A server-side rendering technique'
    ],
    expectedAnswer: 'A virtual representation of the real DOM that enables efficient updates',
    difficulty: 'medium',
    topic: 'React'
  },
  {
    id: 'fallback-2',
    type: 'theory',
    question: 'What is the difference between let, const, and var in JavaScript?',
    options: [
      'let and const have block scope, var has function scope',
      'They are identical in functionality',
      'var is the newest and most recommended',
      'const can be reassigned, let cannot'
    ],
    expectedAnswer: 'let and const have block scope, var has function scope',
    difficulty: 'easy',
    topic: 'JavaScript'
  },
  {
    id: 'fallback-3',
    type: 'coding',
    question: 'Write a function that removes duplicates from an array.',
    expectedAnswer: 'function removeDuplicates(arr) { return [...new Set(arr)]; } // or using filter: return arr.filter((item, index) => arr.indexOf(item) === index);',
    difficulty: 'easy',
    topic: 'JavaScript'
  },
  {
    id: 'fallback-4',
    type: 'theory',
    question: 'What are React Hooks and why were they introduced?',
    options: [
      'Functions that let you use state and lifecycle features in functional components',
      'A way to create class components more easily',
      'A debugging tool for React applications',
      'A method for handling API calls'
    ],
    expectedAnswer: 'Functions that let you use state and lifecycle features in functional components',
    difficulty: 'medium',
    topic: 'React'
  },
  {
    id: 'fallback-5',
    type: 'coding',
    question: 'Write a function that checks if a string is a palindrome.',
    expectedAnswer: 'function isPalindrome(str) { const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, ""); return cleaned === cleaned.split("").reverse().join(""); }',
    difficulty: 'medium',
    topic: 'JavaScript'
  },
  {
    id: 'fallback-6',
    type: 'theory',
    question: 'What is CSS Flexbox and when would you use it?',
    options: [
      'A layout method for arranging items in rows or columns with flexible sizing',
      'A CSS framework for building responsive websites',
      'A JavaScript library for animations',
      'A tool for optimizing CSS performance'
    ],
    expectedAnswer: 'A layout method for arranging items in rows or columns with flexible sizing',
    difficulty: 'easy',
    topic: 'CSS'
  },
  {
    id: 'fallback-7',
    type: 'theory',
    question: 'What is the purpose of useEffect in React?',
    options: [
      'To perform side effects like API calls, subscriptions, or DOM manipulation',
      'To create state variables in functional components',
      'To optimize component rendering performance',
      'To handle form submissions'
    ],
    expectedAnswer: 'To perform side effects like API calls, subscriptions, or DOM manipulation',
    difficulty: 'medium',
    topic: 'React'
  },
  {
    id: 'fallback-8',
    type: 'coding',
    question: 'Write a function that finds the maximum number in an array.',
    expectedAnswer: 'function findMax(arr) { return Math.max(...arr); } // or using reduce: return arr.reduce((max, current) => current > max ? current : max);',
    difficulty: 'easy',
    topic: 'JavaScript'
  },
  {
    id: 'fallback-9',
    type: 'theory',
    question: 'What is the difference between == and === in JavaScript?',
    options: [
      '=== checks both value and type, == only checks value with type coercion',
      'They are identical in functionality',
      '== is more strict than ===',
      '=== is deprecated and should not be used'
    ],
    expectedAnswer: '=== checks both value and type, == only checks value with type coercion',
    difficulty: 'easy',
    topic: 'JavaScript'
  },
  {
    id: 'fallback-10',
    type: 'coding',
    question: 'Write a function that reverses a string without using built-in reverse methods.',
    expectedAnswer: 'function reverseString(str) { let reversed = ""; for (let i = str.length - 1; i >= 0; i--) { reversed += str[i]; } return reversed; }',
    difficulty: 'easy',
    topic: 'JavaScript'
  }
];

export function getFallbackQuestions(
  theoryCount: number,
  codingCount: number,
  topic: string = 'All',
  difficulty: string = 'all'
): AIQuestion[] {
  let availableQuestions = [...fallbackQuestions];
  
  // Filter by topic if specified
  if (topic !== 'All') {
    availableQuestions = availableQuestions.filter(q => 
      q.topic.toLowerCase() === topic.toLowerCase() || 
      (topic === 'JavaScript' && q.topic === 'JavaScript') ||
      (topic === 'React' && q.topic === 'React') ||
      (topic === 'CSS' && q.topic === 'CSS')
    );
  }
  
  // Filter by difficulty if specified
  if (difficulty !== 'all') {
    availableQuestions = availableQuestions.filter(q => q.difficulty === difficulty);
  }
  
  // Separate theory and coding questions
  const theoryQuestions = availableQuestions.filter(q => q.type === 'theory');
  const codingQuestions = availableQuestions.filter(q => q.type === 'coding');
  
  // Select required number of questions
  const selectedTheory = theoryQuestions.slice(0, theoryCount);
  const selectedCoding = codingQuestions.slice(0, codingCount);
  
  // If we don't have enough questions, duplicate some with modified IDs
  const result = [...selectedTheory, ...selectedCoding];
  
  // Add more questions if needed by cycling through available ones
  while (result.length < theoryCount + codingCount && availableQuestions.length > 0) {
    const question = availableQuestions[result.length % availableQuestions.length];
    result.push({
      ...question,
      id: `${question.id}-${result.length}`
    });
  }
  
  return result.slice(0, theoryCount + codingCount);
}
