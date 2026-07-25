import './ErrorMessage.css';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-card" role="alert">
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">Failed to Load Repositories</h3>
      <p className="error-text">
        {message || 'An unexpected error occurred while fetching data from GitHub.'}
      </p>
      {onRetry && (
        <button className="retry-btn" onClick={onRetry} type="button">
          <span className="retry-icon">🔄</span> Retry Fetching
        </button>
      )}
    </div>
  );
}
