import { Plus } from "lucide-react";
import { InvoiceItem } from "./mockData";

interface InvoicesViewProps {
  invoices: InvoiceItem[];
}

export default function InvoicesView({ invoices }: InvoicesViewProps) {
  return (
    <div className="dash-view-wrapper">
      {/* Page Header */}
      <div className="dash-page-intro-split">
        <div>
          <p className="eyebrow">Billing & Receipts</p>
          <h1>Invoices</h1>
          <p className="intro-desc">
            Generate and share branded customer invoices and payment receipts.
          </p>
        </div>
        <button
          type="button"
          className="header-btn-add"
          onClick={() => alert("New invoice drafted!")}
        >
          <Plus size={15} /> Create Invoice
        </button>
      </div>

      <div className="dash-panel-card">
        <div className="table-responsive">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Invoice No.</th>
                <th>Billed To</th>
                <th>Description</th>
                <th>Date</th>
                <th>Total Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td className="cell-id">
                    <strong>{inv.id}</strong>
                  </td>
                  <td>{inv.client}</td>
                  <td>{inv.desc}</td>
                  <td>{inv.date}</td>
                  <td className="cell-price">{inv.amount}</td>
                  <td>
                    <span
                      className={`status-pill ${
                        inv.status === "Paid" ? "paid" : "pending"
                      }`}
                    >
                      {inv.status}
                    </span>
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
