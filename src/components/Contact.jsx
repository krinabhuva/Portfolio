import { useState } from 'react';
import './Contact.css';

export default function Contact() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  return (
    <section className="contact section contact-page-section" id="contact">
      <div className="container">
        <h2 className="section-title">
          Contact <span className="highlight">Me</span>
        </h2>
        <div className="contact-card-container">
          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="name-input">Name</label>
              <input
                id="name-input"
                type="text"
                className="form-control"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="message-input">Message</label>
              <textarea
                id="message-input"
                className="form-control"
                placeholder="Enter your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </form>

          <div className="display-box">
            <p className="display-label">Name:</p>
            <p className="display-value">{name}</p>
            
            <p className="display-label" style={{ marginTop: '16px' }}>Message:</p>
            <p className="display-value">{message}</p>
            
            <p className="display-label" style={{ marginTop: '16px' }}>Characters: {message.length}</p>
          </div>

          <div className="help-section">
            <button
              className="btn btn-secondary help-btn"
              onClick={() => setShowHelp(!showHelp)}
            >
              Show Help
            </button>
            {showHelp && (
              <p className="help-text">Feel free to contact me for collaboration.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
