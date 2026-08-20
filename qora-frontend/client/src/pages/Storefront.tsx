import { useMemo, useState, useEffect } from "react";
import { useParams } from "wouter";
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
  id: string | number;
  name: string;
  category: string;
  price: number;
  stock: number | null;
  isUnlimitedStock?: boolean;
  isDigital?: boolean;
  desc: string;
  image: string;
}

interface StoreMeta {
  storeName: string;
  category?: string;
  location?: string;
  deliveryZones?: { area: string; fee: number }[];
  logoUrl?: string;
  phone?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  currencySymbol?: string;
}

const defaultProducts: Product[] = [
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
];

const naira = (n: number) => `₦${n.toLocaleString()}`;

export default function Storefront() {
  const params = useParams<{ slug?: string }>();
  const currentSlug = params.slug || "sultan-store";

  const [storeMeta, setStoreMeta] = useState<StoreMeta>({
    storeName: "Sultan Store",
    category: "Food & Dining",
    currencySymbol: "₦",
  });
  const [productList, setProductList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<{ id: string | number; qty: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedZoneIndex, setSelectedZoneIndex] = useState(0);
  const [showBankModal, setShowBankModal] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [onlinePaying, setOnlinePaying] = useState(false);
  const [paidDone, setPaidDone] = useState(false);

  useEffect(() => {
    async function fetchStore() {
      try {
        setLoading(true);
        setNotFound(false);
        const res = await fetch(`http://localhost:3008/api/v1/storefront/${currentSlug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.store) {
            setStoreMeta({
              storeName: data.store.storeName || "My Store",
              category: data.store.category || "Retail",
              location: data.store.location,
              deliveryZones: data.store.deliveryZones,
              logoUrl: data.store.logoUrl,
              phone: data.store.phone,
              bankName: data.store.bankName,
              accountNumber: data.store.accountNumber,
              accountName: data.store.accountName,
              currencySymbol: data.store.currencySymbol || "₦",
            });

            if (data.store.products && data.store.products.length > 0) {
              const mapped: Product[] = data.store.products.map((p: any) => ({
                id: p.id,
                name: p.name,
                category: p.category || data.store.category || "General",
                price: p.price,
                stock: p.stock,
                isUnlimitedStock: p.isUnlimitedStock,
                isDigital: p.isDigital,
                desc: p.description || "",
                image: p.imageUrl || "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&h=450&q=80",
              }));
              setProductList(mapped);
            } else {
              setProductList([]);
            }
            return;
          }
        }
        setNotFound(true);
      } catch (e) {
        console.error("Store fetch error:", e);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchStore();
  }, [currentSlug]);

  const activeDeliveryZones = useMemo(() => {
    if (Array.isArray(storeMeta.deliveryZones) && storeMeta.deliveryZones.length > 0) {
      return storeMeta.deliveryZones;
    }
    return [
      { area: "Standard Delivery", fee: 2500 },
      { area: "Express / Interstate Shipping", fee: 4500 },
      { area: "Store Pickup", fee: 0 },
    ];
  }, [storeMeta.deliveryZones]);

  const currentZone = activeDeliveryZones[selectedZoneIndex] || activeDeliveryZones[0] || { area: "Standard Delivery", fee: 2500 };
  const deliveryArea = currentZone.area;
  const deliveryFee = currentZone.fee;

  const filtered = useMemo(() => {
    return productList.filter(p => {
      const matchCat =
        selectedCategory === "All" || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [productList, search, selectedCategory]);

  const cartItems = cart
    .map(c => {
      const p = productList.find(prod => prod.id === c.id);
      return p ? { ...p, qty: c.qty } : null;
    })
    .filter(Boolean) as (Product & { qty: number })[];

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );
  const total = subtotal > 0 ? subtotal + deliveryFee : 0;
  const totalCount = cart.reduce((acc, item) => acc + item.qty, 0);

  const addToCart = (id: string | number) => {
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

  const updateQty = (id: string | number, delta: number) => {
    setCart(prev =>
      prev
        .map(item =>
          item.id === id ? { ...item, qty: item.qty + delta } : item
        )
        .filter(item => item.qty > 0)
    );
  };

  const [ordering, setOrdering] = useState(false);

  const handleWhatsAppCheckout = async () => {
    if (cartItems.length === 0 || ordering) return;
    setOrdering(true);

    try {
      const res = await fetch(`http://localhost:3008/api/v1/storefront/${currentSlug}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map(i => ({
            productId: typeof i.id === "string" ? i.id : undefined,
            name: i.name,
            price: i.price,
            quantity: i.qty,
            isDigital: i.isDigital,
          })),
          deliveryArea,
          deliveryFee,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.whatsappUrl) {
          window.open(data.whatsappUrl, "_blank");
          setOrdering(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Could not create tracked order, falling back to direct WhatsApp", err);
    } finally {
      setOrdering(false);
    }

    // Fallback if offline
    const lines = cartItems
      .map(i => `• ${i.name} (Qty: ${i.qty}) - ${naira(i.price * i.qty)}`)
      .join("%0A");

    const msg = `Hello ${storeMeta.storeName}! 👋%0AI would like to order:%0A%0A${lines}%0A%0ASubtotal: ${naira(
      subtotal
    )}%0ADelivery (${deliveryArea}): ${naira(deliveryFee)}%0ATotal Amount: ${naira(
      total
    )}%0A%0APlease confirm my order. Thank you!`;

    const phoneDigits = storeMeta.phone?.replace(/\D/g, "") || "";
    const waUrl = phoneDigits
      ? `https://wa.me/${phoneDigits}?text=${msg}`
      : `https://wa.me/?text=${msg}`;

    window.open(waUrl, "_blank");
  };

  if (!loading && notFound) {
    return (
      <div className="store-simple-root" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 24, textAlign: "center" }}>
        <div style={{ maxWidth: 460, background: "#ffffff", padding: 40, borderRadius: 16, border: "1px solid var(--line)", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <ShoppingBag size={26} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px", color: "var(--ink)" }}>
            Store Not Found
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 14.5, margin: "0 0 24px" }}>
            The store <strong style={{ color: "var(--ink)" }}>&ldquo;{currentSlug}&rdquo;</strong> does not exist or has not activated their link yet.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <a href="/stores" className="btn-add-bag" style={{ textDecoration: "none" }}>
              Explore Active Stores
            </a>
            <a href="/" className="btn-chat-wa" style={{ textDecoration: "none" }}>
              Go Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  const handleMonnifyOnlineCheckout = async () => {
    if (cartItems.length === 0 || onlinePaying) return;
    setOnlinePaying(true);

    try {
      // 1. Create tracked retail order in DB
      const orderRes = await fetch(`http://localhost:3008/api/v1/storefront/${currentSlug}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map(i => ({
            productId: typeof i.id === "string" ? i.id : undefined,
            name: i.name,
            price: i.price,
            quantity: i.qty,
            isDigital: i.isDigital,
          })),
          deliveryArea,
          deliveryFee,
          paymentChannel: 'MONNIFY_ONLINE',
        }),
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await orderRes.json();

      // 2. Initialize Monnify transaction
      const payRes = await fetch('http://localhost:3008/api/v1/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: orderData.orderNumber,
        }),
      });

      const payData = await payRes.json();

      if (!payRes.ok || !payData.success) {
        throw new Error(payData.error || 'Payment initialization failed');
      }

      // Use the verified Monnify server checkout URL
      if (payData.checkoutUrl) {
        window.location.href = payData.checkoutUrl;
        return;
      }

      // Check if Monnify SDK is loaded as fallback
      const monnify = (window as any).MonnifySDK;
      if (monnify && payData.apiKey && payData.contractCode) {
        monnify.initialize({
          amount: orderData.totalAmount || total,
          currency: "NGN",
          reference: payData.paymentReference,
          customerName: "Store Customer",
          customerEmail: `order_${orderData.orderNumber.toLowerCase()}@qora.store`,
          apiKey: payData.apiKey,
          contractCode: payData.contractCode,
          paymentDescription: `Order #${orderData.orderNumber} at ${storeMeta.storeName}`,
          isTestMode: true,
          onComplete: function (response: any) {
            console.log("[Monnify SDK Success]:", response);
            setCart([]);
            setCartOpen(false);
            alert(`🎉 Payment Successful! Order #${orderData.orderNumber} is confirmed.`);
          },
          onClose: function () {
            console.log("[Monnify SDK Closed]");
          },
        });
        return;
      }
    } catch (err: any) {
      console.error('[Monnify Checkout Error]:', err);
      alert(err.message || 'Could not start online payment. Please try Direct Bank Transfer or WhatsApp checkout.');
    } finally {
      setOnlinePaying(false);
    }
  };

  const copyAccountNumber = () => {
    if (storeMeta.accountNumber) {
      navigator.clipboard.writeText(storeMeta.accountNumber);
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2000);
    }
  };

  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);

  const handleReceiptFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDirectTransferSubmit = async () => {
    if (cartItems.length === 0 || ordering) return;

    if (!receiptPreview) {
      setReceiptError("Please attach your transfer receipt or payment screenshot to continue.");
      return;
    }
    setReceiptError(null);
    setOrdering(true);

    try {
      const res = await fetch(`http://localhost:3008/api/v1/storefront/${currentSlug}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map(i => ({
            productId: typeof i.id === "string" ? i.id : undefined,
            name: i.name,
            price: i.price,
            quantity: i.qty,
            isDigital: i.isDigital,
          })),
          deliveryArea,
          deliveryFee,
          paymentChannel: 'DIRECT_BANK_TRANSFER',
          receiptImage: receiptPreview,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPaidDone(true);
        setTimeout(() => {
          setShowBankModal(false);
          setCart([]);
          setCartOpen(false);
          setPaidDone(false);
          setReceiptPreview(null);
          setReceiptError(null);
          if (data.whatsappUrl) {
            window.open(data.whatsappUrl, "_blank");
          }
        }, 1200);
        return;
      }
    } catch (err) {
      console.warn("Could not submit order with receipt", err);
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div className="store-simple-root">
      {/* MERCHANT STORE HEADER */}
      <header className="store-simple-nav">
        <div className="nav-simple-inner">
          <div className="store-brand-left">
            {storeMeta.logoUrl ? (
              <img
                src={storeMeta.logoUrl}
                alt={storeMeta.storeName}
                className="store-logo-img"
              />
            ) : null}
            <div className="store-brand-meta">
              <a href={`/store/${currentSlug}`} className="store-brand-name">
                {storeMeta.storeName}
              </a>
              <span className="store-location-tag">
                {storeMeta.location ? `📍 ${storeMeta.location} · ` : ""}{storeMeta.category || "Online Store"} · WhatsApp Verified
              </span>
            </div>
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
                  <span className="stock-info">{product.isDigital ? 'Digital Product' : (product.isUnlimitedStock ? 'In Stock' : `${product.stock} in stock`)}</span>
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
                    href={`https://wa.me/?text=Hi%20${encodeURIComponent(storeMeta.storeName)},%20I%20want%20to%20order%20${encodeURIComponent(
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
                  value={selectedZoneIndex}
                  onChange={e => setSelectedZoneIndex(Number(e.target.value))}
                >
                  {activeDeliveryZones.map((zone, idx) => (
                    <option key={idx} value={idx}>
                      {zone.area} ({zone.fee === 0 ? "Free" : naira(zone.fee)})
                    </option>
                  ))}
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

              {/* CHECKOUT ACTIONS */}
              <button
                type="button"
                className="btn-order-wa-primary"
                onClick={handleWhatsAppCheckout}
                disabled={ordering}
              >
                <MessageCircle size={17} /> {ordering ? "Connecting..." : "Send Order on WhatsApp"}
              </button>

              <button
                type="button"
                className="btn-bank-secondary"
                style={{ background: "#0c6b48", color: "#ffffff", border: "none" }}
                onClick={handleMonnifyOnlineCheckout}
                disabled={onlinePaying}
              >
                <CreditCard size={15} /> {onlinePaying ? "Opening Monnify..." : "Pay Online (Card / USSD / Monnify)"}
              </button>

              <button
                type="button"
                className="btn-bank-secondary"
                onClick={() => setShowBankModal(true)}
              >
                <CreditCard size={15} /> Direct Bank Transfer
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

      {/* DIRECT MERCHANT BANK PAYMENT MODAL */}
      {showBankModal && (
        <div className="modal-backdrop" onClick={() => setShowBankModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-box-header">
              <h3>Merchant Bank Account</h3>
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
                Please transfer <b>{naira(total)}</b> directly to <b>{storeMeta.storeName}</b>:
              </p>

              <div className="bank-details-card">
                <div className="detail-line">
                  <span>Bank</span>
                  <strong>{storeMeta.bankName || "Verified Nigerian Bank"}</strong>
                </div>
                <div className="detail-line">
                  <span>Account Number</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <strong className="font-mono" style={{ fontSize: 15 }}>{storeMeta.accountNumber || "Awaiting Setup"}</strong>
                    {storeMeta.accountNumber && (
                      <button
                        type="button"
                        onClick={copyAccountNumber}
                        style={{
                          background: "rgba(22, 163, 74, 0.1)",
                          color: "var(--emerald)",
                          border: "1px solid var(--emerald)",
                          borderRadius: 6,
                          padding: "3px 8px",
                          fontSize: 11.5,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {copiedBank ? "Copied!" : "Copy"}
                      </button>
                    )}
                  </div>
                </div>
                <div className="detail-line">
                  <span>Account Name</span>
                  <strong>{storeMeta.accountName || storeMeta.storeName}</strong>
                </div>
              </div>

              {/* RECEIPT UPLOAD BOX */}
              <div className="receipt-upload-section">
                <label className="receipt-label">
                  Attach Transfer Receipt / Screenshot <span style={{ color: "#ef4444", fontWeight: 700 }}>* (Required)</span>
                </label>
                {receiptPreview ? (
                  <div className="receipt-preview-wrap">
                    <img src={receiptPreview} alt="Receipt Preview" className="receipt-preview-img" />
                    <span style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 600 }}>Receipt Attached</span>
                    <button
                      type="button"
                      className="receipt-remove-btn"
                      onClick={() => setReceiptPreview(null)}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label
                    className="receipt-dropzone"
                    style={{
                      borderColor: receiptError ? "#ef4444" : undefined,
                      background: receiptError ? "rgba(239, 68, 68, 0.04)" : undefined,
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleReceiptFile}
                    />
                    <span className="receipt-dropzone-text" style={{ color: receiptError ? "#dc2626" : undefined, fontWeight: receiptError ? 600 : 400 }}>
                      📷 Tap to upload payment screenshot
                    </span>
                    <span className="receipt-dropzone-sub">PNG, JPG or JPEG from your bank app</span>
                  </label>
                )}
                {receiptError && (
                  <p style={{ color: "#ef4444", fontSize: 12, marginTop: 6, fontWeight: 500, margin: "6px 0 0" }}>
                    ⚠️ {receiptError}
                  </p>
                )}
              </div>

              {paidDone ? (
                <div className="payment-confirmed-banner">
                  <CheckCircle2 size={20} className="text-emerald" />
                  <div>
                    <strong>Order Submitted!</strong>
                    <p>Opening WhatsApp to send your order & receipt...</p>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="header-btn-add full-btn"
                  onClick={handleDirectTransferSubmit}
                  disabled={ordering}
                >
                  <Check size={16} /> {ordering ? "Submitting..." : `I Have Sent ${naira(total)}`}
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
            © 2026 {storeMeta.storeName} · Orders & Delivery fulfilled on WhatsApp
          </p>
        </div>  
      </footer>
    </div>
  );
}
