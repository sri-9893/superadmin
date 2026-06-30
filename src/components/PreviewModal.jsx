import React from "react";
import { FiPrinter, FiX, FiCheck } from "react-icons/fi";

export default function PreviewModal({ title, data, onClose, onSubmit }) {
  // Format key into Title Case
  const formatKey = (key) => {
    // Separate camelCase with spaces and capitalize
    const result = key.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter out internal fields or file objects
  const filteredKeys = Object.keys(data).filter(
    (key) =>
      key !== "id" &&
      key !== "password" &&
      typeof data[key] !== "object" &&
      data[key] !== "" &&
      data[key] !== null &&
      data[key] !== undefined
  );

  return (
    <div className="modal-overlay print-modal-overlay" style={{ zIndex: 12000 }}>
      <div className="preview-modal-card print-area">
        <div className="modal-header no-print">
          <h3 className="preview-modal-title">{title}</h3>
          <button className="icon-btn" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <h2 className="print-only" style={{ marginBottom: "20px", textAlign: "center" }}>
          {title}
        </h2>

        <div className="preview-modal-grid">
          {filteredKeys.map((key) => (
            <div key={key} className="preview-modal-item">
              <label>{formatKey(key)}</label>
              <span>{String(data[key])}</span>
            </div>
          ))}
        </div>

        <div className="preview-modal-actions no-print">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn btn-outline" onClick={handlePrint}>
            <FiPrinter /> Print / Save PDF
          </button>
          <button type="button" className="btn btn-primary" onClick={onSubmit}>
            <FiCheck /> Submit
          </button>
        </div>
      </div>
    </div>
  );
}
