/**
 * Qora — Merchant Dashboard Master Container
 * Clean, lightweight orchestrator rendering dedicated view components per tab:
 * - OverviewView (Greeting + Metrics + Charts + Recent activity)
 * - OrdersView
 * - ProductsView
 * - InventoryView
 * - CustomersView
 * - PaymentsView
 * - ExpensesView
 * - AnalyticsView
 * - InvoicesView
 * - WalletView
 * - SettingsView
 */
import { useState } from "react";
import {
  Check,
  Copy,
  CreditCard,
  ExternalLink,
  Eye,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  Plus,
  ReceiptText,
  Search,
  Settings,
  ShoppingBag,
  Store,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { WHATSAPP_BOT_URL } from "../const";
import {
  initialOrders,
  initialProducts,
  initialCustomers,
  initialExpenses,
  initialInvoices,
  ProductItem,
} from "./dashboard/mockData";

// Modular View Components
import OverviewView from "./dashboard/OverviewView";
import OrdersView from "./dashboard/OrdersView";
import ProductsView from "./dashboard/ProductsView";
import InventoryView from "./dashboard/InventoryView";
import CustomersView from "./dashboard/CustomersView";
import ExpensesView from "./dashboard/ExpensesView";
import InvoicesView from "./dashboard/InvoicesView";
import ReportsView from "./dashboard/ReportsView";
import WalletView from "./dashboard/WalletView";
import SettingsView from "./dashboard/SettingsView";
import AddProductModal from "./dashboard/AddProductModal";

// Standalone Qora Logo (No enclosing green box)
function QoraLogo() {
  return (
    <a href="/" className="logo">
      <span className="logo-mark">Q</span>
      <span className="logo-name">ora</span>
    </a>
  );
}

const menuItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Orders", icon: ShoppingBag, count: "8" },
  { label: "Products", icon: Package },
  { label: "Inventory", icon: Store },
  { label: "Customers", icon: Users },
  { label: "Expenses", icon: ReceiptText },
  { label: "Invoices", icon: FileText },
  { label: "Reports", icon: FileText },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [orders] = useState(initialOrders);
  const [products, setProducts] = useState(initialProducts);
  const [customers] = useState(initialCustomers);
  const [expenses] = useState(initialExpenses);
  const [invoices] = useState(initialInvoices);
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // New product state
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newCategory, setNewCategory] = useState("Apparel");

  // Settings state
  const [storeName, setStoreName] = useState("Sultan Store");
  const [botNumber, setBotNumber] = useState("+234 800 000 0000");
  const [bankName, setBankName] = useState("GTBank");
  const [accountNumber, setAccountNumber] = useState("0123456789");
  const [savedSettings, setSavedSettings] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://qora.store/sultan");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice) return;
    const newProd: ProductItem = {
      id: String(products.length + 1),
      name: newName,
      category: newCategory,
      price: `₦${Number(newPrice.replace(/[^0-9]/g, "")).toLocaleString()}`,
      stock: Number(newStock) || 10,
      sales: 0,
      status: "In Stock",
    };
    setProducts([newProd, ...products]);
    setShowAddProductModal(false);
    setNewName("");
    setNewPrice("");
    setNewStock("");
    alert(`"${newName}" listed and published to WhatsApp storefront!`);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2500);
  };

  const filteredOrders = orders.filter(
    o =>
      o.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.items.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dash-layout">
      <div className="dash-bg-ambient" aria-hidden="true" />

      {/* LEFT SIDEBAR */}
      <aside className={`dash-clean-sidebar ${menuOpen ? "open" : ""}`}>
        {/* Brand */}
        <div className="sidebar-top">
          <QoraLogo />
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Store Identifier Pill */}
        <div className="sidebar-store-pill">
          <div className="store-avatar-circle">S</div>
          <div className="store-info-text">
            <strong>{storeName}</strong>
            <a
              href="/store/sultan"
              target="_blank"
              rel="noopener noreferrer"
              className="store-external-link"
            >
              qora.store/sultan <ExternalLink size={10} />
            </a>
          </div>
          <span className="live-dot" title="WhatsApp Bot Connected" />
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          <span className="nav-heading">WORKSPACE</span>

          {menuItems.map(item => {
            const Icon = item.icon;
            const isSelected = activeTab === item.label;
            return (
              <button
                key={item.label}
                type="button"
                className={`sidebar-nav-btn ${isSelected ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(item.label);
                  setMenuOpen(false);
                }}
              >
                <Icon size={17} />
                <span>{item.label}</span>
                {item.count && <span className="badge">{item.count}</span>}
              </button>
            );
          })}

          <span className="nav-heading" style={{ marginTop: 20 }}>
            MANAGE
          </span>

          <button
            type="button"
            className={`sidebar-nav-btn ${activeTab === "Wallet" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("Wallet");
              setMenuOpen(false);
            }}
          >
            <Wallet size={17} />
            <span>Wallet</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-btn ${activeTab === "Settings" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("Settings");
              setMenuOpen(false);
            }}
          >
            <Settings size={17} />
            <span>Settings</span>
          </button>

          <span className="nav-heading" style={{ marginTop: 20 }}>
            INTEGRATIONS
          </span>

          <a
            href={WHATSAPP_BOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-nav-btn whatsapp-bot-btn"
          >
            <MessageCircle size={17} className="text-whatsapp" />
            <span>WhatsApp Bot</span>
            <span className="bot-active-pill">Connected</span>
          </a>
        </nav>

        {/* User Card */}
        <div className="sidebar-user-card">
          <div className="user-initial">SA</div>
          <div className="user-text">
            <strong>Sultan Adewale</strong>
            <small>Merchant Owner</small>
          </div>
          <a href="/login" className="user-logout-btn" title="Sign out">
            <LogOut size={14} />
          </a>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <div className="dash-main-area">
        {/* TOPBAR */}
        <header className="dash-top-header">
          <div className="header-left">
            <button
              type="button"
              className="dash-menu-toggle"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <div className="header-crumb">
              <span className="crumb-sub">Sultan Store</span>
              <span className="crumb-divider">/</span>
              <strong className="crumb-curr">{activeTab}</strong>
            </div>
          </div>

          <div className="header-right">
            <div className="header-search">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              type="button"
              className={`header-btn-share ${copiedLink ? "copied" : ""}`}
              onClick={handleCopyLink}
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedLink ? "Copied!" : "Copy Store Link"}</span>
            </button>

            <a
              href="/store/sultan"
              target="_blank"
              rel="noopener noreferrer"
              className="header-btn-view"
            >
              <Eye size={14} /> View Storefront
            </a>
          </div>
        </header>

        {/* WORKSPACE CONTENT BODY */}
        <div className="dash-workspace-body">
          {/* DEDICATED MODULAR VIEWS (Greeting & metrics are inside Overview only) */}
          {activeTab === "Overview" && (
            <OverviewView
              orders={orders}
              storeName={storeName}
              onNavigateToOrders={() => setActiveTab("Orders")}
            />
          )}

          {activeTab === "Orders" && (
            <OrdersView orders={filteredOrders} storeName={storeName} />
          )}

          {activeTab === "Products" && (
            <ProductsView
              products={products}
              onOpenAddModal={() => setShowAddProductModal(true)}
            />
          )}

          {activeTab === "Inventory" && (
            <InventoryView products={products} />
          )}

          {activeTab === "Customers" && (
            <CustomersView customers={customers} storeName={storeName} />
          )}

          {activeTab === "Expenses" && (
            <ExpensesView expenses={expenses} />
          )}

          {activeTab === "Invoices" && (
            <InvoicesView invoices={invoices} />
          )}

          {activeTab === "Reports" && (
            <ReportsView
              orders={orders}
              products={products}
              customers={customers}
              expenses={expenses}
            />
          )}

          {activeTab === "Wallet" && <WalletView />}

          {activeTab === "Settings" && (
            <SettingsView
              storeName={storeName}
              setStoreName={setStoreName}
              botNumber={botNumber}
              setBotNumber={setBotNumber}
              bankName={bankName}
              setBankName={setBankName}
              accountNumber={accountNumber}
              setAccountNumber={setAccountNumber}
              savedSettings={savedSettings}
              onSaveSettings={handleSaveSettings}
            />
          )}
        </div>
      </div>

      {/* QUICK ADD PRODUCT MODAL */}
      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onAddProduct={handleAddProduct}
        newName={newName}
        setNewName={setNewName}
        newPrice={newPrice}
        setNewPrice={setNewPrice}
        newStock={newStock}
        setNewStock={setNewStock}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
      />
    </div>
  );
}
