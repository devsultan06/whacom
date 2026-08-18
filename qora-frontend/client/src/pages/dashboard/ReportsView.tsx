/**
 * Reports & Data Exports View
 * Provides instant one-click CSV / Excel spreadsheet exports for:
 * - Orders & Sales Ledger
 * - Customer & Buyer Directory
 * - Product Inventory & Stock Valuation
 * - Financial Settlements & Bank Payouts
 */
import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  ShoppingBag,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  OrderItem,
  ProductItem,
  CustomerItem,
  ExpenseItem,
} from "./mockData";

interface ReportsViewProps {
  orders: OrderItem[];
  products: ProductItem[];
  customers: CustomerItem[];
  expenses: ExpenseItem[];
}

export default function ReportsView({
  orders,
  products,
  customers,
  expenses,
}: ReportsViewProps) {
  const [dateRange, setDateRange] = useState("This Month (August 2026)");
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Helper to trigger real CSV download
  const triggerCsvDownload = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(filename);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // 1. Export Orders CSV
  const handleExportOrders = () => {
    const headers = ["Order ID", "Customer Name", "Phone", "Items Ordered", "Total Amount", "Payment Status", "Fulfillment Status", "Time"];
    const rows = orders.map(o => [
      o.id,
      o.customer,
      o.phone,
      o.items,
      o.amount,
      o.payment,
      o.status,
      o.time,
    ]);
    triggerCsvDownload("qora_orders_report", headers, rows);
  };

  // 2. Export Customers CSV
  const handleExportCustomers = () => {
    const headers = ["Customer ID", "Full Name", "WhatsApp Phone", "Delivery Location", "Total Orders", "Lifetime Spent (NGN)", "Last Order Date"];
    const rows = customers.map(c => [
      c.id,
      c.name,
      c.phone,
      c.city,
      c.orders,
      c.spent,
      c.lastOrder,
    ]);
    triggerCsvDownload("qora_customers_directory", headers, rows);
  };

  // 3. Export Inventory CSV
  const handleExportInventory = () => {
    const headers = ["Item ID", "Product Name", "Category", "Price", "Remaining Stock", "Total Units Sold", "Stock Status"];
    const rows = products.map(p => [
      p.id,
      p.name,
      p.category,
      p.price,
      p.stock,
      p.sales,
      p.status,
    ]);
    triggerCsvDownload("qora_inventory_stock_report", headers, rows);
  };

  // 4. Export Financial / Expenses CSV
  const handleExportExpenses = () => {
    const headers = ["Expense ID", "Description", "Category", "Amount", "Date", "Settlement Status"];
    const rows = expenses.map(e => [
      e.id,
      e.desc,
      e.category,
      e.amount,
      e.date,
      e.status,
    ]);
    triggerCsvDownload("qora_expenses_financial_report", headers, rows);
  };

  return (
    <div className="dash-view-wrapper">
      {/* Page Header */}
      <div className="dash-page-intro-split">
        <div>
          <p className="eyebrow">Data & Analytics Exports</p>
          <h1>Reports & Exports</h1>
          <p className="intro-desc">
            Download real Excel & CSV spreadsheets of your orders, customer directory, inventory valuation, and sales data.
          </p>
        </div>

        {/* Date Filter */}
        <div className="reports-date-filter">
          <Calendar size={15} />
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="reports-select-pill"
          >
            <option value="This Week">This Week</option>
            <option value="This Month (August 2026)">This Month (August 2026)</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="All Time">All Time</option>
          </select>
        </div>
      </div>

      {/* Success Notification */}
      {downloadSuccess && (
        <div className="download-toast-banner">
          <CheckCircle2 size={18} className="text-emerald" />
          <span>
            <b>Spreadsheet exported!</b> Downloaded <code>{downloadSuccess}.csv</code> to your device.
          </span>
        </div>
      )}

      {/* 4 EXPORT CARDS GRID */}
      <div className="reports-cards-grid">
        {/* Card 1: Orders & Sales */}
        <div className="dash-panel-card report-card">
          <div className="report-card-top">
            <div className="report-icon-circle emerald">
              <ShoppingBag size={20} />
            </div>
            <span className="report-badge">CSV / Excel</span>
          </div>

          <div className="report-card-info">
            <h3>Customer Orders & Sales Ledger</h3>
            <p>
              Complete list of all customer orders, item descriptions, transaction amounts, payment verification status, and timestamps.
            </p>
            <div className="report-meta-stats">
              <span><b>{orders.length}</b> total orders recorded</span>
              <span>•</span>
              <span><b>₦185,400</b> sales today</span>
            </div>
          </div>

          <button
            type="button"
            className="report-download-btn"
            onClick={handleExportOrders}
          >
            <Download size={15} /> Download Orders (.CSV)
          </button>
        </div>

        {/* Card 2: Customers & Buyer List */}
        <div className="dash-panel-card report-card">
          <div className="report-card-top">
            <div className="report-icon-circle ink">
              <Users size={20} />
            </div>
            <span className="report-badge">CSV / Excel</span>
          </div>

          <div className="report-card-info">
            <h3>Customer & Buyer Directory</h3>
            <p>
              Verified customer contact database with WhatsApp phone numbers, delivery cities (Lagos, Abuja, PH), total order counts, and lifetime value.
            </p>
            <div className="report-meta-stats">
              <span><b>{customers.length}</b> registered buyers</span>
              <span>•</span>
              <span>100% WhatsApp verified</span>
            </div>
          </div>

          <button
            type="button"
            className="report-download-btn"
            onClick={handleExportCustomers}
          >
            <Download size={15} /> Download Customers (.CSV)
          </button>
        </div>

        {/* Card 3: Inventory & Products */}
        <div className="dash-panel-card report-card">
          <div className="report-card-top">
            <div className="report-icon-circle amber">
              <Store size={20} />
            </div>
            <span className="report-badge">CSV / Excel</span>
          </div>

          <div className="report-card-info">
            <h3>Inventory & Stock Valuation</h3>
            <p>
              Live product stock levels, categories, unit prices, total units sold to date, and reorder alerts for low-stock items.
            </p>
            <div className="report-meta-stats">
              <span><b>{products.length}</b> active SKUs</span>
              <span>•</span>
              <span><b>109</b> units in warehouse</span>
            </div>
          </div>

          <button
            type="button"
            className="report-download-btn"
            onClick={handleExportInventory}
          >
            <Download size={15} /> Download Inventory (.CSV)
          </button>
        </div>

        {/* Card 4: Financial & Expenses */}
        <div className="dash-panel-card report-card">
          <div className="report-card-top">
            <div className="report-icon-circle emerald">
              <FileSpreadsheet size={20} />
            </div>
            <span className="report-badge">CSV / Excel</span>
          </div>

          <div className="report-card-info">
            <h3>Financial Expenses & Operations</h3>
            <p>
              Detailed breakdown of delivery dispatch costs, packaging suppliers, software hosting fees, and net profit deductions.
            </p>
            <div className="report-meta-stats">
              <span><b>{expenses.length}</b> expense records</span>
              <span>•</span>
              <span>Reconciled for {dateRange}</span>
            </div>
          </div>

          <button
            type="button"
            className="report-download-btn"
            onClick={handleExportExpenses}
          >
            <Download size={15} /> Download Expenses (.CSV)
          </button>
        </div>
      </div>
    </div>
  );
}
