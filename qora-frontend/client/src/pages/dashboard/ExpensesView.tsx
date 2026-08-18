import { Plus } from "lucide-react";
import { ExpenseItem } from "./mockData";

interface ExpensesViewProps {
  expenses: ExpenseItem[];
}

export default function ExpensesView({ expenses }: ExpensesViewProps) {
  return (
    <div className="dash-view-wrapper">
      {/* Page Header */}
      <div className="dash-page-intro-split">
        <div>
          <p className="eyebrow">Cost Tracking</p>
          <h1>Expenses</h1>
          <p className="intro-desc">
            Log delivery logistics, packaging, and operating expenditures.
          </p>
        </div>
        <button
          type="button"
          className="header-btn-add"
          onClick={() => alert("Expense logged!")}
        >
          <Plus size={15} /> Log Expense
        </button>
      </div>

      <div className="dash-panel-card">
        <div className="table-responsive">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(exp => (
                <tr key={exp.id}>
                  <td>
                    <strong>{exp.desc}</strong>
                  </td>
                  <td>{exp.category}</td>
                  <td>{exp.date}</td>
                  <td className="cell-price">{exp.amount}</td>
                  <td>
                    <span className="status-pill paid">{exp.status}</span>
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
