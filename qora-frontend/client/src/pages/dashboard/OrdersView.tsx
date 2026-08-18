import { MessageCircle } from "lucide-react";
import { OrderItem } from "./mockData";

interface OrdersViewProps {
  orders: OrderItem[];
  storeName: string;
}

export default function OrdersView({ orders, storeName }: OrdersViewProps) {
  return (
    <div className="dash-view-wrapper">
      {/* Page Header */}
      <div className="dash-page-intro">
        <p className="eyebrow">Commerce Operations</p>
        <h1>Orders & Sales</h1>
        <p className="intro-desc">
          Track incoming customer orders, verified bank payments, and send 1-click delivery updates directly via WhatsApp.
        </p>
      </div>

      <div className="dash-panel-card">
        <div className="table-responsive">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items Ordered</th>
                <th>Total Amount</th>
                <th>Payment & Method</th>
                <th>Fulfillment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td className="cell-id">
                    <strong>{order.id}</strong>
                    <small>{order.time}</small>
                  </td>
                  <td>
                    <strong>{order.customer}</strong>
                    <small className="sub-phone">{order.phone}</small>
                  </td>
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
                    <small className="sub-phone">
                      {order.payment === "Paid"
                        ? "Bank Transfer · Settled"
                        : "Awaiting Transfer"}
                    </small>
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
                  <td>
                    <a
                      href={`https://wa.me/?text=Hi%20${encodeURIComponent(
                        order.customer
                      )},%20your%20order%20${order.id}%20from%20${encodeURIComponent(
                        storeName
                      )}%20is%20ready!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-whatsapp-action"
                    >
                      <MessageCircle size={13} /> Update on WhatsApp
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
