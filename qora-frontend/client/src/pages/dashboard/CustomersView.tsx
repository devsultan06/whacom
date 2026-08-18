import { MessageCircle } from "lucide-react";
import { CustomerItem } from "./mockData";

interface CustomersViewProps {
  customers: CustomerItem[];
  storeName: string;
}

export default function CustomersView({
  customers,
  storeName,
}: CustomersViewProps) {
  return (
    <div className="dash-view-wrapper">
      {/* Page Header */}
      <div className="dash-page-intro">
        <p className="eyebrow">Buyer Relationships</p>
        <h1>Customers</h1>
        <p className="intro-desc">
          Directory of verified WhatsApp buyers, lifetime purchase values, and direct messaging.
        </p>
      </div>

      <div className="dash-panel-card">
        <div className="table-responsive">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>WhatsApp Contact</th>
                <th>Location</th>
                <th>Total Orders</th>
                <th>Lifetime Spent</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(cust => (
                <tr key={cust.id}>
                  <td>
                    <strong>{cust.name}</strong>
                    <small className="sub-phone">Last order: {cust.lastOrder}</small>
                  </td>
                  <td>{cust.phone}</td>
                  <td>{cust.city}</td>
                  <td>{cust.orders} orders</td>
                  <td className="cell-price">{cust.spent}</td>
                  <td>
                    <a
                      href={`https://wa.me/?text=Hi%20${encodeURIComponent(
                        cust.name
                      )},%20thank%20you%20for%20shopping%20with%20us%20at%20${encodeURIComponent(
                        storeName
                      )}!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-whatsapp-action"
                    >
                      <MessageCircle size={13} /> Chat
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
