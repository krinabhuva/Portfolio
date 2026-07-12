import './Skills.css';

export default function Skills({ skillList }) {
  return (
    <section className="skills section" id="skills">
      <div className="container">
        <h2 className="section-title">
          My <span className="highlight">Skills</span>
        </h2>
        <div className="skills-grid">
          {skillList.map((skill) => (
            <div className="skill-card" key={skill}>
              <span className="skill-icon">⚡</span>
              <span className="skill-name">{skill}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
