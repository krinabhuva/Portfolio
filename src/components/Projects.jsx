import { useState, useEffect } from 'react';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import RepoCard from './RepoCard';
import './Projects.css';

// ── GitHub username (edit this to change the profile fetched) ──────────────
const GITHUB_USERNAME = 'krinabhuva';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`;

// ── Static "Featured Projects" data ──────────────────────────────────────────
const defaultProjects = [
  {
    title: 'Student Attendance System using Live Location',
    subtitle: '4th Semester Team Project',
    stack: 'Next.js, Node.js, Express.js, MongoDB',
    language: 'JavaScript',
    stars: 0,
    forks: 0,
    points: [
      'Smart attendance system using geofencing for live location-based attendance',
      'Admin sets classroom boundary; system checks if student is inside',
      'Features automatic attendance marking, student dashboard, and admin panel',
      'My contribution: frontend UI, database schema, and system logic',
    ],
    github: null,
  },
  {
    title: 'Gen_AI',
    subtitle: 'Internship Project',
    stack: 'Python',
    language: 'Python',
    stars: 1,
    forks: 0,
    points: ['Gen AI using Python and Gemini API key'],
    github: 'https://github.com/krinabhuva/Gen_AI',
  },
  {
    title: 'Sramana',
    subtitle: 'Internship Project',
    stack: 'HTML, CSS, JavaScript',
    language: 'HTML',
    stars: 2,
    forks: 1,
    points: ['Yoga Website built with a clean, responsive frontend design'],
    github: 'https://github.com/krinabhuva/Sramana',
  },
  {
    title: 'Expense Analyzer',
    subtitle: 'Internship Project',
    stack: 'Python',
    language: 'Python',
    stars: 1,
    forks: 0,
    points: ['Analyzes expenses from data files and extracts key financial insights'],
    github: 'https://github.com/krinabhuva/expense_analyzer',
  },
  {
    title: 'Student Marks Analyzer',
    subtitle: 'Internship Project',
    stack: 'Python',
    language: 'Python',
    stars: 1,
    forks: 0,
    points: ['Calculates maximum, minimum, average and other statistical operations on student marks'],
    github: 'https://github.com/krinabhuva/student_marks_analyzer',
  },
  {
    title: 'Calculator using Python',
    subtitle: 'Internship Project',
    stack: 'Python',
    language: 'Python',
    stars: 0,
    forks: 0,
    points: ['Feature-rich command-line calculator built with Python'],
    github: 'https://github.com/krinabhuva/calculator_using_python',
  },
  {
    title: 'Oil E-Commerce Hub',
    subtitle: 'Internship Project',
    stack: 'HTML, CSS, JavaScript',
    language: 'HTML',
    stars: 3,
    forks: 1,
    points: ['Full e-commerce platform for oil product trading with cart and product listings'],
    github: 'https://github.com/krinabhuva/oil-Ecommerce-Hub',
  },
];

// ── Static ProjectCard ────────────────────────────────────────────────────────
function ProjectCard({ project }) {
  const stackItems =
    project.stack && project.stack !== '—'
      ? project.stack.split(',').map((s) => s.trim())
      : [];

  return (
    <div className="project-card">
      <div className="project-card-header">
        <span className="project-icon">📁</span>
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="project-github-link"
            title="View on GitHub"
          >
            ⟶
          </a>
        )}
      </div>

      <h3 className="project-title">{project.title}</h3>
      {project.subtitle && <span className="project-subtitle">{project.subtitle}</span>}

      {stackItems.length > 0 && (
        <div className="project-stack">
          {stackItems.map((tech, i) => (
            <span className="project-stack-tag" key={i}>
              {tech}
            </span>
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

      {/* Stats row — stars, forks, language */}
      <div className="project-stats-row">
        {typeof project.stars === 'number' && (
          <span className="stat-badge star-badge" title="Stars">
            <span className="star-icon">⭐</span>
            <span className="stat-count">{project.stars}</span>
          </span>
        )}
        {typeof project.forks === 'number' && (
          <span className="stat-badge fork-badge" title="Forks">
            <span className="fork-icon">🍴</span>
            <span className="stat-count">{project.forks}</span>
          </span>
        )}
        {project.language && (
          <span className="project-language-tag">
            <span className="lang-dot"></span>
            {project.language}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main Projects component ─────────────────────────────────────────────────
export default function Projects({ projects = defaultProjects }) {
  const displayProjects = projects && projects.length > 0 ? projects : defaultProjects;

  // ── State variables (Requirements 1) ──────────────────────────────────────
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // fetchTrigger starts at 0 → effect runs on mount.
  // Incrementing it (via retry) re-runs the effect without putting fetch in
  // the component body, satisfying Requirement 8.
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // ── useEffect with fetch (Requirements 2, 8) ───────────────────────────────
  useEffect(() => {
    // Reset state before each fetch attempt
    setLoading(true);
    setError(null);

    fetch(GITHUB_API_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`GitHub API error ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => setRepos(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [fetchTrigger]); // eslint-disable-line react-hooks/exhaustive-deps
  // fetchTrigger = 0 on mount → behaves like [], re-runs only on retry

  // ── Client-side search filter (Requirement 7) ──────────────────────────────
  const filteredRepos = repos.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  // ── Retry handler for ErrorMessage (Requirement 6) ─────────────────────────
  const handleRetry = () => setFetchTrigger((n) => n + 1);

  return (
    <section className="projects section" id="projects">
      <div className="container">

        {/* ── Section 1: Static Featured Projects ────────────────────────── */}
        <div className="projects-header">
          <h2 className="section-title">
            Featured <span className="highlight">Projects</span>
          </h2>
          <p className="projects-subtitle">
            A showcase of my recent academic, personal, and open-source software projects
          </p>
        </div>

        <div className="projects-grid">
          {displayProjects.map((project, i) => (
            <ProjectCard key={i} project={project} />
          ))}
        </div>

        {/* ── Section 2: Live GitHub Repositories (Requirements 3–7) ─────── */}
        <div className="github-repos-section">
          <div className="github-repos-header">
            <h2 className="section-title">
              GitHub <span className="highlight">Repositories</span>
            </h2>
            <p className="projects-subtitle">
              Live feed from{' '}
              <a
                href={`https://github.com/${GITHUB_USERNAME}`}
                target="_blank"
                rel="noopener noreferrer"
                className="github-profile-link"
              >
                @{GITHUB_USERNAME}
              </a>{' '}
              via GitHub REST API
            </p>
          </div>

          {/* Search input — always visible, disabled while loading (Requirement 7) */}
          <div className="repos-search-wrapper">
            <span className="repos-search-icon" aria-hidden="true">🔍</span>
            <input
              id="repo-search-input"
              type="search"
              className="repos-search-input"
              placeholder="Filter repositories by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={loading || !!error}
              aria-label="Filter repositories by name"
            />
            {!loading && !error && (
              <span className="repos-count">
                {filteredRepos.length} / {repos.length} repos
              </span>
            )}
          </div>

          {/* Requirement 3: Spinner while loading */}
          {loading && <Spinner message="Fetching repositories from GitHub…" />}

          {/* Requirement 4 & 6: ErrorMessage with retry button */}
          {!loading && error && (
            <ErrorMessage message={error} onRetry={handleRetry} />
          )}

          {/* Requirement 5: Repo cards on success */}
          {!loading && !error && (
            <>
              {filteredRepos.length > 0 ? (
                <div className="repos-grid">
                  {filteredRepos.map((repo) => (
                    <RepoCard key={repo.id} repo={repo} />
                  ))}
                </div>
              ) : (
                <p className="repos-empty">
                  No repositories match &ldquo;{search}&rdquo;. Try a different search term.
                </p>
              )}
            </>
          )}
        </div>

      </div>
    </section>
  );
}
