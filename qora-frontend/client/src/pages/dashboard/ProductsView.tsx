import { Plus } from "lucide-react";
import { ProductItem } from "./mockData";

interface ProductsViewProps {
  products: ProductItem[];
  onOpenAddModal: () => void;
}

export default function ProductsView({
  products,
  onOpenAddModal,
}: ProductsViewProps) {
  return (
    <div className="dash-view-wrapper">
      {/* Page Header */}
      <div className="dash-page-intro-split">
        <div>
          <p className="eyebrow">Catalog Management</p>
          <h1>Products</h1>
          <p className="intro-desc">
            Manage your storefront inventory, pricing, and active WhatsApp catalog items.
          </p>
        </div>
        <button
          type="button"
          className="header-btn-add"
          onClick={onOpenAddModal}
        >
          <Plus size={15} /> Add New Product
        </button>
      </div>

      <div className="dash-panel-card">
        <div className="table-responsive">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock Quantity</th>
                <th>Total Sold</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map(prod => (
                <tr key={prod.id}>
                  <td>
                    <strong>{prod.name}</strong>
                  </td>
                  <td>{prod.category}</td>
                  <td className="cell-price">{prod.price}</td>
                  <td>
                    <span className="stock-badge">
                      {prod.stock} units
                      {prod.stock <= 5 && <b className="low-pill">Low</b>}
                    </span>
                  </td>
                  <td>{prod.sales} sold</td>
                  <td>
                    <span
                      className={`status-pill ${
                        prod.stock > 0 ? "paid" : "pending"
                      }`}
                    >
                      {prod.status}
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
