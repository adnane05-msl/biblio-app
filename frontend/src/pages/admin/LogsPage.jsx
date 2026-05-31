// src/pages/admin/LogsPage.jsx
import { useEffect, useState, useCallback } from 'react';
import { getLogs } from '../../services/adminService';
import './AdminPages.css';

const TYPES = [
  { value: null,    label: 'Tout',    color: 'blue'  },
  { value: 'ERROR', label: 'Erreurs', color: 'red'   },
  { value: 'WARN',  label: 'Alertes', color: 'amber' },
  { value: 'INFO',  label: 'Info',    color: 'blue'  },
  { value: 'OK',    label: 'Succès',  color: 'green' },
];
const DOT = { OK: 'green', INFO: 'blue', WARN: 'amber', ERROR: 'red' };

export default function LogsPage() {
  const [logs,       setLogs]    = useState([]);
  const [loading,    setLoading] = useState(false);
  const [activeType, setActive]  = useState(null);

  const fetchLogs = useCallback(async (type) => {
    setLoading(true);
    try {
      const data = await getLogs(type);
      setLogs(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(activeType);
  }, [activeType, fetchLogs]);

  return (
    <div className="admin-page">
      <h1 className="page-title">Journaux système</h1>
      <p className="page-sub">Historique des événements et erreurs</p>

      <div className="filter-bar">
        {TYPES.map((t) => (
          <button key={t.label}
            className={`btn btn--sm ${activeType === t.value ? `btn--${t.color}` : ''}`}
            onClick={() => setActive(t.value)}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <p className="page-loading">Chargement…</p> : (
        <section className="card">
          <ul className="log-list">
            {logs.map((l) => (
              <li key={l.id} className="log-list__item">
                <span className={`log-dot log-dot--${DOT[l.type]?.toLowerCase()}`} />
                <span className="log-time">{fmt(l.createdAt)}</span>
                <span className="log-composant">{l.composant}</span>
                <span className="log-msg">{l.message}</span>
                {l.userEmail && <span className="log-user">{l.userEmail}</span>}
              </li>
            ))}
            {logs.length === 0 && <li className="empty-row">Aucun journal</li>}
          </ul>
        </section>
      )}
    </div>
  );
}

function fmt(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}