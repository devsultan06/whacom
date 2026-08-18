/**
 * Qora — Market Signal v3: editorial commerce landing page.
 *
 * Adds a connected, scroll-driven feel on top of the existing v2 layout:
 *  - a fixed backdrop layer that morphs color as each section becomes active
 *    (data-theme on <section>, one IntersectionObserver)
 *  - a single generic reveal-on-scroll system (data-reveal="up|left|right|scale")
 *  - subtle differential parallax on the hero cards + storefront photo
 *  - a sticky nav that gains elevation once you leave the hero
 *  - hero cards recentered, properly spaced, and with a "make way" hover
 *    interaction so a hovered card never obscures its neighbours
 *  - the hero card stack becomes a snap-scroll carousel on mobile instead
 *    of disappearing
 *
 * Drop qora-landing.css alongside this file (or merge into globals.css).
 */
import "../index.css";
import { useEffect, useRef, useState } from "react";
import { WHATSAPP_BOT_URL } from "../const";
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Link2,
  MessageCircle,
  PackageCheck,
  Search,
  Send,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

/** Small hand-drawn icon set for the hero card stack — kept as inline SVG
 * so no image assets are needed and colors stay tied to the CSS palette. */
function BeltIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none">
      <path
        d="M8 30c0-10 8-18 24-18s24 8 24 18-8 18-24 18S8 40 8 30z"
        stroke="#e8a33d"
        strokeWidth="3"
      />
      <rect x="24" y="22" width="16" height="16" rx="4" fill="#e8a33d" />
      <circle cx="32" cy="30" r="3" fill="#14150f" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="22" fill="#f7f4ec" fillOpacity=".12" />
      <circle cx="32" cy="32" r="15" stroke="#f7f4ec" strokeWidth="3" />
      <path
        d="M24 32l6 6 12-13"
        stroke="#f7f4ec"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SneakerIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none">
      <path
        d="M6 40c3-1 5-2 6-5 1-4 2-9 5-12 2 3 5 5 9 5h6c2-3 5-4 8-3 1 3 3 5 6 6 4 1 8 3 9 8 0 1 0 3-1 4H6c-1-1-1-2 0-3z"
        fill="#f7f4ec"
      />
      <path
        d="M6 40c3-1 5-2 6-5 1-4 2-9 5-12 2 3 5 5 9 5h6c2-3 5-4 8-3 1 3 3 5 6 6 4 1 8 3 9 8"
        stroke="#e8a33d"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 33c3 1.5 6 2 10 2"
        stroke="#0c6b48"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="4"
        y1="43"
        x2="60"
        y2="43"
        stroke="#0c6b48"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none">
      <rect x="10" y="34" width="9" height="18" rx="2" fill="#14150f" />
      <rect
        x="24"
        y="24"
        width="9"
        height="28"
        rx="2"
        fill="#14150f"
        fillOpacity=".55"
      />
      <rect x="38" y="14" width="9" height="38" rx="2" fill="#14150f" />
      <path
        d="M10 22l14-8 10 6 14-12"
        stroke="#0c6b48"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M42 8h6v6"
        stroke="#0c6b48"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function BoxIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none">
      <path
        d="M32 8l24 12v24L32 56 8 44V20L32 8z"
        stroke="#0c6b48"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M8 20l24 12 24-12M32 32v24"
        stroke="#0c6b48"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M20 14l24 12"
        stroke="#e8a33d"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function QoraLogo({ light = false }: { light?: boolean }) {
  return (
    <a href="/" className={`logo ${light ? "logo-light" : ""}`}>
      <span className="logo-mark">Q</span>
      <span className="logo-name">ora</span>
    </a>
  );
}

const verticals = [
  {
    id: "fashion",
    title: "Fashion",
    copy: "Sizes, colours, stock, and orders in step.",
    tag: "Apparel",
    handle: "@amaras_closet",
    handleColor: "#b91c1c",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    metric: "₦340,000 / wk",
  },
  {
    id: "food",
    title: "Food",
    copy: "Menus, combos, and incoming orders.",
    tag: "Food & Dining",
    handle: "@lagos_bakes",
    handleColor: "#c2410c",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    metric: "Instant prep",
  },
  {
    id: "beauty",
    title: "Beauty",
    copy: "Products and repeat customers.",
    tag: "Beauty & Care",
    handle: "@glow_by_kemi",
    handleColor: "#0f766e",
    image:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    metric: "+47% repeat",
  },
  {
    id: "electronics",
    title: "Electronics",
    copy: "High-value orders without the guesswork.",
    tag: "Electronics",
    handle: "@volt_gadgets",
    handleColor: "#1e293b",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    metric: "Serial tracked",
  },
  {
    id: "digital",
    title: "Digital",
    copy: "Sell PDFs, courses, and downloads.",
    tag: "Digital Goods",
    handle: "@creator_kit",
    handleColor: "#4338ca",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    metric: "Auto-delivery",
  },
  {
    id: "services",
    title: "Services",
    copy: "Invoices that are ready to pay.",
    tag: "Services",
    handle: "@studio_artisan",
    handleColor: "#065f46",
    image:
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80",
    metric: "1-click pay",
  },
];

const communityTop = [
  {
    handle: "@amara_studio",
    role: "Fashion Label",
    city: "Lagos",
    image:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80",
    offset: "-22px",
    size: "106px",
    aspect: "1/1",
    stat: "₦1.4M / mo",
  },
  {
    handle: "@tunde_kicks",
    role: "Streetwear",
    city: "Abuja",
    image:
      "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=400&q=80",
    offset: "24px",
    size: "94px",
    aspect: "1/1",
    stat: "140 orders",
  },
  {
    handle: "@kemi_designs",
    role: "Brand Kit",
    city: "Lagos",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    offset: "-10px",
    size: "114px",
    aspect: "1/1.1",
    stat: "Instant DL",
  },
  {
    handle: "@chef_mide",
    role: "Artisan Pastry",
    city: "Lekki",
    image:
      "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=400&q=80",
    offset: "32px",
    size: "90px",
    aspect: "1/1",
    stat: "Same-day",
  },
  {
    handle: "@zara_apparel",
    role: "Bespoke Couture",
    city: "Accra",
    image:
      "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=400&q=80",
    offset: "-28px",
    size: "110px",
    aspect: "1/1.15",
    stat: "₦890k / mo",
  },
  {
    handle: "@gadgetplug",
    role: "Audio & Tech",
    city: "Ikeja",
    image:
      "https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?auto=format&fit=crop&w=400&q=80",
    offset: "14px",
    size: "98px",
    aspect: "1/1",
    stat: "Serial tracked",
  },
  {
    handle: "@aura_glow",
    role: "Skincare",
    city: "Port Harcourt",
    image:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=80",
    offset: "-16px",
    size: "104px",
    aspect: "1/1",
    stat: "+52% repeat",
  },
  {
    handle: "@clayandwood",
    role: "Handmade Decor",
    city: "Lagos",
    image:
      "https://images.unsplash.com/photo-1584361853901-dd1904bb7987?auto=format&fit=crop&w=400&q=80",
    offset: "26px",
    size: "92px",
    aspect: "1/1.05",
    stat: "Handcrafted",
  },
  {
    handle: "@davidcodes",
    role: "Tech Courses",
    city: "Remote",
    image:
      "https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&w=400&q=80",
    offset: "-24px",
    size: "112px",
    aspect: "1/1",
    stat: "3.2k sold",
  },
  {
    handle: "@nile_gems",
    role: "Artisan Jewelry",
    city: "Cairo",
    image:
      "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80",
    offset: "18px",
    size: "96px",
    aspect: "1/1",
    stat: "Custom",
  },
];

const communityBottom = [
  {
    handle: "@eyewear_haus",
    role: "Luxury Eyewear",
    city: "Lagos",
    image:
      "https://images.unsplash.com/photo-1507152832244-10d45c7eda57?auto=format&fit=crop&w=400&q=80",
    offset: "22px",
    size: "108px",
    aspect: "1/1.1",
    stat: "Verified",
  },
  {
    handle: "@studio_lens",
    role: "Editorial Studio",
    city: "Victoria Island",
    image:
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=400&q=80",
    offset: "-24px",
    size: "96px",
    aspect: "1/1",
    stat: "Chat invoice",
  },
  {
    handle: "@sole_craft",
    role: "Footwear",
    city: "Abuja",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=400&q=80",
    offset: "16px",
    size: "114px",
    aspect: "1/1",
    stat: "₦2.1M / mo",
  },
  {
    handle: "@oud_haven",
    role: "Niche Scents",
    city: "Ibadan",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
    offset: "-18px",
    size: "92px",
    aspect: "1/1.08",
    stat: "Artisan",
  },
  {
    handle: "@art_by_simi",
    role: "3D Creator",
    city: "Lagos",
    image:
      "https://images.unsplash.com/photo-1563237023-b1e970526dcb?auto=format&fit=crop&w=400&q=80",
    offset: "30px",
    size: "102px",
    aspect: "1/1",
    stat: "Assets & Prints",
  },
  {
    handle: "@bean_culture",
    role: "Specialty Roaster",
    city: "Lekki",
    image:
      "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=400&q=80",
    offset: "-30px",
    size: "118px",
    aspect: "1/1.15",
    stat: "Daily drops",
  },
  {
    handle: "@volt_station",
    role: "Smart Devices",
    city: "Ikeja",
    image:
      "https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?auto=format&fit=crop&w=400&q=80",
    offset: "12px",
    size: "94px",
    aspect: "1/1",
    stat: "Tracked stock",
  },
  {
    handle: "@ankara_hub",
    role: "Textiles",
    city: "Lagos",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    offset: "-20px",
    size: "106px",
    aspect: "1/1",
    stat: "Wholesale",
  },
  {
    handle: "@motion_fit",
    role: "Activewear",
    city: "Abuja",
    image:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=80",
    offset: "24px",
    size: "98px",
    aspect: "1/1",
    stat: "New drop",
  },
  {
    handle: "@bloom_botanics",
    role: "Floral Studio",
    city: "Lagos",
    image:
      "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=400&q=80",
    offset: "-14px",
    size: "110px",
    aspect: "1/1.1",
    stat: "Same-day",
  },
];

const steps = [
  [
    "01",
    "Create your store",
    "Set up directly from WhatsApp. Your store is ready to share in minutes.",
    "Store",
  ],
  [
    "02",
    "Share your products",
    "Give every product a clean page customers can trust and share.",
    "Products",
  ],
  [
    "03",
    "Get paid",
    "Send checkout in the chat. Payment is confirmed without the back-and-forth.",
    "Checkout",
  ],
  [
    "04",
    "Run your business",
    "Orders, inventory, customers, and sales all update together.",
    "Insights",
  ],
];

const faqs = [
  [
    "Do I need a website to use Qora?",
    "No. Qora works directly from WhatsApp. Your storefront link is generated for you and works anywhere you can paste a link.",
  ],
  [
    "How does payment confirmation work?",
    "Customers pay through your checkout link. Qora confirms the payment automatically and updates the order with zero screenshots needed.",
  ],
  [
    "Can I manage inventory across multiple products?",
    "Yes. Stock updates automatically as orders come in, and you can adjust it manually any time.",
  ],
  [
    "Is there a cost to get started?",
    "Starting your store is free. Qora charges a simple monthly fee once you're ready to scale, never taking a cut of your sales.",
  ],
];

/** Colors the fixed backdrop layer morphs between as each section becomes
 * the one centered in the viewport. Values are plain hex so they can be
 * written straight into a CSS custom property. */
const THEME = {
  ivory: "#f7f4ec",
  deep: "#efeada",
  ink: "#14150f",
  emerald: "#0c6b48",
};

/** One hook, one pass: sticky-nav elevation, section-driven backdrop color,
 * generic reveal-on-scroll for anything tagged data-reveal, and a light
 * parallax pass for anything tagged data-parallax. Kept dependency-free so
 * it drops into any build without adding an animation library. */
function useScrollExperience() {
  const navRef = useRef(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Section backdrop morph
    const themedEls = Array.from(document.querySelectorAll("[data-theme]"));
    const themeIO = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const theme = entry.target.dataset.theme;
            document.documentElement.style.setProperty("--scroll-bg", theme);
            document.documentElement.setAttribute("data-active-theme", theme);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    themedEls.forEach(el => themeIO.observe(el));

    // Generic reveal-on-scroll
    const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
    const revealIO = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            revealIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -6% 0px" }
    );
    if (reduceMotion) {
      revealEls.forEach(el => el.classList.add("is-in"));
    } else {
      revealEls.forEach(el => revealIO.observe(el));
    }

    // Nav elevation + light parallax, throttled to one rAF per frame
    const parallaxEls = Array.from(
      document.querySelectorAll("[data-parallax]")
    );
    let rafId = null;
    const apply = () => {
      rafId = null;
      const nav = navRef.current;
      if (nav) nav.classList.toggle("scrolled", window.scrollY > 24);

      if (!reduceMotion && window.innerWidth > 960) {
        const y = window.scrollY;
        parallaxEls.forEach(el => {
          const speed = parseFloat(el.dataset.parallax) || 0.1;
          const offset = Math.max(-46, Math.min(46, y * speed * -0.05));
          el.style.setProperty("--py", `${offset.toFixed(1)}px`);
        });
      }
    };
    const onScroll = () => {
      if (rafId === null) rafId = requestAnimationFrame(apply);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    apply();

    return () => {
      window.removeEventListener("scroll", onScroll);
      themeIO.disconnect();
      revealIO.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return navRef;
}

export default function QoraLanding() {
  const stageRef = useRef(null);
  const navRef = useScrollExperience();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Hero card entrance choreography — flies the fanned stack in once, then
  // hands each card off to a "settled" state so :hover transforms aren't
  // fighting a filled animation.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const cards = Array.from(el.querySelectorAll(".fan-card"));
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const settle = () => cards.forEach(c => c.classList.add("settled"));

    if (reduce) {
      el.classList.add("in-view");
      settle();
      return;
    }

    let pending = cards.length;
    const onDone = () => {
      pending -= 1;
      if (pending <= 0) settle();
    };
    cards.forEach(c =>
      c.addEventListener("animationend", onDone, { once: true })
    );

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            el.classList.add("in-view");
            io.disconnect();
          }
        });
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cards.forEach(c => c.removeEventListener("animationend", onDone));
    };
  }, []);

  return (
    <div className="qora-site">
      {/* fixed backdrop that morphs color with the active section */}
      <div className="bg-morph" aria-hidden="true" />

      {/* NAV */}
      <div className="nav-shell" ref={navRef}>
        <div className="nav">
          <QoraLogo />
          <nav className="nav-links">
            <a href="#product">Product</a>
            <a href="#how">How it works</a>
            <a href="#stories">Stories</a>
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
      <section className="hero" data-theme={THEME.ivory}>
        <div className="wrap">
          <p className="eyebrow" style={{ justifyContent: "center" }}>
            Commerce for the chat you already use
          </p>
          <h1>
            Turn every chat
            <br />
            <b>into a tracked sale.</b>
          </h1>
          <p className="hero-sub">
            Qora turns WhatsApp orders into checkouts, confirmed payments, and
            inventory that updates itself. No spreadsheets. No notebooks.
          </p>
          <div className="hero-actions">
            <a
              className="btn-primary"
              href={WHATSAPP_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Start selling free <ArrowRight size={16} />
            </a>
            <a className="btn-ghost" href="#how">
              See how it works
            </a>
          </div>

          <div className="hero-stage" ref={stageRef}>
            <span className="fan-badge">@amaras_closet</span>

            <div className="fan-card fan-1">
              <div className="fan-parallax" data-parallax="0.55">
                <span className="tag">Order #1042</span>
                <div className="fan-visual">
                  <BeltIcon />
                </div>
                <div className="fan-body">
                  <small>Canvas Belt × 1</small>
                  <strong>₦8,000</strong>
                </div>
              </div>
            </div>

            <div className="fan-card fan-2">
              <div className="fan-parallax" data-parallax="0.3">
                <span className="tag">Payment</span>
                <div className="fan-visual">
                  <CheckIcon />
                </div>
                <div className="fan-body">
                  <small>Received just now</small>
                  <strong>₦62,000</strong>
                </div>
              </div>
            </div>

            <div className="fan-card fan-3">
              <div className="fan-parallax" data-parallax="0.1">
                <span className="tag">Order #1048</span>
                <div className="fan-visual">
                  <SneakerIcon />
                </div>
                <div className="fan-body">
                  <small>Black Sneakers × 2</small>
                  <strong>Ready to fulfil</strong>
                </div>
              </div>
            </div>

            <div className="fan-card fan-4">
              <div className="fan-parallax" data-parallax="0.3">
                <span className="tag">Today's sales</span>
                <div className="fan-visual">
                  <ChartIcon />
                </div>
                <div className="fan-body">
                  <small>18.2% up this week</small>
                  <strong>₦85,000</strong>
                </div>
              </div>
            </div>

            <div className="fan-card fan-5">
              <div className="fan-parallax" data-parallax="0.55">
                <span
                  className="tag"
                  style={{
                    background: "rgba(20,21,15,0.06)",
                    color: "var(--ink-soft)",
                  }}
                >
                  Inventory
                </span>
                <div className="fan-visual">
                  <BoxIcon />
                </div>
                <div className="fan-body">
                  <small>Black Sneakers, sz 42</small>
                  <strong>Stock updated</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <div className="trust-strip">
        <div className="trust-inner">
          <p>BUILT FOR SELLERS ACROSS NIGERIA</p>
          {[
            "Fashion",
            "Food",
            "Beauty",
            "Electronics",
            "Digital",
            "Services",
          ].map(c => (
            <span key={c}>{c}</span>
          ))}
        </div>
      </div>

      {/* WHY QORA */}
      <section className="section" id="product" data-theme={THEME.deep}>
        <div className="wrap">
          <div className="section-head" data-reveal="up">
            <p className="eyebrow" style={{ justifyContent: "center" }}>
              Why Qora
            </p>
            <h2>
              Your business shouldn&apos;t live inside
              <br />a pile of WhatsApp messages.
            </h2>
            <p>
              When every sale means a chat, a transfer, a screenshot, and a
              notebook, the admin gets in the way of the business.
            </p>
          </div>

          <div className="split">
            <div className="split-card split-messy" data-reveal="left">
              <div>
                <span className="messy-label">Without Qora</span>
                <div className="messy-bits">
                  <span>&quot;I&apos;ve paid&quot; screenshot</span>
                  <span>Bank app</span>
                  <span>Order #1048</span>
                  <span>Notebook page 6</span>
                  <span>Manual stock count</span>
                </div>
              </div>
              <p className="messy-flow">
                Message → transfer → screenshot → notebook
              </p>
            </div>
            <div className="split-card split-clear" data-reveal="right">
              <div>
                <span
                  className="messy-label"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  With Qora
                </span>
                <div className="clear-flow">
                  <div className="step">
                    <span className="ic">
                      <MessageCircle size={17} />
                    </span>
                    Order
                  </div>
                  <span>→</span>
                  <div className="step">
                    <span className="ic">
                      <CircleDollarSign size={17} />
                    </span>
                    Paid
                  </div>
                  <span>→</span>
                  <div className="step">
                    <span className="ic">
                      <PackageCheck size={17} />
                    </span>
                    Updated
                  </div>
                  <span>→</span>
                  <div className="step">
                    <span className="ic">
                      <BarChart3 size={17} />
                    </span>
                    Tracked
                  </div>
                </div>
              </div>
              <div className="clear-result">
                <span>Order #1048 is ready to fulfil.</span>
                <strong>₦62,000</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="section" data-theme={THEME.ivory}>
        <div className="wrap">
          <div className="section-head" data-reveal="up">
            <p className="eyebrow" style={{ justifyContent: "center" }}>
              Advanced tracking
            </p>
            <h2>Every naira, in view.</h2>
            <p>
              The same numbers you&apos;d dig for across five apps, sitting in
              one place, updated as sales happen.
            </p>
          </div>

          <div className="stat-grid">
            <div className="panel" data-reveal="left">
              <h3>Top products this week</h3>
              <div className="tag-cloud">
                <span className="hot">Black Sneakers</span>
                <span>Canvas Belt</span>
                <span>Denim Jacket</span>
                <span className="hot">Ankara Set</span>
                <span>Tote Bag</span>
                <span>Silk Scarf</span>
                <span>Wristwatch</span>
              </div>
            </div>
            <div className="panel" data-reveal="right">
              <h3>Store performance</h3>
              <div className="chips-row">
                <div className="chip amber">
                  <small>Sales this month</small>
                  <strong>₦2,840,500</strong>
                </div>
                <div className="chip emerald">
                  <small>Repeat customers</small>
                  <strong>+47%</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="trio">
            <div
              className="chip amber"
              data-reveal="scale"
              style={{ "--rd": 0 }}
            >
              <small>SALES THIS MONTH</small>
              <strong>₦2,840,500</strong>
              <span className="trend">▲ 18.2%</span>
            </div>
            <div
              className="chip emerald"
              data-reveal="scale"
              style={{ "--rd": 1 }}
            >
              <small>NET PROFIT</small>
              <strong>₦1,140,200</strong>
              <span className="trend">▲ 11.4%</span>
            </div>
            <div className="chip ink" data-reveal="scale" style={{ "--rd": 2 }}>
              <small>ORDERS FULFILLED</small>
              <strong>428</strong>
              <span className="trend">▲ 6.2%</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" id="how" data-theme={THEME.deep}>
        <div className="wrap">
          <div
            className="section-head"
            data-reveal="up"
            style={{
              textAlign: "left",
              maxWidth: "none",
              marginBottom: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            <div style={{ textAlign: "left" }}>
              <p className="eyebrow">Simple by design</p>
              <h2 style={{ maxWidth: 420 }}>
                From conversation to completed order.
              </h2>
            </div>
            <p
              style={{
                maxWidth: 340,
                margin: 0,
                color: "var(--ink-soft)",
                fontSize: 15,
                lineHeight: 1.6,
              }}
            >
              Qora meets you in the flow of work you already know, then takes
              care of the work you&apos;d rather not do.
            </p>
          </div>

          <div className="rows">
            {steps.map(([num, title, copy, label], i) => (
              <div
                className="row-item"
                key={num}
                data-reveal="left"
                style={{ "--rd": i }}
              >
                <span className="num">{num}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
                <span className="tag">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORWARD A CONVERSATION */}
      <section className="section" data-theme={THEME.ivory}>
        <div className="wrap">
          <div className="section-head" data-reveal="up">
            <p className="eyebrow" style={{ justifyContent: "center" }}>
              A workflow that speaks for itself
            </p>
            <h2>
              Forward a conversation.
              <br />
              Finish a sale.
            </h2>
            <p>
              When a customer tells you what they need, Qora turns the message
              into a checkout. Clear for them, accurate for you.
            </p>
          </div>

          <div className="convo">
            <div className="phone" data-reveal="left">
              <div className="who">
                <span className="av">A</span>
                <div>
                  <b>Amara Bello</b>
                  <small>Customer</small>
                </div>
              </div>
              <div className="bubble">
                I need 2 black shoes, size 42, and one belt.
              </div>
              <div className="forward-btn">
                <Send size={13} /> Forward to Qora
              </div>
            </div>

            <div className="extract" data-reveal="scale">
              <div className="head">
                <span className="ic">
                  <Sparkles size={15} />
                </span>
                <div>
                  <small>QORA UNDERSTOOD</small>
                  <strong>Order details</strong>
                </div>
              </div>
              <div className="exline">
                <span>
                  Black Sneakers
                  <br />
                  <small>Size 42</small>
                </span>
                <b>×2</b>
              </div>
              <div className="exline">
                <span>Canvas Belt</span>
                <b>×1</b>
              </div>
              <div className="extotal">
                <span>Total</span>
                <span>₦62,000</span>
              </div>
              <button>
                Share checkout <ArrowRight size={15} />
              </button>
            </div>

            <div className="confirm" data-reveal="right">
              <span className="ic">
                <CheckCircle2 size={20} />
              </span>
              <div>
                <strong>Payment successful</strong>
                <p>₦62,000 received. Order marked ready to fulfil.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STOREFRONT */}
      <section className="section" data-theme={THEME.deep}>
        <div className="wrap">
          <div className="store-split">
            <div className="store-window" data-reveal="left">
              <div className="store-nav">
                <b>SULTAN STORE</b>
                <span
                  style={{ display: "flex", gap: 10, color: "var(--ink-soft)" }}
                >
                  <Search size={15} />
                  <ShoppingBag size={15} />
                </span>
              </div>
              <div className="store-photo" data-parallax="0.4" />
              <div className="store-copy">
                <div>
                  <small>NEW ARRIVALS</small>
                  <h4>
                    Essential pieces.
                    <br />
                    Easy days.
                  </h4>
                </div>
              </div>
            </div>
            <div data-reveal="right">
              <p className="eyebrow">A storefront of your own</p>
              <h2 style={{ fontSize: "clamp(28px,3.4vw,40px)" }}>
                Give customers a store they can <em>trust.</em>
              </h2>
              <p
                style={{
                  color: "var(--ink-soft)",
                  marginTop: 14,
                  fontSize: "15.5px",
                  lineHeight: 1.6,
                }}
              >
                Your Qora storefront makes your business look as good as the
                products you&apos;re selling. Fast, clear, and ready to share in
                a chat.
              </p>
              <ul className="checklist">
                <li>
                  <span className="tick">
                    <Check size={13} />
                  </span>
                  Products, prices, and stock that stay current
                </li>
                <li>
                  <span className="tick">
                    <Check size={13} />
                  </span>
                  Search, cart, and secure checkout
                </li>
                <li>
                  <span className="tick">
                    <Check size={13} />
                  </span>
                  One link that works wherever customers find you
                </li>
              </ul>
              <div className="store-url">
                <Link2 size={14} /> qora.store/sultan <Check size={13} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VERTICALS */}
      <section className="section" data-theme={THEME.ivory}>
        <div className="wrap">
          <div className="section-head" data-reveal="up">
            <p className="eyebrow" style={{ justifyContent: "center" }}>
              Made for every kind of momentum
            </p>
            <h2>Built for businesses that are already selling.</h2>
            <p>
              Whether you sell a service, a product, or a file, Qora gives the
              sale a clear place to go.
            </p>
          </div>

          <div className="verticals-grid">
            {verticals.map((v, i) => (
              <div
                className="vcard"
                key={v.id}
                data-reveal="scale"
                style={{ "--rd": i }}
              >
                <div className="vcard-image-wrap">
                  <img
                    src={v.image}
                    alt={v.title}
                    className="vcard-img"
                    loading="lazy"
                  />
                  <div className="vcard-overlay" />
                  <div
                    className="vcard-handle"
                    style={{ background: v.handleColor }}
                  >
                    <span>{v.handle}</span>
                  </div>
                  <div className="vcard-top-pill">
                    <span>{v.tag}</span>
                  </div>
                  <div className="vcard-metric-pill">
                    <span>{v.metric}</span>
                  </div>
                </div>
                <div className="vcard-info">
                  <div className="vcard-head">
                    <h3>{v.title}</h3>
                    <span className="vcard-arrow">
                      <ArrowRight size={16} />
                    </span>
                  </div>
                  <p>{v.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMUNITY SHOWCASE (Pallet Ross style) */}
      <section className="community-section" data-theme={THEME.deep}>
        {/* Top undulating moving track */}
        <div className="community-track-wrap">
          <div className="community-track track-top">
            {[...communityTop, ...communityTop].map((item, idx) => (
              <div
                key={`${item.handle}-top-${idx}`}
                className="community-squircle"
                style={{
                  transform: `translateY(${item.offset})`,
                  width: item.size,
                  minWidth: item.size,
                  aspectRatio: item.aspect || "1/1",
                }}
              >
                <img src={item.image} alt={item.handle} loading="lazy" />
                <div className="community-tooltip">
                  <span className="tooltip-handle">{item.handle}</span>
                  <span className="tooltip-role">
                    {item.role} · {item.city}
                  </span>
                  <span className="tooltip-stat">{item.stat}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center copy block */}
        <div className="community-center" data-reveal="scale">
          <p className="eyebrow" style={{ justifyContent: "center" }}>
            The seller network
          </p>
          <h2>
            You&apos;ll find yourself
            <br />
            in ambitious company.
          </h2>
          <p>
            From boutique fashion labels in Lekki and sneaker curators in Abuja
            to bakers, beauty founders, and digital educators. Join thousands of
            merchants turning daily chats into confirmed revenue.
          </p>
        </div>

        {/* Bottom undulating moving track */}
        <div className="community-track-wrap">
          <div className="community-track track-bottom">
            {[...communityBottom, ...communityBottom].map((item, idx) => (
              <div
                key={`${item.handle}-bot-${idx}`}
                className="community-squircle"
                style={{
                  transform: `translateY(${item.offset})`,
                  width: item.size,
                  minWidth: item.size,
                  aspectRatio: item.aspect || "1/1",
                }}
              >
                <img src={item.image} alt={item.handle} loading="lazy" />
                <div className="community-tooltip">
                  <span className="tooltip-handle">{item.handle}</span>
                  <span className="tooltip-role">
                    {item.role} · {item.city}
                  </span>
                  <span className="tooltip-stat">{item.stat}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI PANEL */}
      <section className="section" data-theme={THEME.ink}>
        <div className="wrap">
          <div className="ai-panel" data-reveal="scale">
            <div>
              <p className="eyebrow">Intelligence where you work</p>
              <h2>Your business assistant, inside WhatsApp.</h2>
              <p>
                Ask practical questions. Add stock by voice. Let Qora surface
                the work that needs your attention without making AI the whole
                job.
              </p>
            </div>
            <div className="ai-card">
              <div className="ai-q">How much did I sell this month?</div>
              <div className="ai-a">
                <small>YOUR SALES FOR AUGUST</small>
                <strong>₦2,840,500</strong>
                <small>▲ 18.2% · 428 orders</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="stories" data-theme={THEME.ivory}>
        <div className="wrap">
          <div className="section-head" data-reveal="up">
            <p className="eyebrow" style={{ justifyContent: "center" }}>
              Frequently asked
            </p>
            <h2>Questions, answered.</h2>
          </div>
          <div className="faq" data-reveal="up">
            {faqs.map(([q, a], i) => {
              const isOpen = openFaq === i;
              return (
                <div className={`faq-item ${isOpen ? "open" : ""}`} key={q}>
                  <button
                    type="button"
                    className="faq-summary"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                  >
                    <span>{q}</span>
                    <span className={`faq-chevron ${isOpen ? "rotated" : ""}`}>
                      <ChevronDown size={18} />
                    </span>
                  </button>
                  <div className="faq-body">
                    <div className="faq-body-inner">
                      <p>{a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        className="section"
        style={{ paddingTop: 0 }}
        data-theme={THEME.emerald}
      >
        <div className="wrap">
          <div className="final-cta" data-reveal="scale">
            <p
              className="eyebrow"
              style={{
                justifyContent: "center",
                color: "rgba(255,255,255,0.75)",
              }}
            >
              Your next sale is already in the chat
            </p>
            <h2>
              Your business is already on WhatsApp.
              <br />
              Now give it the tools to grow.
            </h2>
            <a
              className="btn-primary"
              href={WHATSAPP_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Start on WhatsApp <ArrowRight size={16} />
            </a>
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
                <a href="#product">Storefront</a>
                <a href="#product">Orders</a>
                <a href="#product">Payments</a>
                <a href="#product">Inventory</a>
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
