import { ProductItem } from "./mockData";

interface InventoryViewProps {
  products: ProductItem[];
}

export default function InventoryView({ products }: InventoryViewProps) {
  return (
    <div className="dash-view-wrapper">
      {/* Page Header */}
      <div className="dash-page-intro">
        <p className="eyebrow">Stock Control</p>
        <h1>Inventory</h1>
        <p className="intro-desc">
          Monitor stock depletion levels, warehouse counts, and trigger fast restocks.
        </p>
      </div>

      <div className="dash-panel-card">
        <div className="table-responsive">
          <table className="clean-table">
            <thead>
              <tr>
                <th>SKU / Item</th>
                <th>Category</th>
                <th>Remaining Stock</th>
                <th>Reorder Level</th>
                <th>Unit Value</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map(prod => (
                <tr key={prod.id}>
                  <td>
                    <strong>{prod.name}</strong>
                    <small className="sub-phone">SKU-00{prod.id}</small>
                  </td>
                  <td>{prod.category}</td>
                  <td>
                    <span className="stock-badge">
                      {prod.stock} units
                      {prod.stock <= 5 && <b className="low-pill">Restock</b>}
                    </span>
                  </td>
                  <td>10 units</td>
                  <td className="cell-price">{prod.price}</td>
                  <td>
                    <button
                      type="button"
                      className="header-btn-view"
                      onClick={() =>
                        alert(`Restocked +20 units for "${prod.name}"!`)
                      }
                    >
                      + Add Stock
                    </button>
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
