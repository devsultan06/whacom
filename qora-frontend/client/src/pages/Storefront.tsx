import { useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  CreditCard,
  Heart,
  MessageCircle,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import { WHATSAPP_BOT_URL } from "../const";
import "../styles/storefront.css";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  desc: string;
  image: string;
}

const products: Product[] = [
  {
    id: 1,
    name: "Obsidian Black Sneakers",
    category: "Footwear",
    price: 45000,
    stock: 42,
    desc: "Lightweight cushioned sneakers for daily wear. Available in sizes 40 to 45.",
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&h=450&q=80",
  },
  {
    id: 2,
    name: "Classic Canvas Tote Bag",
    category: "Bags",
    price: 32000,
    stock: 8,
    desc: "Heavyweight organic canvas bag with reinforced leather shoulder straps.",
    image:
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&h=450&q=80",
  },
  {
    id: 3,
    name: "Relaxed Linen Shirt (Ecru)",
    category: "Apparel",
    price: 28500,
    stock: 14,
    desc: "Breathable natural linen button-down shirt. Relaxed unisex fit.",
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&h=450&q=80",
  },
  {
    id: 4,
    name: "Canvas Belt (Brown)",
    category: "Accessories",
    price: 9000,
    stock: 56,
    desc: "Solid brass buckle with durable woven strap. Adjustable length.",
    image:
      "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=600&h=450&q=80",
  },
  {
    id: 5,
    name: "Leather Slides",
    category: "Footwear",
    price: 38000,
    stock: 16,
    desc: "Soft genuine leather upper with ergonomic contoured footbed.",
    image:
      "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=600&h=450&q=80",
  },
  {
    id: 6,
    name: "Silk Printed Scarf",
    category: "Accessories",
    price: 15000,
    stock: 24,
    desc: "Pure mulberry silk with classic Lagos geometric pattern.",
    image:
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=600&h=450&q=80",
  },
];

const naira = (n: number) => `₦${n.toLocaleString()}`;

export default function Storefront() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<{ id: number; qty: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [deliveryArea, setDeliveryArea] = useState(
    "Lekki / Victoria Island (₦2,500)"
  );
  const [showBankModal, setShowBankModal] = useState(false);
  const [paidDone, setPaidDone] = useState(false);

  const deliveryFee = deliveryArea.includes("2,500")
    ? 2500
    : deliveryArea.includes("3,000")
      ? 3000
      : deliveryArea.includes("4,500")
        ? 4500
        : 5000;

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchCat =
        selectedCategory === "All" || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, selectedCategory]);

  const cartItems = cart
    .map(c => {
      const p = products.find(prod => prod.id === c.id);
      return p ? { ...p, qty: c.qty } : null;
    })
    .filter(Boolean) as (Product & { qty: number })[];

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );
  const total = subtotal > 0 ? subtotal + deliveryFee : 0;
  const totalCount = cart.reduce((acc, item) => acc + item.qty, 0);

  const addToCart = (id: number) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === id);
      if (exists) {
        return prev.map(item =>
          item.id === id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { id, qty: 1 }];
    });
    setCartOpen(true);
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev =>
      prev
        .map(item =>
          item.id === id ? { ...item, qty: item.qty + delta } : item
        )
        .filter(item => item.qty > 0)
    );
  };

  const handleWhatsAppCheckout = () => {
    if (cartItems.length === 0) return;
    const lines = cartItems
      .map(i => `• ${i.name} (Qty: ${i.qty}) - ${naira(i.price * i.qty)}`)
      .join("%0A");

    const msg = `Hello Sultan Store! 👋%0AI would like to order:%0A%0A${lines}%0A%0ASubtotal: ${naira(
      subtotal
    )}%0ADelivery (${deliveryArea}): ${naira(deliveryFee)}%0ATotal Amount: ${naira(
      total
    )}%0A%0APlease confirm my order. Thank you!`;

    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  return (
    <div className="store-simple-root">
      {/* MERCHANT STORE HEADER */}
      <header className="store-simple-nav">
        <div className="nav-simple-inner">
          <div className="store-brand-left">
            <a href="/store/sultan" className="store-brand-name">
              Sultan Store
            </a>
            <span className="store-location-tag">
              Lekki, Lagos · WhatsApp Online
            </span>
          </div>

          <div className="nav-right-actions">
            <a
              href={WHATSAPP_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-chat-wa"
            >
              <MessageCircle size={15} /> Chat on WhatsApp
            </a>

            <button
              type="button"
              className="btn-simple-cart"
              onClick={() => setCartOpen(true)}
              aria-label="View shopping bag"
            >
              <ShoppingBag size={17} />
              <span>Bag ({totalCount})</span>
            </button>
          </div>
        </div>
      </header>

      {/* CLEAN CATEGORY BAR & SEARCH */}
      <div className="store-filter-bar">
        <div className="filter-bar-inner">
          <div className="cat-buttons">
            {["All", "Footwear", "Apparel", "Bags", "Accessories"].map(cat => (
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
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* SIMPLE PRODUCT GRID WITH IMAGES */}
      <main className="store-main-container">
        <div className="products-simple-grid">
          {filtered.map(product => (
            <div key={product.id} className="simple-product-card">
              {/* Product Image Box */}
              <div className="card-img-wrap">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className="product-photo"
                />
                <span className="cat-tag-pill">{product.category}</span>
              </div>

              <div className="card-body-content">
                <div className="card-top-info">
                  <span className="stock-info">{product.stock} in stock</span>
                </div>

                <h3>{product.name}</h3>
                <p className="prod-desc">{product.desc}</p>
                <strong className="prod-price">{naira(product.price)}</strong>

                <div className="card-btn-row">
                  <button
                    type="button"
                    className="btn-add-bag"
                    onClick={() => addToCart(product.id)}
                  >
                    <Plus size={14} /> Add to Bag
                  </button>

                  <a
                    href={`https://wa.me/?text=Hi%20Sultan%20Store,%20I%20want%20to%20order%20${encodeURIComponent(
                      product.name
                    )}%20(${naira(product.price)}).`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-wa-direct"
                    title="Direct WhatsApp Order"
                  >
                    <MessageCircle size={15} /> Order on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty-catalog-box">
            <p>No products found matching &ldquo;{search}&rdquo;.</p>
            <button
              type="button"
              className="btn-add-bag"
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
              }}
            >
              Show All Products
            </button>
          </div>
        )}
      </main>

      {/* SIMPLE CLEAN CART DRAWER */}
      <aside className={`simple-cart-drawer ${cartOpen ? "open" : ""}`}>
        <div className="cart-drawer-top">
          <h3>Your Bag ({totalCount})</h3>
          <button
            type="button"
            className="cart-close-x"
            onClick={() => setCartOpen(false)}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {cartItems.length > 0 ? (
          <div className="cart-drawer-content">
            <div className="cart-items-list">
              {cartItems.map(item => (
                <div key={item.id} className="cart-row-item">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-thumb"
                  />
                  <div className="item-details">
                    <strong>{item.name}</strong>
                    <span className="item-price">{naira(item.price)} each</span>
                  </div>

                  <div className="item-qty-controls">
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, -1)}
                      aria-label="Decrease"
                    >
                      <Minus size={12} />
                    </button>
                    <span>{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, 1)}
                      aria-label="Increase"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-checkout-footer">
              <div className="delivery-select">
                <label>
                  <Truck size={13} /> Delivery Location:
                </label>
                <select
                  value={deliveryArea}
                  onChange={e => setDeliveryArea(e.target.value)}
                >
                  <option value="Lekki / Victoria Island (₦2,500)">
                    Lagos Island / Lekki (₦2,500)
                  </option>
                  <option value="Lagos Mainland (₦3,000)">
                    Lagos Mainland (₦3,000)
                  </option>
                  <option value="Abuja (₦4,500)">Abuja (₦4,500)</option>
                  <option value="Port Harcourt & Interstate (₦5,000)">
                    Port Harcourt & Interstate (₦5,000)
                  </option>
                </select>
              </div>

              <div className="bill-row">
                <span>Subtotal</span>
                <span>{naira(subtotal)}</span>
              </div>
              <div className="bill-row">
                <span>Delivery</span>
                <span>{naira(deliveryFee)}</span>
              </div>
              <div className="bill-row total">
                <strong>Total Amount</strong>
                <strong>{naira(total)}</strong>
              </div>

              <button
                type="button"
                className="btn-order-wa-primary"
                onClick={handleWhatsAppCheckout}
              >
                <MessageCircle size={17} /> Send Order on WhatsApp
              </button>

              <button
                type="button"
                className="btn-bank-secondary"
                onClick={() => setShowBankModal(true)}
              >
                <CreditCard size={15} /> Pay via Bank Transfer
              </button>
            </div>
          </div>
        ) : (
          <div className="cart-empty-state">
            <ShoppingBag size={32} />
            <p>Your shopping bag is empty.</p>
            <button
              type="button"
              className="btn-add-bag"
              onClick={() => setCartOpen(false)}
            >
              Start Shopping
            </button>
          </div>
        )}
      </aside>

      {cartOpen && (
        <div
          className="cart-scrim-bg"
          onClick={() => setCartOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* BANK PAYMENT MODAL */}
      {showBankModal && (
        <div className="modal-backdrop" onClick={() => setShowBankModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-box-header">
              <h3>Bank Transfer Details</h3>
              <button
                type="button"
                className="modal-x"
                onClick={() => setShowBankModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-transfer-body">
              <p className="transfer-instruction">
                Please transfer <b>{naira(total)}</b> to Sultan Store&apos;s
                account:
              </p>

              <div className="bank-details-card">
                <div className="detail-line">
                  <span>Bank:</span>
                  <strong>GTBank (Guaranty Trust Bank)</strong>
                </div>
                <div className="detail-line">
                  <span>Account Number:</span>
                  <strong className="font-mono">0123456789</strong>
                </div>
                <div className="detail-line">
                  <span>Account Name:</span>
                  <strong>SULTAN STORE ENTERPRISES</strong>
                </div>
              </div>

              {paidDone ? (
                <div className="payment-confirmed-banner">
                  <CheckCircle2 size={20} className="text-emerald" />
                  <div>
                    <strong>Transfer Notification Sent!</strong>
                    <p>We will confirm your order on WhatsApp shortly.</p>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="header-btn-add full-btn"
                  onClick={() => {
                    setPaidDone(true);
                    setTimeout(() => {
                      setShowBankModal(false);
                      setCart([]);
                      setCartOpen(false);
                      setPaidDone(false);
                      alert(
                        "Thank you! Your transfer notification has been submitted."
                      );
                    }, 2000);
                  }}
                >
                  <Check size={16} /> I Have Transferred {naira(total)}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BIG CENTERED POWERED BY QORA FOOTER */}
      <footer className="store-simple-footer">
        <div className="store-footer-centered">
          <a
            href="/"
            className="store-powered-by-qora-big"
            title="Powered by Qora Commerce"
          >
            <span className="powered-text">Powered by</span>
            <div className="powered-logo-lockup">
              <span className="powered-q-mark">Q</span>
              <span className="powered-ora-text">ora</span>
            </div>
          </a>
          <p className="footer-sub-text">
            © 2026 Sultan Store · Orders & Delivery fulfilled on WhatsApp
          </p>
        </div>
      </footer>
    </div>
  );
}
