import './Spinner.css';

export default function Spinner({ fullPage = false }) {
  return (
    <div className={`spinner-container ${fullPage ? 'full-page' : ''}`}>
      <div className="spinner-wrapper">
        <div className="spinner-glow"></div>
        <div className="spinner-ring"></div>
      </div>
      <div className="spinner-text">Loading...</div>
    </div>
  );
}
