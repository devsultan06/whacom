import { X } from "lucide-react";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (e: React.FormEvent) => void;
  newName: string;
  setNewName: (val: string) => void;
  newPrice: string;
  setNewPrice: (val: string) => void;
  newStock: string;
  setNewStock: (val: string) => void;
  newCategory: string;
  setNewCategory: (val: string) => void;
}

export default function AddProductModal({
  isOpen,
  onClose,
  onAddProduct,
  newName,
  setNewName,
  newPrice,
  setNewPrice,
  newStock,
  setNewStock,
  newCategory,
  setNewCategory,
}: AddProductModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-box-header">
          <h3>Add Product to Store</h3>
          <button
            type="button"
            className="modal-x"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onAddProduct} className="modal-body-form">
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              placeholder="e.g. Leather Minimalist Slides"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
              >
                <option value="Apparel">Apparel</option>
                <option value="Footwear">Footwear</option>
                <option value="Accessories">Accessories</option>
                <option value="Beauty">Beauty</option>
                <option value="Food">Food</option>
              </select>
            </div>

            <div className="form-group">
              <label>Price (₦)</label>
              <input
                type="text"
                placeholder="e.g. 35,000"
                value={newPrice}
                onChange={e => setNewPrice(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Initial Stock Quantity</label>
            <input
              type="number"
              placeholder="e.g. 15"
              value={newStock}
              onChange={e => setNewStock(e.target.value)}
              required
            />
          </div>

          <div className="modal-buttons">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="header-btn-add">
              Publish to WhatsApp Store
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
