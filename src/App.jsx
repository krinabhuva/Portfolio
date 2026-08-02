import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Header from './components/Header';
import About from './components/About';
import Skills from './components/Skills';
import Footer from './components/Footer';
import Projects from './components/Projects';
import Contact from './components/Contact';
import NotFound from './components/NotFound';
import DigitalMindscape from './components/DigitalMindscape';
import './App.css';

// ——— Data passed as props ———
const name = 'Krina Bhuva';
const role = 'Information Technology Student | AI/ML Intern';
const themeColor = '#6366F1';

const skillList = [
  'HTML & CSS',
  'JavaScript',
  'React',
  'Node.js',
  'Python',
  'MongoDB',
  'Git & GitHub',
  'SQL',
];

const projects = [
  {
    title: 'Student Attendance System using Live Location',
    subtitle: '4th Semester Team Project',
    stack: 'Next.js, Node.js, Express.js, MongoDB',
    points: [
      'Smart attendance system using geofencing for live location-based attendance',
      'Admin sets classroom boundary; system checks if student is inside',
      'Features automatic attendance marking, student dashboard, and admin panel',
      'My contribution: frontend UI, database schema, and system logic',
    ],
    github: null,
  },
  {
    title: 'Building a RESTful API with Node.js and Express',
    subtitle: 'Practical 4 · Academic Practical',
    stack: 'Node.js, Express.js, JavaScript, Postman/Thunder Client',
    points: [
      'Built a Task Management REST API with complete CRUD operations using an in-memory array',
      'Implemented global request logging middleware, Express routing, task ID validation middleware, JSON parsing, Content-Type validation for POST/PUT, and custom 404 handling',
      'API Endpoints: GET /tasks, POST /tasks, PUT /tasks/:id, DELETE /tasks/:id',
      'Architecture: Client → Logging Middleware → Express Router → CRUD Operations → Global Error Handler',
      'Key Learnings: REST API design, Express middleware pipeline, request lifecycle, CRUD, HTTP methods/status codes, centralized error handling, and backend development',
    ],
    github: null,
  },
  { title: 'Gen_AI', stack: 'Python', points: ['https://github.com/krinabhuva/Gen_AI','Gen AI by python and Gemini API key'], github: 'https://github.com/krinabhuva/Gen_AI' },
  { title: 'Sramana', stack: 'Frontend',  points: ['https://github.com/krinabhuva/Sramana','Yoga Website'], github: 'https://github.com/krinabhuva/Sramana' },
  { title: 'Expense Analyzer', stack: 'Python',  points: ['https://github.com/krinabhuva/expense_analyzer','Analyze expenses and give data related to this'], github: 'https://github.com/krinabhuva/expense_analyzer' },
  { title: 'Student Marks Analyzer', stack: 'Python', points: ['https://github.com/krinabhuva/student_marks_analyzer','Analyze student marks and calculate maximum, minimum, average, etc. math operations'], github: 'https://github.com/krinabhuva/student_marks_analyzer' },
  { title: 'Calculator using Python', stack: 'Python', points: ['https://github.com/krinabhuva/calculator_using_python','calculator using python'], github: 'https://github.com/krinabhuva/calculator_using_python' },
  { title: 'Oil E-Commerce Hub', stack: 'Web', points: ['https://github.com/krinabhuva/oil-Ecommerce-Hub','for oil treding '], github: 'https://github.com/krinabhuva/oil-Ecommerce-Hub' },
];

const contactInfo = {
  name: 'Krina Bhuva',
  email: 'bhuvakrina0708@gmail.com',
  github: 'https://github.com/krinabhuva',
  linkedin: 'https://www.linkedin.com/in/krina-bhuva-5230a0340/',
};

export default function App() {
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [isLightMode]);

  const toggleDarkMode = () => {
    setIsLightMode(!isLightMode);
  };

  return (
    <>
      <DigitalMindscape />
      <Navbar isLightMode={isLightMode} toggleDarkMode={toggleDarkMode} />
      <Routes>
        <Route path="/" element={
          <>
            <Header name={name} role={role} themeColor={themeColor} />
            <About />
            <Skills skillList={skillList} />
          </>
        } />
        <Route path="/projects" element={<Projects projects={projects} />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer contactInfo={contactInfo} />
    </>
  );
}