import React, { createContext, useContext, useEffect, useState } from "react";
import Toast from "./Toast";
import ConfirmModal from "./ConfirmModal";

const UIContext = createContext();

export function UIProvider({ children }) {
  const [theme, setTheme] = useState(
    window.localStorage.getItem("theme") || "light"
  );
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  const showToast = (type, message) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const confirm = (options) => {
    return new Promise((resolve) => {
      setConfirmState({
        ...options,
        onConfirm: () => {
          setConfirmState(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmState(null);
          resolve(false);
        },
      });
    });
  };

  return (
    <UIContext.Provider value={{ showToast, confirm, theme, setTheme }}>
      {children}
      <Toast toasts={toasts} onClose={removeToast} />
      {confirmState && (
        <ConfirmModal
          title={confirmState.title}
          message={confirmState.message}
          onConfirm={confirmState.onConfirm}
          onCancel={confirmState.onCancel}
        />
      )}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
