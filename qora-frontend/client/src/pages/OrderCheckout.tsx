import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { ShoppingBag, CheckCircle2, CreditCard, Copy, Check, UploadCloud, AlertCircle } from "lucide-react";
import "../styles/storefront.css";

interface OrderData {
  id: string;
  orderNumber: string;
  customerName?: string;
  customerPhone?: string;
  deliveryArea?: string;
  deliveryFee: number;
  itemsTotal: number;
  totalAmount: number;
  status: "PENDING_WHATSAPP" | "PENDING_PAYMENT" | "PENDING_VERIFICATION" | "PAID" | "CANCELLED";
  paymentChannel?: string;
  receiptUrl?: string;
  paidAt?: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    isDigital?: boolean;
    digitalFileUrl?: string;
  }[];
  merchant: {
    id: string;
    storeName: string;
    slug: string;
    logoUrl?: string;
    phone?: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    currencySymbol?: string;
  };
}

const naira = (n: number) => `₦${n.toLocaleString()}`;

export default function OrderCheckout() {
  const params = useParams<{ orderNumber: string }>();
  const orderNumber = params.orderNumber || "";

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlinePaying, setOnlinePaying] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [submittingReceipt, setSubmittingReceipt] = useState(false);
  const [submittedReceipt, setSubmittedReceipt] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`http://localhost:3008/api/v1/payments/order/${orderNumber}`);
        if (!res.ok) {
          throw new Error("Order not found or invalid link.");
        }
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
        } else {
          setError("Could not load order details.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load order.");
      } finally {
        setLoading(false);
      }
    }

    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  const handleMonnifyPayment = async () => {
    if (!order || onlinePaying) return;
    setOnlinePaying(true);

    try {
      const payRes = await fetch("http://localhost:3008/api/v1/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: order.orderNumber,
        }),
      });

      const payData = await payRes.json();
      if (!payRes.ok || !payData.success) {
        throw new Error(payData.error || "Payment initialization failed.");
      }

      if (payData.checkoutUrl) {
        window.location.href = payData.checkoutUrl;
        return;
      }
    } catch (err: any) {
      console.error("[Paylink Error]:", err);
      alert(err.message || "Could not start online payment. Please use direct transfer.");
    } finally {
      setOnlinePaying(false);
    }
  };

  const copyBank = () => {
    if (order?.merchant?.accountNumber) {
      navigator.clipboard.writeText(order.merchant.accountNumber);
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2000);
    }
  };

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

  const handleReceiptSubmit = async () => {
    if (!receiptPreview) {
      setReceiptError("Please attach your payment screenshot to proceed.");
      return;
    }
    setSubmittingReceipt(true);

    try {
      const res = await fetch(`http://localhost:3008/api/v1/storefront/${order?.merchant?.slug}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: order?.items,
          deliveryArea: order?.deliveryArea,
          deliveryFee: order?.deliveryFee,
          customerName: order?.customerName,
          customerPhone: order?.customerPhone,
          receiptImage: receiptPreview,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSubmittedReceipt(true);
        if (data.whatsappUrl) {
          setTimeout(() => {
            window.open(data.whatsappUrl, "_blank");
          }, 1000);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReceipt(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ textAlign: "center" }}>
          <div className="store-loading-spinner" />
          <p style={{ marginTop: 16, color: "var(--ink-soft)", fontWeight: 500 }}>Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: 20 }}>
        <div style={{ maxWidth: 420, width: "100%", background: "#ffffff", padding: 32, borderRadius: 16, textAlign: "center", border: "1px solid var(--line)" }}>
          <AlertCircle size={40} style={{ color: "#ef4444", margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>Order Link Expired or Not Found</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: "0 0 20px" }}>{error || "We could not find this order."}</p>
          <a href="/" className="btn-add-bag" style={{ display: "inline-block" }}>
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  const isPaid = order.status === "PAID";
  const sym = order.merchant.currencySymbol || "₦";

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "40px 16px 80px" }}>
      <div style={{ maxWidth: 500, margin: "0 auto" }}>
        {/* MERCHANT HEADER */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, background: "#ffffff", padding: "16px 20px", borderRadius: 16, border: "1px solid var(--line)" }}>
          {order.merchant.logoUrl ? (
            <img src={order.merchant.logoUrl} alt={order.merchant.storeName} style={{ width: 46, height: 46, borderRadius: "50%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: 46, height: 46, borderRadius: "50%", background: "var(--emerald)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18 }}>
              {order.merchant.storeName.charAt(0)}
            </div>
          )}
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>{order.merchant.storeName}</h2>
            <span style={{ fontSize: 12, color: "var(--emerald)", fontWeight: 600 }}>WhatsApp Verified Store</span>
          </div>
        </div>

        {/* ORDER SUMMARY CARD */}
        <div style={{ background: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid var(--line)", marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 14, borderBottom: "1px solid var(--line)", marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>Order Reference</span>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>#{order.orderNumber}</h3>
            </div>

            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 20,
                background: isPaid ? "rgba(22, 163, 74, 0.1)" : "rgba(245, 158, 11, 0.1)",
                color: isPaid ? "#16a34a" : "#d97706",
              }}
            >
              {isPaid ? "PAID" : "AWAITING PAYMENT"}
            </span>
          </div>

          {/* CUSTOMER NAME */}
          {order.customerName && (
            <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "0 0 16px" }}>
              Customer: <strong>{order.customerName}</strong>
            </p>
          )}

          {/* ITEMS LIST */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
            {order.items.map((item, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14 }}>
                <span style={{ color: "var(--ink)" }}>
                  <strong>{item.quantity}x</strong> {item.name}
                </span>
                <strong style={{ color: "var(--ink)" }}>{naira(item.totalPrice)}</strong>
              </div>
            ))}
          </div>

          {/* BILLING BREAKDOWN */}
          <div style={{ borderTop: "1px dashed var(--line)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 8, fontSize: 13.5 }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)" }}>
              <span>Items Total</span>
              <span>{naira(order.itemsTotal)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)" }}>
                <span>Delivery ({order.deliveryArea || "Standard"})</span>
                <span>{naira(order.deliveryFee)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 18, fontWeight: 800, color: "var(--ink)", borderTop: "1.5px solid var(--line)", paddingTop: 12, marginTop: 4 }}>
              <span>Total Amount</span>
              <span style={{ color: "var(--emerald)" }}>{naira(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* PAYMENT ACTIONS */}
        {isPaid ? (
          <div style={{ background: "rgba(22, 163, 74, 0.08)", border: "1.5px solid #16a34a", borderRadius: 16, padding: 24, textAlign: "center" }}>
            <CheckCircle2 size={44} style={{ color: "#16a34a", margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)", margin: "0 0 6px" }}>Payment Received!</h3>
            <p style={{ fontSize: 13.5, color: "var(--ink-soft)", margin: "0 0 16px" }}>
              {naira(order.totalAmount)} received. {order.merchant.storeName} has been notified and your order is being fulfilled.
            </p>
            <a
              href={`https://wa.me/${order.merchant.phone?.replace(/\D/g, "") || ""}?text=Hello%20${encodeURIComponent(order.merchant.storeName)},%20I%20have%20completed%20payment%20for%20Order%20%23${order.orderNumber}.`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                background: "#25D366",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 14,
                padding: "10px 20px",
                borderRadius: 10,
                textDecoration: "none",
              }}
            >
              Message Merchant on WhatsApp
            </a>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* OPTION 1: PAY ONLINE VIA MONNIFY */}
            <button
              type="button"
              onClick={handleMonnifyPayment}
              disabled={onlinePaying}
              style={{
                width: "100%",
                background: "#0c6b48",
                color: "#ffffff",
                border: "none",
                borderRadius: 12,
                padding: "16px 20px",
                fontSize: 15,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(12, 107, 72, 0.2)",
              }}
            >
              <CreditCard size={18} /> {onlinePaying ? "Opening Checkout..." : `Pay ${naira(order.totalAmount)} Online (Card / USSD)`}
            </button>

            {/* OPTION 2: DIRECT BANK TRANSFER */}
            <div style={{ background: "#ffffff", borderRadius: 16, padding: 20, border: "1px solid var(--line)" }}>
              <h4 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>Or Transfer Directly to Merchant Bank:</h4>
              
              <div className="bank-details-card" style={{ marginBottom: 14 }}>
                <div className="detail-line">
                  <span>Bank</span>
                  <strong>{order.merchant.bankName || "Verified Nigerian Bank"}</strong>
                </div>
                <div className="detail-line">
                  <span>Account Number</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <strong className="font-mono" style={{ fontSize: 15 }}>{order.merchant.accountNumber || "0123456789"}</strong>
                    {order.merchant.accountNumber && (
                      <button
                        type="button"
                        onClick={copyBank}
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
                  <strong>{order.merchant.accountName || order.merchant.storeName}</strong>
                </div>
              </div>

              {/* RECEIPT UPLOAD */}
              <div className="receipt-upload-section" style={{ marginBottom: 14 }}>
                <label className="receipt-label">
                  Attach Transfer Receipt <span style={{ color: "#ef4444", fontWeight: 700 }}>* (Required for transfer)</span>
                </label>
                {receiptPreview ? (
                  <div className="receipt-preview-wrap">
                    <img src={receiptPreview} alt="Receipt" className="receipt-preview-img" />
                    <span style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 600 }}>Receipt Attached</span>
                    <button type="button" className="receipt-remove-btn" onClick={() => setReceiptPreview(null)}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="receipt-dropzone" style={{ borderColor: receiptError ? "#ef4444" : undefined }}>
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleReceiptFile} />
                    <span className="receipt-dropzone-text" style={{ color: receiptError ? "#dc2626" : undefined }}>
                      📷 Tap to upload payment screenshot
                    </span>
                  </label>
                )}
                {receiptError && <p style={{ color: "#ef4444", fontSize: 12, margin: "6px 0 0" }}>⚠️ {receiptError}</p>}
              </div>

              {submittedReceipt ? (
                <div className="payment-confirmed-banner">
                  <CheckCircle2 size={18} className="text-emerald" />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Receipt submitted! Opening WhatsApp...</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleReceiptSubmit}
                  disabled={submittingReceipt}
                  style={{
                    width: "100%",
                    background: "var(--ink)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 10,
                    padding: "12px",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Check size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
                  {submittingReceipt ? "Submitting Receipt..." : `I Have Transferred ${naira(order.totalAmount)}`}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
