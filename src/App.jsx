import Navbar from './components/Navbar';
import Header from './components/Header';
import About from './components/About';
import Projects from './components/Projects';
import Certifications from './components/Certifications';
import Footer from './components/Footer';

// ——— Data passed as props ———
const name = 'Krina Bhuva';
const role = 'Information Technology Student | AI/ML Intern';
const themeColor = '#6366F1';

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
  return (
    <>
      <Navbar />
      <Header name={name} role={role} themeColor={themeColor} />
      <About />
      <Projects projects={projects} />
      <Certifications />
      <Footer contactInfo={contactInfo} />
    </>
  );
}