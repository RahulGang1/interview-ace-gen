
export interface TheoryQuestion {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

export interface CodingQuestion {
  id: string;
  problem: string;
  expectedOutput: string;
  solution: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  testCases?: { input: string; output: string }[];
}

export const theoryQuestions: TheoryQuestion[] = [
  // React Questions
  {
    id: 'react-1',
    question: 'What is the primary purpose of useEffect in React?',
    options: ['To manage component state', 'To handle side effects', 'To create components', 'To style components'],
    answer: 'To handle side effects',
    explanation: 'useEffect is used for side effects like data fetching, subscriptions, timers, and manually changing the DOM.',
    difficulty: 'easy',
    topic: 'React'
  },
  {
    id: 'react-2',
    question: 'Which hook would you use to optimize expensive calculations in React?',
    options: ['useState', 'useEffect', 'useMemo', 'useCallback'],
    answer: 'useMemo',
    explanation: 'useMemo is used to memoize expensive calculations and prevent unnecessary re-computations.',
    difficulty: 'medium',
    topic: 'React'
  },
  {
    id: 'react-3',
    question: 'What is the difference between useCallback and useMemo?',
    options: ['No difference', 'useCallback memoizes functions, useMemo memoizes values', 'useMemo is deprecated', 'useCallback is for classes only'],
    answer: 'useCallback memoizes functions, useMemo memoizes values',
    explanation: 'useCallback returns a memoized function, while useMemo returns a memoized value from a function.',
    difficulty: 'hard',
    topic: 'React'
  },
  // JavaScript Questions
  {
    id: 'js-1',
    question: 'What does "this" keyword refer to in JavaScript?',
    options: ['Current function', 'Global object', 'Depends on context', 'Previous function'],
    answer: 'Depends on context',
    explanation: 'The "this" keyword refers to different objects depending on how it is used - in methods, events, functions, etc.',
    difficulty: 'easy',
    topic: 'JavaScript'
  },
  {
    id: 'js-2',
    question: 'What is closure in JavaScript?',
    options: ['A type of loop', 'Function with access to outer scope', 'A way to close functions', 'Error handling mechanism'],
    answer: 'Function with access to outer scope',
    explanation: 'A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function returns.',
    difficulty: 'medium',
    topic: 'JavaScript'
  },
  {
    id: 'js-3',
    question: 'What is the difference between call, apply, and bind?',
    options: ['No difference', 'Different syntax only', 'Different ways to set this context', 'Only bind is useful'],
    answer: 'Different ways to set this context',
    explanation: 'call() calls function with given this and arguments, apply() same but with array, bind() returns new function with bound this.',
    difficulty: 'hard',
    topic: 'JavaScript'
  },
  // CSS Questions
  {
    id: 'css-1',
    question: 'What does CSS stand for?',
    options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style Sheets', 'Colorful Style Sheets'],
    answer: 'Cascading Style Sheets',
    explanation: 'CSS stands for Cascading Style Sheets, used to style HTML elements.',
    difficulty: 'easy',
    topic: 'CSS'
  },
  {
    id: 'css-2',
    question: 'What is the difference between margin and padding?',
    options: ['No difference', 'Margin is inside, padding is outside', 'Padding is inside, margin is outside', 'Only margin affects layout'],
    answer: 'Padding is inside, margin is outside',
    explanation: 'Padding is the space inside an element between content and border. Margin is the space outside the border.',
    difficulty: 'medium',
    topic: 'CSS'
  },
  // Node.js Questions
  {
    id: 'node-1',
    question: 'What is Node.js?',
    options: ['A browser', 'JavaScript runtime', 'A database', 'A framework'],
    answer: 'JavaScript runtime',
    explanation: 'Node.js is a JavaScript runtime built on Chrome\'s V8 JavaScript engine for server-side development.',
    difficulty: 'easy',
    topic: 'Node.js'
  }
];

export const codingQuestions: CodingQuestion[] = [
  // JavaScript Coding
  {
    id: 'code-js-1',
    problem: 'Write a function to reverse a string in JavaScript.',
    expectedOutput: 'olleh',
    solution: 'function reverseString(str) { return str.split("").reverse().join(""); }',
    explanation: 'split("") converts string to array, reverse() reverses the array, join("") converts back to string.',
    difficulty: 'easy',
    topic: 'JavaScript',
    testCases: [
      { input: '"hello"', output: '"olleh"' },
      { input: '"world"', output: '"dlrow"' }
    ]
  },
  {
    id: 'code-js-2',
    problem: 'Write a function to find the largest number in an array.',
    expectedOutput: '9',
    solution: 'function findMax(arr) { return Math.max(...arr); }',
    explanation: 'Math.max() with spread operator finds the maximum value in an array.',
    difficulty: 'easy',
    topic: 'JavaScript',
    testCases: [
      { input: '[1, 5, 3, 9, 2]', output: '9' },
      { input: '[10, 20, 5]', output: '20' }
    ]
  },
  {
    id: 'code-js-3',
    problem: 'Write a function to check if a string is a palindrome.',
    expectedOutput: 'true',
    solution: 'function isPalindrome(str) { const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, ""); return cleaned === cleaned.split("").reverse().join(""); }',
    explanation: 'Clean the string, convert to lowercase, and check if it equals its reverse.',
    difficulty: 'medium',
    topic: 'JavaScript',
    testCases: [
      { input: '"racecar"', output: 'true' },
      { input: '"hello"', output: 'false' }
    ]
  },
  // React Coding
  {
    id: 'code-react-1',
    problem: 'Create a simple counter component using useState hook.',
    expectedOutput: 'Component with increment/decrement buttons',
    solution: 'function Counter() { const [count, setCount] = useState(0); return (<div><p>{count}</p><button onClick={() => setCount(count + 1)}>+</button><button onClick={() => setCount(count - 1)}>-</button></div>); }',
    explanation: 'useState hook manages component state, click handlers update the count value.',
    difficulty: 'medium',
    topic: 'React'
  }
];

export const topics = ['React', 'JavaScript', 'CSS', 'HTML', 'Node.js', 'Express.js', 'Next.js', 'TailwindCSS'];
export const difficulties = ['easy', 'medium', 'hard'] as const;

export function getRandomQuestions(topic: string, difficulty: string, theoryCount: number, codingCount: number) {
  const filteredTheory = theoryQuestions.filter(q => 
    (topic === 'All' || q.topic === topic) && 
    (difficulty === 'all' || q.difficulty === difficulty)
  );
  
  const filteredCoding = codingQuestions.filter(q => 
    (topic === 'All' || q.topic === topic) && 
    (difficulty === 'all' || q.difficulty === difficulty)
  );

  const shuffledTheory = [...filteredTheory].sort(() => Math.random() - 0.5);
  const shuffledCoding = [...filteredCoding].sort(() => Math.random() - 0.5);

  return {
    theory: shuffledTheory.slice(0, theoryCount),
    coding: shuffledCoding.slice(0, codingCount)
  };
}
