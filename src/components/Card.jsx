function Card({ title, value, subtitle }) {
  return (
    <div className="stat-card">
      <p>{title}</p>
      <h2>{value}</h2>
      {subtitle && <span>{subtitle}</span>}
    </div>
  );
}

export default Card;