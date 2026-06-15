import { useEffect, useState } from 'react';
import { getDashboard } from '../../services/adminService';
import StatCard from '../../components/admin/StatCard';
import './AdminPages.css';

export default function DashboardPage() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Chargement…</div>;
  if (error)   return <div className="page-error">Erreur : {error}</div>;

  return (
    <div className="admin-page">
      <h1 className="page-title">Tableau de bord</h1>
      <p className="page-sub">Vue d'ensemble de l'application</p>

      {/* ── Métriques ─────────────────────────────────────────── */}
      <div className="stats-grid">
        <StatCard icon="👥" label="Utilisateurs"   value={data.totalUtilisateurs}  color="blue" />
        <StatCard icon="🔗" label="Sources actives" value={`${data.sourcesEnLigne}/${data.totalSources}`} color="green" />
        <StatCard icon="⚡" label="Uptime"          value={`${data.uptimePct}%`}   color="green" />
        <StatCard icon="⚠️" label="Erreurs (24h)"   value={data.erreursAujourdhui}  color={data.erreursAujourdhui > 0 ? 'amber' : 'default'} />
      </div>

      <div className="two-col">
        {/* ── Sources ──────────────────────────────────────────── */}
        <section className="card">
          <h2 className="card-title">État des sources</h2>
          <table className="admin-table">
            <thead>
              <tr><th>Source</th><th>Statut</th><th>Latence</th></tr>
            </thead>
            <tbody>
              {data.sourcesSummary?.map((s) => (
                <tr key={s.id}>
                  <td>{s.nom}</td>
                  <td><span className={`badge badge--${statutClass(s.statut)}`}>{s.statut}</span></td>
                  <td>{s.latenceMs ? `${s.latenceMs} ms` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ── Derniers inscrits ─────────────────────────────────── */}
        <section className="card">
          <h2 className="card-title">Derniers inscrits</h2>
          <ul className="user-list">
            {data.derniersInscrits?.map((u) => (
              <li key={u.id} className="user-list__item">
                <span className="avatar">{initials(u.nom)}</span>
                <div>
                  <p className="user-list__name">{u.nom}</p>
                  <p className="user-list__email">{u.email}</p>
                </div>
                <span className={`badge badge--${u.statut === 'ACTIF' ? 'green' : 'gray'}`}>
                  {u.statut}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ── Logs récents ─────────────────────────────────────────── */}
      <section className="card">
        <h2 className="card-title">Activité récente</h2>
        <ul className="log-list">
          {data.logsRecents?.map((l) => (
            <li key={l.id} className="log-list__item">
              <span className={`log-dot log-dot--${l.type.toLowerCase()}`} />
              <span className="log-time">{formatTime(l.createdAt)}</span>
              <span className="log-msg">{l.message}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function initials(nom) {
  return nom?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?';
}

function statutClass(statut) {
  const map = { EN_LIGNE: 'green', HORS_LIGNE: 'red', LATENCE_ELEVEE: 'amber', MAINTENANCE: 'gray' };
  return map[statut] || 'gray';
}

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}