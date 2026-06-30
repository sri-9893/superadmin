function Button({ children, type = "button", variant = "primary", onClick }) {
  return (
    <button
      type={type}
      className={variant === "outline" ? "outline-btn" : "primary-btn"}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;