import { useState } from "react";
import { ArrowUpRight, Calendar, MessageCircle } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { WHATSAPP_BOT_URL } from "../../const";
import { OrderItem, salesDataWeek, categoryData } from "./mockData";

interface OverviewViewProps {
  orders: OrderItem[];
  storeName?: string;
  onNavigateToOrders: () => void;
}

type TimeframeKey = "today" | "yesterday" | "this_week" | "this_month" | "last_30_days";

function getDynamicGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
}

const timeframeData: Record<
  TimeframeKey,
  {
    dateLabel: string;
    revenue: string;
    revenueNote: string;
    orders: string;
    ordersNote: string;
    profit: string;
    profitNote: string;
    customers: string;
    customersNote: string;
    chartTotal: string;
  }
> = {
  today: {
    dateLabel: new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date()),
    revenue: "₦185,400",
    revenueNote: "+22% vs yesterday",
    orders: "32",
    ordersNote: "8 ready to pack",
    profit: "₦72,800",
    profitNote: "39.2% margin",
    customers: "18",
    customersNote: "6 first-time buyers",
    chartTotal: "₦185,400 Today",
  },
  yesterday: {
    dateLabel: "Yesterday Overview",
    revenue: "₦141,000",
    revenueNote: "Settled to GTBank",
    orders: "22",
    ordersNote: "100% fulfilled",
    profit: "₦55,400",
    profitNote: "39.3% margin",
    customers: "14",
    customersNote: "4 first-time buyers",
    chartTotal: "₦141,000 Yesterday",
  },
  this_week: {
    dateLabel: "This Week Summary",
    revenue: "₦951,400",
    revenueNote: "+18.2% vs last week",
    orders: "155",
    ordersNote: "Avg 22/day",
    profit: "₦380,000",
    profitNote: "39.9% margin",
    customers: "84",
    customersNote: "32 repeat buyers",
    chartTotal: "₦951,400 This Week",
  },
  this_month: {
    dateLabel: `${new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date())} Performance`,
    revenue: "₦2,840,500",
    revenueNote: "+34.5% vs July",
    orders: "428",
    ordersNote: "Avg 18/day",
    profit: "₦1,136,000",
    profitNote: "40.0% margin",
    customers: "210",
    customersNote: "78 repeat buyers",
    chartTotal: "₦2,840,500 This Month",
  },
  last_30_days: {
    dateLabel: "Rolling 30 Days",
    revenue: "₦3,410,000",
    revenueNote: "+31% month-over-month",
    orders: "512",
    ordersNote: "Avg 17/day",
    profit: "₦1,364,000",
    profitNote: "40.0% margin",
    customers: "265",
    customersNote: "94 repeat buyers",
    chartTotal: "₦3,410,000 (30 Days)",
  },
};

export default function OverviewView({
  orders,
  storeName = "Sultan",
  onNavigateToOrders,
}: OverviewViewProps) {
  const [timeframe, setTimeframe] = useState<TimeframeKey>("today");
  const current = timeframeData[timeframe];
  const greeting = getDynamicGreeting();

  return (
    <>
      {/* GREETING BANNER WITH TIMEFRAME SELECTOR */}
      <div className="dash-greeting-row">
        <div>
          <p className="eyebrow">{current.dateLabel}</p>
          <h1>{greeting}, {storeName}.</h1>
          <p className="greeting-desc">Your commerce activity at a glance.</p>
        </div>

        <div className="overview-header-actions">
          {/* Timeframe Dropdown */}
          <div className="reports-date-filter">
            <Calendar size={14} />
            <select
              value={timeframe}
              onChange={e => setTimeframe(e.target.value as TimeframeKey)}
              className="reports-select-pill"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month (August)</option>
              <option value="last_30_days">Last 30 Days</option>
            </select>
          </div>

          <a
            href={WHATSAPP_BOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bot-status-badge"
          >
            <MessageCircle size={16} />
            <span>WhatsApp Bot Active</span>
            <ArrowUpRight size={13} />
          </a>
        </div>
      </div>

      {/* 4 DYNAMIC METRIC TILES */}
      <div className="dash-tiles-row">
        <div className="metric-tile">
          <span className="tile-label">
            {timeframe === "today"
              ? "Today's Revenue"
              : timeframe === "yesterday"
              ? "Yesterday's Revenue"
              : timeframe === "this_week"
              ? "Weekly Revenue"
              : "Total Revenue"}
          </span>
          <strong className="tile-number">{current.revenue}</strong>
          <span className="tile-note positive">{current.revenueNote}</span>
        </div>

        <div className="metric-tile">
          <span className="tile-label">
            {timeframe === "today"
              ? "Orders Today"
              : timeframe === "yesterday"
              ? "Orders Yesterday"
              : "Total Orders"}
          </span>
          <strong className="tile-number">{current.orders}</strong>
          <span className="tile-note">{current.ordersNote}</span>
        </div>

        <div className="metric-tile">
          <span className="tile-label">Net Profit</span>
          <strong className="tile-number">{current.profit}</strong>
          <span className="tile-note positive">{current.profitNote}</span>
        </div>

        <div className="metric-tile">
          <span className="tile-label">Active Customers</span>
          <strong className="tile-number">{current.customers}</strong>
          <span className="tile-note">{current.customersNote}</span>
        </div>
      </div>

      {/* TWO COLUMN REVENUE & CATEGORY CHARTS */}
      <div className="analytics-layout-grid">
        <div className="dash-panel-card">
          <div className="panel-card-head">
            <div>
              <h2>Revenue Trend</h2>
              <p>Sales volume across storefront conversations.</p>
            </div>
            <div className="chart-revenue-badge">
              <strong>{current.chartTotal}</strong>
              <span>Confirmed on WhatsApp</span>
            </div>
          </div>

          <div className="chart-canvas-box">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart
                data={salesDataWeek}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revGradGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0c6b48" stopOpacity={0.24} />
                    <stop offset="100%" stopColor="#0c6b48" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="rgba(20,21,15,0.07)"
                  strokeDasharray="3 4"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6a6c5f", fontSize: 12, fontFamily: "DM Mono" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6a6c5f", fontSize: 11, fontFamily: "DM Mono" }}
                  tickFormatter={v => `₦${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "#14150f",
                    color: "#ffffff",
                    borderRadius: 10,
                    border: "none",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
                    fontSize: 12,
                    fontFamily: "DM Mono",
                  }}
                  formatter={value => [
                    `₦${Number(value).toLocaleString()}`,
                    "Revenue",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#0c6b48"
                  strokeWidth={2.8}
                  fill="url(#revGradGreen)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dash-panel-card">
          <div className="panel-card-head">
            <div>
              <h2>Product Category Sales</h2>
              <p>Top performing inventory verticals.</p>
            </div>
          </div>

          <div className="chart-canvas-box">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={categoryData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="rgba(20,21,15,0.07)"
                  strokeDasharray="3 4"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6a6c5f", fontSize: 11, fontFamily: "DM Mono" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6a6c5f", fontSize: 10, fontFamily: "DM Mono" }}
                  tickFormatter={v => `₦${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "#14150f",
                    color: "#ffffff",
                    borderRadius: 10,
                    border: "none",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
                    fontSize: 12,
                    fontFamily: "DM Mono",
                  }}
                  formatter={value => [
                    `₦${Number(value).toLocaleString()}`,
                    "Sales",
                  ]}
                />
                <Bar dataKey="revenue" fill="#0c6b48" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RECENT ORDERS */}
      <div className="dash-panel-card" style={{ marginTop: 24 }}>
        <div className="panel-card-head">
          <div>
            <h2>Recent Activity & Orders</h2>
            <p>Live sales incoming from WhatsApp conversations.</p>
          </div>
          <button
            type="button"
            className="header-btn-view"
            onClick={onNavigateToOrders}
          >
            View All Orders <ArrowUpRight size={13} />
          </button>
        </div>

        <div className="table-responsive">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 4).map(order => (
                <tr key={order.id}>
                  <td className="cell-id">
                    <strong>{order.id}</strong>
                  </td>
                  <td>{order.customer}</td>
                  <td>{order.items}</td>
                  <td className="cell-price">{order.amount}</td>
                  <td>
                    <span
                      className={`status-pill ${
                        order.payment === "Paid" ? "paid" : "pending"
                      }`}
                    >
                      {order.payment}
                    </span>
                  </td>
                  <td>
                    <span className="fulfillment-status">
                      <i
                        className={
                          order.payment === "Paid" ? "dot-paid" : "dot-pending"
                        }
                      />
                      {order.status}
                    </span>
                  </td>
                  <td>{order.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
