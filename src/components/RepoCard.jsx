import './RepoCard.css';

export default function RepoCard({ repo }) {
  const {
    name,
    html_url,
    description,
    stargazers_count,
    forks_count,
    language,
    updated_at,
  } = repo;

  const formattedDate = updated_at
    ? new Date(updated_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div className="repo-card">
      <div className="repo-card-header">
        <div className="repo-title-wrapper">
          <span className="repo-folder-icon">📂</span>
          <h3 className="repo-name" title={name}>
            {name}
          </h3>
        </div>
        <a
          href={html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="repo-link-btn"
          aria-label={`View ${name} repository on GitHub`}
          title="Open repository in new tab"
        >
          <span>Link</span>
          <svg
            className="external-link-icon"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
      </div>

      <p className="repo-description">
        {description || 'No description provided for this repository.'}
      </p>

      <div className="repo-meta">
        <div className="repo-stats">
          <span className="stat-badge star-badge" title="Star count">
            <span className="star-icon">⭐</span>
            <span className="stat-count">{stargazers_count}</span>
          </span>
          {forks_count !== undefined && (
            <span className="stat-badge fork-badge" title="Forks count">
              <span className="fork-icon">🍴</span>
              <span className="stat-count">{forks_count}</span>
            </span>
          )}
        </div>

        {language && (
          <span className="repo-language">
            <span className="lang-dot"></span>
            {language}
          </span>
        )}
      </div>

      {formattedDate && (
        <div className="repo-footer">
          <span className="repo-updated">Updated {formattedDate}</span>
        </div>
      )}
    </div>
  );
}
