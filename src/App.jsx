import Navbar from './components/Navbar';
import Header from './components/Header';
import About from './components/About';
import Skills from './components/Skills';
import Footer from './components/Footer';

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
      <Skills skillList={skillList} />
      <Footer contactInfo={contactInfo} />
    </>
  );
}