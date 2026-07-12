import './Footer.css';

export default function Footer({ contactInfo }) {
  const scrollTo = (e, href) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="footer" id="contact">
      <div className="container">
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
              <a href={contactInfo.github} target="_blank" rel="noopener noreferrer" className="social-icon" title="GitHub">
                {'</>'}
              </a>
              <a href={contactInfo.linkedin} target="_blank" rel="noopener noreferrer" className="social-icon" title="LinkedIn">
                in
              </a>
            </div>
          </div>

          <div className="footer-right">
            <h3>Quick Links</h3>
            <div className="footer-links">
              {['Home', 'About', 'Skills', 'Projects', 'Certifications'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="footer-link" onClick={(e) => scrollTo(e, `#${item.toLowerCase()}`)}>
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="footer-copyright">© 2026 Krina Bhuva. All rights reserved.</span>
          <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
            ↑
          </button>
        </div>
      </div>
    </footer>
  );
}