import { PrismaClient } from '../generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import dotenv from 'dotenv';
dotenv.config();

const dbUrl = new URL(process.env.DATABASE_URL as string);
const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: Number(dbUrl.port || 3306),
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.replace('/', ''),
  allowPublicKeyRetrieval: true,
  ssl: false,
});

const prisma = new PrismaClient({ adapter });

const skillsData = [
  {
    name: 'HTML',
    category: 'Frontend',
    questions: [
      {
        question: 'Which HTML tag is used to define an internal style sheet?',
        optionA: '<css>', optionB: '<style>', optionC: '<script>', optionD: '<link>',
        correctAnswer: 'B',
      },
      {
        question: 'What does HTML stand for?',
        optionA: 'Hyper Text Markup Language',
        optionB: 'High Text Machine Language',
        optionC: 'Hyper Tabular Markup Language',
        optionD: 'None of these',
        correctAnswer: 'A',
      },
      {
        question: 'Which tag is used to create a hyperlink?',
        optionA: '<link>', optionB: '<href>', optionC: '<a>', optionD: '<url>',
        correctAnswer: 'C',
      },
      {
        question: 'Which attribute specifies an alternate text for an image?',
        optionA: 'title', optionB: 'src', optionC: 'alt', optionD: 'href',
        correctAnswer: 'C',
      },
      {
        question: 'What is the correct HTML element for the largest heading?',
        optionA: '<heading>', optionB: '<h6>', optionC: '<head>', optionD: '<h1>',
        correctAnswer: 'D',
      },
    ],
  },
  {
    name: 'CSS',
    category: 'Frontend',
    questions: [
      {
        question: 'Which CSS property controls the text size?',
        optionA: 'text-size', optionB: 'font-size', optionC: 'text-style', optionD: 'font-style',
        correctAnswer: 'B',
      },
      {
        question: 'How do you add a background color for all h1 elements?',
        optionA: 'all.h1 {background-color:#FFFFFF;}',
        optionB: 'h1.all {background-color:#FFFFFF;}',
        optionC: 'h1 {background-color:#FFFFFF;}',
        optionD: 'None of the above',
        correctAnswer: 'C',
      },
      {
        question: 'Which CSS property is used to change the font of an element?',
        optionA: 'font-family', optionB: 'font-weight', optionC: 'font-style', optionD: 'font-variant',
        correctAnswer: 'A',
      },
      {
        question: 'What does CSS stand for?',
        optionA: 'Creative Style Sheets',
        optionB: 'Colorful Style Sheets',
        optionC: 'Cascading Style Sheets',
        optionD: 'Computer Style Sheets',
        correctAnswer: 'C',
      },
      {
        question: 'Which property is used to set the background image?',
        optionA: 'background-image', optionB: 'background-src', optionC: 'background-url', optionD: 'bg-image',
        correctAnswer: 'A',
      },
    ],
  },
  {
    name: 'JavaScript',
    category: 'Frontend',
    questions: [
      {
        question: 'Which company developed JavaScript?',
        optionA: 'Microsoft', optionB: 'Apple', optionC: 'Netscape', optionD: 'Google',
        correctAnswer: 'C',
      },
      {
        question: 'Which symbol is used for comments in JavaScript?',
        optionA: '//', optionB: '##', optionC: '**', optionD: '<!--',
        correctAnswer: 'A',
      },
      {
        question: 'How do you declare a variable in JavaScript?',
        optionA: 'variable x;', optionB: 'var x;', optionC: 'v x;', optionD: 'declare x;',
        correctAnswer: 'B',
      },
      {
        question: 'Which method is used to convert JSON to a JavaScript object?',
        optionA: 'JSON.stringify()', optionB: 'JSON.parse()', optionC: 'JSON.convert()', optionD: 'JSON.toObject()',
        correctAnswer: 'B',
      },
      {
        question: 'What is the output of typeof null in JavaScript?',
        optionA: 'null', optionB: 'undefined', optionC: 'object', optionD: 'number',
        correctAnswer: 'C',
      },
    ],
  },
  {
    name: 'React',
    category: 'Frontend',
    questions: [
      {
        question: 'What is the virtual DOM in React?',
        optionA: 'A direct copy of the real DOM',
        optionB: 'A lightweight copy of the real DOM kept in memory',
        optionC: 'A server-side rendering technique',
        optionD: 'None of the above',
        correctAnswer: 'B',
      },
      {
        question: 'Which hook is used to manage state in functional components?',
        optionA: 'useEffect', optionB: 'useContext', optionC: 'useState', optionD: 'useReducer',
        correctAnswer: 'C',
      },
      {
        question: 'What does JSX stand for?',
        optionA: 'JavaScript XML', optionB: 'JavaScript Extension', optionC: 'Java Syntax Extension', optionD: 'JavaScript XHTML',
        correctAnswer: 'A',
      },
      {
        question: 'Which method is called when a component is first rendered?',
        optionA: 'componentDidUpdate', optionB: 'componentWillMount', optionC: 'componentDidMount', optionD: 'render',
        correctAnswer: 'C',
      },
      {
        question: 'What is the correct way to pass data from parent to child in React?',
        optionA: 'State', optionB: 'Props', optionC: 'Context', optionD: 'Redux',
        correctAnswer: 'B',
      },
    ],
  },
  {
    name: 'Node.js',
    category: 'Backend',
    questions: [
      {
        question: 'What is Node.js?',
        optionA: 'A front-end JavaScript framework',
        optionB: 'A server-side JavaScript runtime',
        optionC: 'A database management system',
        optionD: 'A CSS preprocessor',
        correctAnswer: 'B',
      },
      {
        question: 'Which module is used to create a web server in Node.js?',
        optionA: 'fs', optionB: 'http', optionC: 'path', optionD: 'url',
        correctAnswer: 'B',
      },
      {
        question: 'What does npm stand for?',
        optionA: 'Node Package Manager', optionB: 'New Project Manager', optionC: 'Node Project Module', optionD: 'None',
        correctAnswer: 'A',
      },
      {
        question: 'Which method reads a file asynchronously in Node.js?',
        optionA: 'fs.readFileSync', optionB: 'fs.readFile', optionC: 'fs.read', optionD: 'fs.open',
        correctAnswer: 'B',
      },
      {
        question: 'What is the event loop in Node.js?',
        optionA: 'A loop that processes events and callbacks',
        optionB: 'A loop for rendering UI',
        optionC: 'A database query loop',
        optionD: 'None of the above',
        correctAnswer: 'A',
      },
    ],
  },
  {
    name: 'UI/UX Design',
    category: 'Design',
    questions: [
      {
        question: 'What does UX stand for?',
        optionA: 'User Experience', optionB: 'User Extension', optionC: 'Unique Experience', optionD: 'Unified Experience',
        correctAnswer: 'A',
      },
      {
        question: 'What is a wireframe?',
        optionA: 'A high-fidelity design', optionB: 'A low-fidelity skeletal layout of a page', optionC: 'A type of font', optionD: 'A CSS framework',
        correctAnswer: 'B',
      },
      {
        question: 'Which tool is most commonly used for UI design?',
        optionA: 'Photoshop', optionB: 'Figma', optionC: 'Sketch', optionD: 'All of the above',
        correctAnswer: 'D',
      },
      {
        question: 'What is a design system?',
        optionA: 'A collection of reusable components and guidelines',
        optionB: 'A type of database',
        optionC: 'A CSS framework',
        optionD: 'None of the above',
        correctAnswer: 'A',
      },
      {
        question: 'What is the purpose of a user persona?',
        optionA: 'To represent a target user group',
        optionB: 'To test the product',
        optionC: 'To write code',
        optionD: 'To design the database',
        correctAnswer: 'A',
      },
    ],
  },
];

async function main() {
  console.log('Seeding skills and questions...');

  for (const skillData of skillsData) {
    const skill = await prisma.skill.upsert({
      where: { name: skillData.name },
      update: {},
      create: { name: skillData.name, category: skillData.category },
    });

    for (const q of skillData.questions) {
      await prisma.skillQuestion.create({
        data: {
          skillId: skill.id,
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: q.correctAnswer,
        },
      });
    }

    console.log(`✓ Seeded skill: ${skillData.name}`);
  }

  console.log('Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());