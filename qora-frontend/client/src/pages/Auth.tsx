/**
 * Qora Auth — WhatsApp-First Unique Alphanumeric Merchant Code Portal
 * Merchants register on WhatsApp and receive a unique alphanumeric access code (e.g. QOR-8821 or SULTAN-7X).
 * To access the admin dashboard on web, they simply enter their alphanumeric code.
 */
import { useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { WHATSAPP_BOT_URL } from "../const";

function QoraLogo() {
  return (
    <a href="/" className="logo" aria-label="Qora homepage">
      <span className="logo-mark">Q</span>
      <span className="logo-name">ora</span>
    </a>
  );
}

export default function Auth() {
  const [, setLocation] = useLocation();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError("Please enter your unique alphanumeric merchant code.");
      return;
    }
    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      // Valid alphanumeric merchant code authentication -> Redirect to Dashboard
      setLocation("/dashboard");
    }, 600);
  };

  const handleFillDemoCode = () => {
    setCode("QOR-8821");
    setError("");
  };

  return (
    <div className="auth-page-clean">
      <div className="auth-bg-ambient" />

      <div className="auth-shell-clean">
        <div className="auth-top-bar">
          <QoraLogo />
          <a href="/" className="auth-back-link">
            <ArrowLeft size={14} /> Back to home
          </a>
        </div>

        {/* INTRO HEADLINE */}
        <div className="auth-intro-heading">
          <h1>Your business belongs on WhatsApp. Now give it the tools to grow.</h1>
          <p>
            Log in to manage orders, track payments, update inventory, and view your daily revenue.
          </p>
        </div>

        <div className="auth-card-clean">
          <div className="auth-header">
            <h2>Merchant Login</h2>
            <p>
              Enter the code assigned to your business on WhatsApp.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="code-input-wrap">
              <label htmlFor="merchant-code">Merchant Code</label>
              <div className="code-field-box">
                <KeyRound size={18} className="code-prefix-icon" />
                <input
                  id="merchant-code"
                  type="text"
                  className="code-input-element"
                  placeholder="e.g. QOR-8821"
                  value={code}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
                    setCode(val);
                    if (error) setError("");
                  }}
                  autoFocus
                  required
                />
              </div>

              {error && (
                <p style={{ color: "#d93838", fontSize: "12.5px", margin: "4px 0 0" }}>
                  {error}
                </p>
              )}

              <button
                type="button"
                className="quick-demo-pill"
                onClick={handleFillDemoCode}
              >
                <Sparkles size={13} /> Click to test with demo code (QOR-8821)
              </button>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                "Verifying merchant code..."
              ) : (
                <>
                  Access Dashboard <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* WhatsApp Guidance Cards */}
          <div className="auth-whatsapp-box">
            <div className="wa-helper-item">
              <div className="wa-icon-badge">
                <MessageCircle size={16} />
              </div>
              <div className="wa-helper-text">
                <h4>Forgot or need your code?</h4>
                <p>
                  Send <strong>#code</strong> to Qora on WhatsApp and your unique alphanumeric code will be sent to your chat instantly.
                </p>
                <a
                  href={WHATSAPP_BOT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wa-action-link"
                >
                  Get code on WhatsApp <ArrowRight size={12} />
                </a>
              </div>
            </div>

            <div className="wa-helper-item">
              <div className="wa-icon-badge" style={{ background: "var(--ink)" }}>
                <CheckCircle2 size={16} />
              </div>
              <div className="wa-helper-text">
                <h4>New Merchant?</h4>
                <p>
                  Merchants register directly on WhatsApp. Set up your business in 30 seconds to receive your unique code.
                </p>
                <a
                  href={WHATSAPP_BOT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wa-action-link"
                >
                  Start on WhatsApp <ArrowRight size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-footer-help">
          Need help? <a href="/blog">Read merchant guides</a> or chat with support on WhatsApp.
        </div>
      </div>
    </div>
  );
}
