import './Header.css';

export default function Header({ name, role }) {
  const [firstName, ...rest] = name.split(' ');
  const lastName = rest.join(' ');
  const roles = role.split('|').map((r) => r.trim());

  return (
    <section className="header" id="home">
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
              <a href="#contact" className="btn btn-primary" onClick={(e) => {
                e.preventDefault();
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                ✉ Contact Me
              </a>

            </div>
          </div>
          <div className="header-image">
            <div className="profile-image-wrapper">
              <div className="profile-placeholder">{name.charAt(0)}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}