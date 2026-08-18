/**
 * Qora Blog — Single Article Reader Page
 * Editorial article viewer with clean typography, takeaways, sharing, and related reads.
 */
import { useEffect, useRef, useState } from "react";
import { useRoute } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  MessageCircle,
  Share2,
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

interface ArticleData {
  slug: string;
  cat: string;
  catLabel: string;
  title: string;
  subtitle: string;
  author: string;
  date: string;
  readTime: string;
  leadQuote: string;
  content: { heading: string; body: string }[];
}

const articles: Record<string, ArticleData> = {
  "best-customers-come-from-replies": {
    slug: "best-customers-come-from-replies",
    cat: "growth",
    catLabel: "Growth",
    title: "Why your best customers come from replies, not ads",
    subtitle:
      "The sellers growing fastest on WhatsApp aren't running ads. They are getting forwarded. Here is how to make your checkout worth sharing.",
    author: "Qora Editorial Team",
    date: "Aug 12, 2026",
    readTime: "6 min read",
    leadQuote:
      "When a buyer gets a smooth 1-tap checkout experience, they don't just buy again. They forward your store link into group chats.",
    content: [
      {
        heading: "1. The WhatsApp Forwarding Loop",
        body: "When customers buy on WhatsApp in Nigeria, trust is everything. Paid social ads may bring curious clicks, but warm recommendations in group chats convert at 4x the rate. When your checkout is instant and verified, customers naturally forward your link to colleagues, friends, and family whenever someone asks where they got their outfit or shoes.",
      },
      {
        heading: "2. Why Long DM Negotiation Kills 60% of Sales",
        body: "Every unnecessary message in a conversation creates drop-off. Asking 'Are you still interested?', 'Have you sent the money?', or waiting 4 hours to verify a bank transfer screenshot frustrates eager buyers. A direct storefront link provides transparent prices, delivery location calculation, and instant payment confirmation in seconds.",
      },
      {
        heading: "3. The 30-Second Checkout Rule",
        body: "From viewing a product on WhatsApp status to completing the transfer, the entire process should feel effortless. When your catalog is connected directly to automated payment reconciliation, buyers feel safe knowing their payment is recognized instantly without awkward follow-ups.",
      },
      {
        heading: "4. Practical Steps for This Week",
        body: "Start by pinning your Qora store link in your WhatsApp Business profile bio and status updates. When a customer DMs asking for price or availability, reply with a direct product link instead of typing multiple disjointed messages.",
      },
    ],
  },
  "stop-asking-have-you-paid": {
    slug: "stop-asking-have-you-paid",
    cat: "payments",
    catLabel: "Payments",
    title: "Stop asking 'have you paid?'. A better way to confirm orders",
    subtitle:
      "Screenshots lie and memory is worse. A simple checkout link removes the back-and-forth entirely.",
    author: "Sultan Adewale",
    date: "Aug 6, 2026",
    readTime: "4 min read",
    leadQuote:
      "Automated bank transfer matching saves up to 12 hours a week spent checking mobile banking apps.",
    content: [
      {
        heading: "1. The Screenshot Trap",
        body: "Nigerian merchants lose dozens of hours every month manually comparing fake or delayed transfer screenshots against bank balance notifications. This delays order dispatch and creates anxiety for both parties.",
      },
      {
        heading: "2. Auto-Reconciled Bank Accounts",
        body: "By generating dedicated transaction references for every customer basket, Qora matches incoming deposits in real-time. The moment money hits the account, both you and the customer get an instant WhatsApp notification.",
      },
      {
        heading: "3. Faster Fulfillment, Happier Buyers",
        body: "When you eliminate payment verification delays, dispatch riders can pick up packages within minutes rather than hours, dramatically improving your customer review scores.",
      },
    ],
  },
};

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug || "best-customers-come-from-replies";
  const article = articles[slug] || articles["best-customers-come-from-replies"];

  const [copied, setCopied] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const onScroll = () => {
      if (navRef.current) {
        navRef.current.classList.toggle("scrolled", window.scrollY > 24);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this article on Qora: "${article.title}"`);
    window.open(`https://wa.me/?text=${text}%20${url}`, "_blank");
  };

  return (
    <div className="qora-site article-page-root">
      {/* NAV */}
      <div className="nav-shell" ref={navRef}>
        <div className="nav">
          <QoraLogo />
          <nav className="nav-links">
            <a href="/#product">Product</a>
            <a href="/#how">How it works</a>
            <a href="/#stories">Stories</a>
            <a href="/blog">Blog</a>
          </nav>
          <div className="nav-actions">
            <a className="login" href="/login">
              Log in
            </a>
            <a
              className="btn-dark"
              href={WHATSAPP_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Start selling free
            </a>
          </div>
        </div>
      </div>

      {/* ARTICLE CONTAINER */}
      <main className="article-main-wrap">
        <div className="wrap article-wrap-inner">
          {/* Back link */}
          <a href="/blog" className="article-back-btn">
            <ArrowLeft size={15} /> Back to all articles
          </a>

          {/* Article Header */}
          <header className="article-header">
            <span className={`cat-tag ${article.cat}`}>{article.catLabel}</span>
            <h1 className="article-h1">{article.title}</h1>
            <p className="article-sub">{article.subtitle}</p>

            <div className="article-meta-row">
              <span className="author-name">{article.author}</span>
              <span className="dot" />
              <span>{article.date}</span>
              <span className="dot" />
              <span>{article.readTime}</span>
            </div>
          </header>

          {/* Lead Highlight Box */}
          <div className="article-highlight-card">
            <p className="highlight-text">&ldquo;{article.leadQuote}&rdquo;</p>
          </div>

          {/* Article Editorial Body */}
          <article className="article-body-content">
            {article.content.map((section, idx) => (
              <div key={idx} className="article-section-block">
                <h2>{section.heading}</h2>
                <p>{section.body}</p>
              </div>
            ))}
          </article>

          {/* Share & Actions Toolbar */}
          <div className="article-actions-bar">
            <div className="share-btn-group">
              <button
                type="button"
                className="btn-share-wa"
                onClick={handleShareWhatsApp}
              >
                <MessageCircle size={15} /> Share on WhatsApp
              </button>
              <button
                type="button"
                className="btn-copy-link"
                onClick={handleCopyLink}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? "Link Copied!" : "Copy Link"}
              </button>
            </div>

            <a
              href={WHATSAPP_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="article-cta-btn"
            >
              Start selling on WhatsApp <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="foot-top">
            <div>
              <QoraLogo />
              <p
                style={{
                  color: "rgba(255, 255, 255, 0.75)",
                  fontSize: 14,
                  marginTop: 14,
                  maxWidth: 220,
                  lineHeight: 1.5,
                }}
              >
                Commerce that meets you where business already happens.
              </p>
            </div>
            <div className="foot-links">
              <div>
                <p>Product</p>
                <a href="/#product">Storefront</a>
                <a href="/#product">Orders</a>
                <a href="/#product">Payments</a>
                <a href="/#product">Inventory</a>
              </div>
              <div>
                <p>Company</p>
                <a href="#">About</a>
                <a href="#">Contact</a>
                <a href="#">Careers</a>
              </div>
              <div>
                <p>Resources</p>
                <a href="/#product">Help</a>
                <a href="/blog">Blog</a>
              </div>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 Qora Technologies</span>
            <span>Built in Africa, for commerce everywhere.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
