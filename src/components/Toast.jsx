import React from "react";
import { FiCheckCircle, FiAlertTriangle, FiXCircle, FiInfo, FiX } from "react-icons/fi";

export default function Toast({ toasts, onClose }) {
  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <FiCheckCircle />;
      case "error":
        return <FiXCircle />;
      case "warning":
        return <FiAlertTriangle />;
      case "info":
      default:
        return <FiInfo />;
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-icon">{getIcon(t.type)}</span>
          <span className="toast-message">{t.message}</span>
          <button className="toast-close" onClick={() => onClose(t.id)}>
            <FiX />
          </button>
        </div>
      ))}
    </div>
  );
}
