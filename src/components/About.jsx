import './About.css';

const infoCards = [
  { icon: '🎓', label: 'Education', value: 'B.Tech, Information Technology' },
  { icon: '🏫', label: 'University', value: 'CHARUSAT University' },
  { icon: '📍', label: 'Location', value: 'Gujarat, India' },
  {
    icon: '💼',
    label: 'Internship',
    value: 'AI/ML Intern @ Dignizant Technologies LLP',
    sub: '25 May – 21 June 2026 · 4 weeks · 90+ hours',
  },
];

const interests = ['Cloud Computing', 'Database Management Systems', 'Software Engineering', 'Project Management'];
const strengths = ['Quick Learner', 'Team Player', 'Problem-Solving Mindset', 'Strong Fundamentals'];

export default function About() {
  return (
    <section className="about section" id="about">
      <div className="container">
        <h2 className="section-title">
          About <span className="highlight">Me</span>
        </h2>

        <p className="about-intro">
          I am an Information Technology student. I enjoy building responsive websites
          and continuously learning new technologies.
        </p>

        <div className="about-cards">
          {infoCards.map((card, i) => (
            <div className="about-card" key={i}>
              <span className="about-card-icon">{card.icon}</span>
              <span className="about-card-label">{card.label}</span>
              <span className="about-card-value">{card.value}</span>
              {card.sub && <span className="about-card-sub">{card.sub}</span>}
            </div>
          ))}
        </div>

        <div className="about-badge-section">
          <h3 className="about-badge-title">Areas of Interest</h3>
          <div className="about-badges">
            {interests.map((item, i) => (
              <span className="about-badge" key={i}>{item}</span>
            ))}
          </div>
        </div>

        <div className="about-badge-section">
          <h3 className="about-badge-title">Strengths</h3>
          <div className="about-badges">
            {strengths.map((item, i) => (
              <span className="about-badge" key={i}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}