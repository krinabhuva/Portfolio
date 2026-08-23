import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar({ isLightMode, toggleDarkMode }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
      <div className="container">
        <Link to="/" className="nav-logo" onClick={() => setMenuOpen(false)}>
          Portfolio
        </Link>
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link
            to="/"
            className={`nav-link ${currentPath === '/' ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/tasks"
            className={`nav-link ${currentPath === '/tasks' || currentPath === '/task-manager' ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            Task Manager
          </Link>
          <Link
            to="/projects"
            className={`nav-link ${currentPath === '/projects' ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            Projects
          </Link>
          <Link
            to="/contact"
            className={`nav-link ${currentPath === '/contact' ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </Link>
          <button className="theme-toggle" onClick={toggleDarkMode} aria-label="Toggle theme">
            {isLightMode ? '🌙' : '☀️'}
          </button>
        </div>
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}
