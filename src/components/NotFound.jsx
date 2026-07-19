import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
  return (
    <section className="not-found-section">
      <div className="container not-found-container">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Page Not Found</h2>
        <Link to="/" className="btn btn-primary">
          Go Home
        </Link>
      </div>
    </section>
  );
}
