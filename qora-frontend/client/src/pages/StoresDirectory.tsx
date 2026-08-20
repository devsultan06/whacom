import { useEffect, useState, useMemo } from "react";
import { Search, ShoppingBag, ArrowRight, MessageCircle } from "lucide-react";
import { WHATSAPP_BOT_URL } from "../const";
import "../styles/storefront.css";

interface StoreItem {
  id: string;
  storeName: string;
  slug: string;
  category?: string;
  location?: string;
  description?: string;
  logoUrl?: string;
  currencySymbol?: string;
  _count?: {
    products: number;
  };
  products?: {
    id: string;
    name: string;
    price: number;
  }[];
}

const CATEGORIES = [
  "All",
  "Food & Dining",
  "Fashion & Apparel",
  "Gadgets & Electronics",
  "Beauty & Cosmetics",
  "Digital Products",
  "Services & Custom",
];

function QoraLogo() {
  return (
    <a href="/" className="logo" aria-label="Qora homepage">
      <span className="logo-mark">Q</span>
      <span className="logo-name">ora</span>
    </a>
  );
}

export default function StoresDirectory() {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    async function fetchStores() {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3008/api/v1/storefront");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.stores) {
            setStores(data.stores);
          }
        }
      } catch (err) {
        console.warn("Could not fetch store directory from backend", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStores();
  }, []);

  const filteredStores = useMemo(() => {
    return stores.filter((s) => {
      const matchCat =
        selectedCategory === "All" ||
        s.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        s.category?.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchSearch =
        s.storeName.toLowerCase().includes(search.toLowerCase()) ||
        s.slug.toLowerCase().includes(search.toLowerCase()) ||
        (s.category && s.category.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [stores, search, selectedCategory]);

  return (
    <div className="store-simple-root">
      {/* DIRECTORY NAV HEADER */}
      <header className="store-simple-nav">
        <div className="nav-simple-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <QoraLogo />
            <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>
              Stores Directory
            </span>
          </div>

          <div className="nav-right-actions">
            <a href="/login" className="btn-chat-wa">
              Merchant Login
            </a>
            <a
              href={WHATSAPP_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-chat-wa"
              style={{ background: "var(--emerald)", color: "#ffffff", borderColor: "var(--emerald)" }}
            >
              <MessageCircle size={15} /> Create Store on WhatsApp
            </a>
          </div>
        </div>
      </header>

      {/* HERO BANNER */}
      <div style={{ background: "#ffffff", borderBottom: "1px solid var(--line)", padding: "36px 24px 28px" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <h1 style={{ fontFamily: "Bricolage Grotesque, sans-serif", fontSize: 30, fontWeight: 700, margin: "0 0 8px", color: "var(--ink)" }}>
            Explore Verified WhatsApp Stores
          </h1>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 15 }}>
            Discover and shop directly from local businesses, restaurants, gadget shops, and boutiques.
          </p>
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="store-filter-bar">
        <div className="filter-bar-inner">
          <div className="cat-buttons">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`cat-btn ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="search-box">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search stores or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* STORES GRID */}
      <main className="store-main-container">
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
            Loading stores...
          </div>
        ) : filteredStores.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {filteredStores.map((s) => {
              const productCount = s._count?.products ?? s.products?.length ?? 0;
              return (
                <div
                  key={s.id}
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--line)",
                    borderRadius: 14,
                    padding: 20,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 20,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  }}
                >
                  <div>
                    {/* Top: Logo & Category */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                      {s.logoUrl ? (
                        <img
                          src={s.logoUrl}
                          alt={s.storeName}
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "1.5px solid var(--line)",
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            background: "var(--emerald)",
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 20,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {s.storeName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--ink)", lineHeight: 1.2 }}>
                          {s.storeName}
                        </h3>
                        <span style={{ fontSize: 12, color: "var(--emerald)", fontWeight: 500 }}>
                          {s.location ? `📍 ${s.location} · ` : ""}{s.category || "Online Store"} · Verified
                        </span>
                      </div>
                    </div>

                    {/* Product count */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--muted)" }}>
                      <ShoppingBag size={14} />
                      <span>{productCount} {productCount === 1 ? "Product" : "Products"} available</span>
                    </div>
                  </div>

                  {/* Visit Store Button */}
                  <a
                    href={`/store/${s.slug}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      width: "100%",
                      padding: "10px 16px",
                      background: "var(--ink)",
                      color: "#ffffff",
                      borderRadius: 10,
                      fontWeight: 600,
                      fontSize: 13.5,
                      textDecoration: "none",
                    }}
                  >
                    Visit Store <ArrowRight size={14} />
                  </a>
                </div>
              );
            })}
          </div>
        ) : stores.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "70px 20px",
              background: "#ffffff",
              borderRadius: 16,
              border: "1px solid var(--line)",
              maxWidth: 520,
              margin: "0 auto",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "rgba(22, 163, 74, 0.08)",
                color: "var(--emerald)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 18,
              }}
            >
              <ShoppingBag size={28} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px", color: "var(--ink)" }}>
              Be the First Store on Qora
            </h3>
            <p style={{ color: "var(--muted)", fontSize: 14.5, lineHeight: 1.5, margin: "0 0 24px" }}>
              No merchants have registered yet. Turn your WhatsApp chats into tracked sales in under 60 seconds.
            </p>
            <a
              href={WHATSAPP_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "var(--emerald)",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              <MessageCircle size={16} /> Create Store on WhatsApp
            </a>
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "#ffffff",
              borderRadius: 16,
              border: "1px solid var(--line)",
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            <p style={{ margin: "0 0 16px", color: "var(--ink)", fontWeight: 600 }}>
              No stores found matching &ldquo;{search || selectedCategory}&rdquo;
            </p>
            <button
              type="button"
              className="btn-add-bag"
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
              }}
              style={{ margin: "0 auto" }}
            >
              Reset Filters & Show All
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
