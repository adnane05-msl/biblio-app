// src/components/admin/StatCard.jsx
// Carte de métrique réutilisable pour le dashboard.

import './StatCard.css';

export default function StatCard({ icon, label, value, color = 'default', sub }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card__icon" aria-hidden="true">{icon}</div>
      <div className="stat-card__body">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__value">{value ?? '—'}</span>
        {sub && <span className="stat-card__sub">{sub}</span>}
      </div>
    </div>
  );
}