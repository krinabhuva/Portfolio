import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Footer.css';

export default function Footer({ contactInfo }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isContactPage = location.pathname === '/contact';

  const handleSectionLink = (e, targetHash) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const el = document.querySelector(targetHash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/' + targetHash);
      // Allow route change to finish before scrolling
      setTimeout(() => {
        const el = document.querySelector(targetHash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <footer className="footer" id="footer" style={!isContactPage ? { padding: '30px 0' } : {}}>
      <div className="container">
        {isContactPage && (
          <div className="footer-content">
            <div className="footer-left">
              <h2>Get in <span className="highlight">Touch</span></h2>
              <p>
                Whether you have a project in mind, a question, or just want to say hi,
                my inbox is always open. I'll try my best to get back to you!
              </p>

              <div className="footer-contact-item">
                <div className="footer-contact-icon">✉</div>
                <div>
                  <div className="footer-contact-label">Email</div>
                  <div className="footer-contact-value">
                    <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
                  </div>
                </div>
              </div>

              <div className="footer-socials">
                <a
                  href={contactInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon"
                  title="GitHub"
                >
                  {'</>'}
                </a>
                <a
                  href={contactInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon"
                  title="LinkedIn"
                >
                  in
                </a>
              </div>
            </div>

            <div className="footer-right">
              <h3>Quick Links</h3>
              <div className="footer-links">
                <Link to="/" className="footer-link">
                  Home
                </Link>
                <Link to="/tasks" className="footer-link">
                  Task Manager
                </Link>
                <Link to="/projects" className="footer-link">
                  Projects
                </Link>
                <a
                  href="#about"
                  className="footer-link"
                  onClick={(e) => handleSectionLink(e, '#about')}
                >
                  About Section
                </a>
                <a
                  href="#skills"
                  className="footer-link"
                  onClick={(e) => handleSectionLink(e, '#skills')}
                >
                  Skills Section
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="footer-bottom">
          <span className="footer-copyright">© 2026 Krina Bhuva. All rights reserved.</span>
          <button
            className="back-to-top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
          >
            ↑
          </button>
        </div>
      </div>
    </footer>
  );
}