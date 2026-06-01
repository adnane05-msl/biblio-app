import { useEffect, useState } from 'react';
import { getDashboard } from '../../services/adminService';
import StatCard from '../../components/admin/StatCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers, faPlug, faBolt, faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import './AdminPages.css';

function statutClass(s) {
  if (s === 'EN_LIGNE')       return 'green';
  if (s === 'HORS_LIGNE')     return 'red';
  if (s === 'LATENCE_ELEVEE') return 'amber';
  return 'gray';
}

function initials(nom = '') {
  return nom.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

export default function DashboardPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">⏳ Chargement…</div>;
  if (error)   return <div className="page-error">Erreur : {error}</div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">Tableau de bord</h1>
        <p className="page-sub">Vue d'ensemble de l'application</p>
      </div>

      {/* ── Métriques ───────────────────────────────────────── */}
      <div className="stats-grid">
        <StatCard
          icon={<FontAwesomeIcon icon={faUsers} />}
          label="Utilisateurs"
          value={data.totalUtilisateurs}
          color="blue"
        />
        <StatCard
          icon={<FontAwesomeIcon icon={faPlug} />}
          label="Sources actives"
          value={`${data.sourcesEnLigne}/${data.totalSources}`}
          color="green"
        />
        <StatCard
          icon={<FontAwesomeIcon icon={faBolt} />}
          label="Uptime"
          value={`${data.uptimePct}%`}
          color="green"
        />
        <StatCard
          icon={<FontAwesomeIcon icon={faTriangleExclamation} />}
          label="Erreurs (24h)"
          value={data.erreursAujourdhui}
          color={data.erreursAujourdhui > 0 ? 'amber' : 'default'}
        />
      </div>

      <div className="two-col">
        {/* ── Sources ─────────────────────────────────────────── */}
        <section className="card">
          <h2 className="card-title">
            <FontAwesomeIcon icon={faPlug} /> État des sources
          </h2>
          <table className="admin-table">
            <thead>
              <tr><th>Source</th><th>Statut</th><th>Latence</th></tr>
            </thead>
            <tbody>
              {data.sourcesSummary?.map((s) => (
                <tr key={s.id}>
                  <td>{s.nom}</td>
                  <td>
                    <span className={`badge badge--${statutClass(s.statut)}`}>{s.statut}</span>
                  </td>
                  <td>{s.latenceMs ? `${s.latenceMs} ms` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ── Derniers inscrits ───────────────────────────────── */}
        <section className="card">
          <h2 className="card-title">
            <FontAwesomeIcon icon={faUsers} /> Derniers inscrits
          </h2>
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
    </div>
  );
}