// src/pages/admin/LogsPage.jsx
// Journaux système avec icônes Font Awesome

import { useEffect, useState } from 'react';
import { getLogs } from '../../services/adminService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faScroll, faCircleCheck, faCircleInfo,
  faTriangleExclamation, faCircleXmark,
} from '@fortawesome/free-solid-svg-icons';
import './AdminPages.css';

const TYPES = [
  { value: null,    label: 'Tout',    color: 'blue'  },
  { value: 'ERROR', label: 'Erreurs', color: 'red'   },
  { value: 'WARN',  label: 'Alertes', color: 'amber' },
  { value: 'INFO',  label: 'Info',    color: 'blue'  },
  { value: 'OK',    label: 'Succès',  color: 'green' },
];

const TYPE_ICON = {
  OK:    faCircleCheck,
  INFO:  faCircleInfo,
  WARN:  faTriangleExclamation,
  ERROR: faCircleXmark,
};

const TYPE_COLOR = {
  OK:    '#10b981',
  INFO:  '#3b82f6',
  WARN:  '#f59e0b',
  ERROR: '#ef4444',
};

export default function LogsPage() {
  const [logs,       setLogs]   = useState([]);
  const [loading,    setLoading] = useState(false);
  const [activeType, setActive] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getLogs(activeType);
        if (alive) setLogs(data);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [activeType]);

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">
          <FontAwesomeIcon icon={faScroll} style={{ marginRight: 10, color: '#2563eb' }} />
          Journaux système
        </h1>
        <p className="page-sub">Historique des événements et erreurs</p>
      </div>

      {/* ── Filtres ──────────────────────────────────────────── */}
      <div className="filter-bar">
        {TYPES.map((t) => (
          <button
            key={t.label}
            className={`btn btn--sm ${activeType === t.value ? `btn--${t.color}` : ''}`}
            onClick={() => setActive(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="page-loading">Chargement…</p>
      ) : (
        <div className="card">
          <ul className="log-list">
            {logs.map((l) => (
              <li key={l.id} className="log-list__item">
                <FontAwesomeIcon
                  icon={TYPE_ICON[l.type] ?? faCircleInfo}
                  style={{ color: TYPE_COLOR[l.type] ?? '#6b7280', flexShrink: 0, fontSize: 14 }}
                />
                <span className="log-time">{fmt(l.createdAt)}</span>
                <span className="log-composant">{l.composant}</span>
                <span className="log-msg">{l.message}</span>
                {l.userEmail && <span className="log-user">{l.userEmail}</span>}
              </li>
            ))}
            {logs.length === 0 && <li className="empty-row">Aucun journal</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

function fmt(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}