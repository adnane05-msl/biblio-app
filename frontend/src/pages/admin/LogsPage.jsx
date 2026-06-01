import { useEffect, useState } from 'react';
import { getLogs } from '../../services/adminService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList,      // Titre page
  faCircleCheck,        // OK
  faCircleInfo,         // INFO
  faTriangleExclamation,// WARN
  faCircleXmark,        // ERROR
  faFilter,             // Filtres
  faCalendarDay,        // Date
  faMicrochip,          // Composant
  faArrowsRotate,       // Chargement
  faInbox,              // Vide
} from '@fortawesome/free-solid-svg-icons';
import './AdminPages.css';

const TYPES = [
  { value: null,    label: 'Tout',    color: 'blue',  icon: faFilter        },
  { value: 'ERROR', label: 'Erreurs', color: 'red',   icon: faCircleXmark   },
  { value: 'WARN',  label: 'Alertes', color: 'amber', icon: faTriangleExclamation },
  { value: 'INFO',  label: 'Info',    color: 'blue',  icon: faCircleInfo    },
  { value: 'OK',    label: 'Succès',  color: 'green', icon: faCircleCheck   },
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

const TYPE_BG = {
  OK:    '#ecfdf5',
  INFO:  '#eff6ff',
  WARN:  '#fffbeb',
  ERROR: '#fef2f2',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

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
          <FontAwesomeIcon icon={faClipboardList} style={{ marginRight: 10, color: '#dc2626' }} />
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
            <FontAwesomeIcon icon={t.icon} style={{ marginRight: 5 }} />
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="page-loading">
          <FontAwesomeIcon icon={faArrowsRotate} spin /> Chargement…
        </p>
      ) : (
        <div className="card table-card">
          {logs.length === 0 ? (
            <div className="empty-row" style={{ padding: '3rem', textAlign: 'center' }}>
              <FontAwesomeIcon icon={faInbox} style={{ fontSize: 32, color: '#d1d5db', marginBottom: 12, display: 'block' }} />
              Aucun journal trouvé
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Message</th>
                  <th>Composant</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <span
                        className={`badge badge--${
                          l.type === 'OK'    ? 'green' :
                          l.type === 'ERROR' ? 'red'   :
                          l.type === 'WARN'  ? 'amber' : 'blue'
                        }`}
                        style={{ background: TYPE_BG[l.type] }}
                      >
                        <FontAwesomeIcon
                          icon={TYPE_ICON[l.type] ?? faCircleInfo}
                          style={{ color: TYPE_COLOR[l.type], marginRight: 6 }}
                        />
                        {l.type}
                      </span>
                    </td>
                    <td style={{ maxWidth: 400 }}>{l.message}</td>
                    <td className="text-muted">
                      {l.composant && (
                        <>
                          <FontAwesomeIcon icon={faMicrochip} style={{ marginRight: 5 }} />
                          {l.composant}
                        </>
                      )}
                    </td>
                    <td className="text-muted">
                      <FontAwesomeIcon icon={faCalendarDay} style={{ marginRight: 5 }} />
                      {formatDate(l.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}