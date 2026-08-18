/**
 * Qora Blog — index page.
 * Practical notes on growth, payments, inventory, and stories for merchants selling on WhatsApp.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Send, Check } from "lucide-react";
import { WHATSAPP_BOT_URL } from "../const";

function QoraLogo() {
  return (
    <a href="/" className="logo" aria-label="Qora homepage">
      <span className="logo-mark">Q</span>
      <span className="logo-name">ora</span>
    </a>
  );
}

const categories = [
  "All",
  "Growth",
  "Payments",
  "Inventory",
  "Marketing",
  "Stories",
];

const posts = [
  {
    slug: "best-customers-come-from-replies",
    cat: "growth",
    catLabel: "Growth",
    title: "Why your best customers come from replies, not ads",
    excerpt:
      "The sellers growing fastest on WhatsApp aren't running ads. They're getting forwarded. Here is how to make your checkout worth sharing.",
    date: "Aug 12, 2026",
    read: "6 min read",
  },
  {
    slug: "stop-asking-have-you-paid",
    cat: "payments",
    catLabel: "Payments",
    title: "Stop asking 'have you paid?'. A better way to confirm orders",
    excerpt:
      "Screenshots lie and memory is worse. A simple checkout link removes the back-and-forth entirely.",
    date: "Aug 6, 2026",
    read: "4 min read",
  },
  {
    slug: "cost-of-counting-stock-in-your-head",
    cat: "inventory",
    catLabel: "Inventory",
    title: "The real cost of counting stock in your head",
    excerpt:
      "Most stockouts don't happen because you ran out. They happen because nobody knew you were close.",
    date: "Jul 29, 2026",
    read: "5 min read",
  },
  {
    slug: "amaras-closet-doubled-repeat-buyers",
    cat: "stories",
    catLabel: "Stories",
    title: "How Amara's Closet doubled repeat buyers in 60 days",
    excerpt:
      "A Lagos fashion seller on what changed once customers had a link instead of a long chat thread.",
    date: "Jul 21, 2026",
    read: "7 min read",
  },
  {
    slug: "pricing-with-confidence",
    cat: "growth",
    catLabel: "Growth",
    title: "Pricing with confidence when everyone haggles",
    excerpt:
      "A clear storefront price does more for your margins than any negotiating tactic.",
    date: "Jul 14, 2026",
    read: "5 min read",
  },
  {
    slug: "whatsapp-status-storefront-window",
    cat: "marketing",
    catLabel: "Marketing",
    title: "Your WhatsApp status is a storefront window. Use it like one",
    excerpt:
      "Small, consistent updates outperform occasional big promotions. Here is a simple weekly rhythm.",
    date: "Jul 8, 2026",
    read: "4 min read",
  },
];

export default function QoraBlog() {
  const [selectedCat, setSelectedCat] = useState("All");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (navRef.current) {
        navRef.current.classList.toggle("scrolled", window.scrollY > 24);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filteredPosts = useMemo(() => {
    if (selectedCat === "All") return posts;
    return posts.filter(
      p => p.catLabel.toLowerCase() === selectedCat.toLowerCase()
    );
  }, [selectedCat]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail("");
    }, 3000);
  };

  return (
    <div className="qora-site">
      {/* NAV */}
      <div className="nav-shell" ref={navRef}>
        <div className="nav">
          <QoraLogo />
          <nav className="nav-links">
            <a href="/#product">Product</a>
            <a href="/#how">How it works</a>
            <a href="/#stories">Stories</a>
            <a href="/stores">Stores</a>
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

      {/* HERO */}
      <section className="blog-hero">
        <div className="wrap">
          <p className="eyebrow" style={{ justifyContent: "center" }}>
            The Qora Journal
          </p>
          <h1>Ideas for running a sharper business.</h1>
          <p>
            Practical notes on growth, payments, and inventory for merchants
            selling on WhatsApp with stories from sellers doing it well.
          </p>

          <div className="cat-pills">
            {categories.map(c => (
              <button
                key={c}
                type="button"
                className={`cat-pill${selectedCat === c ? " active" : ""}`}
                onClick={() => setSelectedCat(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED POST */}
      <section className="section" style={{ paddingTop: 0, paddingBottom: 40 }}>
        <div className="wrap">
          <a
            className="featured-post"
            href="/blog/best-customers-come-from-replies"
          >
            <div className="featured-media">
              <span>FEATURED</span>
            </div>
            <div className="featured-copy">
              <span className="cat">Growth</span>
              <h2>Why your best customers come from replies, not ads.</h2>
              <p>
                The sellers growing fastest on WhatsApp aren&apos;t running ads.
                They&apos;re getting forwarded. Here&apos;s how to make your
                checkout worth sharing with a friend.
              </p>
              <div className="featured-meta">
                <span>Qora Team</span>
                <i className="dot" />
                <span>Aug 12, 2026</span>
                <i className="dot" />
                <span>6 min read</span>
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* POST LIST */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="post-list">
            {filteredPosts.map(post => (
              <a
                className="post-row"
                href={`/blog/${post.slug}`}
                key={post.title}
              >
                <span className={`cat-tag ${post.cat}`}>{post.catLabel}</span>
                <div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                </div>
                <span className="meta">
                  {post.date}
                  <br />
                  {post.read}
                </span>
                <span className="arrow">
                  <ArrowUpRight size={16} />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="newsletter-panel">
            <div className="newsletter-copy">
              <h2>One practical tip a week. No spam, no fluff.</h2>
              <p>
                Short, useful notes on running a better business straight to
                your inbox.
              </p>
            </div>
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              {subscribed ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#fff",
                    fontWeight: 600,
                  }}
                >
                  <Check size={18} /> You&apos;re subscribed! Check your inbox
                  soon.
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    placeholder="you@business.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit">
                    Subscribe <Send size={15} />
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </section>

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
                <a href="#product">About</a>
                <a href="#product">Contact</a>
                <a href="#product">Careers</a>
              </div>
              <div>
                <p>Resources</p>
                <a href="#product">Help</a>
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
