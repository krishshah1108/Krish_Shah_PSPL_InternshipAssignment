export default function StatCard({ label, value, accent, icon: Icon }) {
  return (
    <article className={`stat-card ${accent || ''}`}>
      <div className="stat-top">
        <p className="stat-label">{label}</p>
        {Icon && (
          <span className="stat-icon" aria-hidden="true">
            <Icon />
          </span>
        )}
      </div>
      <p className="stat-value">{value}</p>
    </article>
  );
}
