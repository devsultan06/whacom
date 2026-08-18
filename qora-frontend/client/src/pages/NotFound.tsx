/**
 * Qora — 404 Page Not Found
 * Clean, branded fallback page matching the Market Signal aesthetic.
 */
import { ArrowLeft, Home, Compass } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="qora-site notfound-root">
      <div className="notfound-card">
        <a href="/" className="logo notfound-logo" aria-label="Qora homepage">
          <span className="logo-mark">Q</span>
          <span className="logo-name">ora</span>
        </a>

        <div className="notfound-badge">
          <Compass size={18} /> 404 Error
        </div>

        <h1 className="notfound-title">Page not found</h1>
        <p className="notfound-desc">
          The link you followed doesn&apos;t exist, or the store or page has been moved.
        </p>

        <div className="notfound-btn-group">
          <button
            type="button"
            onClick={() => setLocation("/")}
            className="notfound-btn-primary"
          >
            <Home size={15} /> Back to homepage
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="notfound-btn-secondary"
          >
            <ArrowLeft size={15} /> Previous page
          </button>
        </div>
      </div>
    </div>
  );
}
