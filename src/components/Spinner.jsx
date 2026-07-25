import './Spinner.css';

export default function Spinner({ message = 'Loading repositories...' }) {
  return (
    <div className="spinner-container" role="status" aria-live="polite">
      <div className="spinner-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <p className="spinner-message">{message}</p>
    </div>
  );
}
