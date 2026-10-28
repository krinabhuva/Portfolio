import { Link } from 'react-router-dom';
import profileImg from '../assets/profile.jpeg';
import './Header.css';

export default function Header({ name, role, themeColor }) {
  const [firstName, ...rest] = name.split(' ');
  const lastName = rest.join(' ');
  const roles = role.split('|').map((r) => r.trim());

  /* Supplementary: themeColor applied as an inline style */
  const themeOverlay = {
    boxShadow: `0 0 120px ${themeColor}33, inset 0 0 120px ${themeColor}11`,
  };

  return (
    <section className="header" id="home" style={themeOverlay}>
      <div className="container">
        <div className="header-content">
          <div className="header-text">
            <span className="header-greeting">Welcome to my portfolio</span>
            <h1 className="header-name">
              Hi, I'm <span className="name-highlight">{firstName}</span>
              {lastName && <><br />{lastName}</>}
            </h1>
            <p className="header-role">
              {roles.map((r, i) => (
                <span key={i}>
                  {r}{i < roles.length - 1 && <span className="role-divider"> | </span>}
                </span>
              ))}
            </p>
            <p className="header-intro">
              I create beautiful and responsive web applications using React, JavaScript
              and modern web technologies. Passionate about AI/ML, cloud computing,
              and database systems.
            </p>
            <div className="header-buttons">
              <Link to="/projects" className="btn btn-primary">
                View Projects
              </Link>
              <Link to="/contact" className="btn btn-secondary">
                Contact Me
              </Link>
            </div>
          </div>
          <div className="header-image">
            <div className="profile-image-wrapper">
              <img className="profile-image" src={profileImg} alt={name} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}