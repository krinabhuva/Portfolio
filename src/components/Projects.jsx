import './Projects.css';

function ProjectCard({ project }) {
  const stackItems = project.stack && project.stack !== '—'
    ? project.stack.split(',').map((s) => s.trim())
    : [];

  return (
    <div className="project-card">
      <div className="project-card-header">
        <span className="project-icon">📁</span>
        {project.github && (
          <a href={project.github} target="_blank" rel="noopener noreferrer" className="project-github-link">
            ⟶
          </a>
        )}
      </div>
      <h3 className="project-title">{project.title}</h3>
      {project.subtitle && <span className="project-subtitle">{project.subtitle}</span>}
      {stackItems.length > 0 && (
        <div className="project-stack">
          {stackItems.map((tech, i) => (
            <span className="project-stack-tag" key={i}>{tech}</span>
          ))}
        </div>
      )}
      {project.points && (
        <ul className="project-points">
          {project.points.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Projects({ projects }) {
  return (
    <section className="projects section" id="projects">
      <div className="container">
        <h2 className="section-title">
          Featured <span className="highlight">Projects</span>
        </h2>
        <div className="projects-grid">
          {projects.map((project, i) => (
            <ProjectCard key={i} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}