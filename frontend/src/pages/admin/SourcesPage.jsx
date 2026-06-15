import { useEffect, useState } from 'react';
import {
  getSources, rafraichirSource, changerStatutSource,
  supprimerSource,
} from '../../services/adminService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDatabase, faArrowsRotate, faToggleOn, faToggleOff, faTrashCan, faXmark,
  faWifi, faSignal, faTriangleExclamation,faWrench, faLink,faTag,faCircleXmark,
} from '@fortawesome/free-solid-svg-icons';
import './AdminPages.css';

const COLORS = {
  EN_LIGNE:       'green',
  HORS_LIGNE:     'red',
  LATENCE_ELEVEE: 'amber',
  MAINTENANCE:    'gray',
};

const STATUS_ICON = {
  EN_LIGNE:       faWifi,
  HORS_LIGNE:     faSignal,
  LATENCE_ELEVEE: faTriangleExclamation,
  MAINTENANCE:    faWrench,
};

export default function SourcesPage() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tick,    setTick]    = useState(0);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getSources();
        if (alive) setSources(data);
      } catch (e) {
        if (alive) setError(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [tick]);

  const refresh = () => setTick((t) => t + 1);

  async function handleRafraichir(id) { await rafraichirSource(id); refresh(); }
  async function handleToggle(s) {
    await changerStatutSource(s.id, s.statut === 'EN_LIGNE' ? 'HORS_LIGNE' : 'EN_LIGNE');
    refresh();
  }
  async function handleSupprimer(id) {
    if (!window.confirm('Supprimer cette source ?')) return;
    await supprimerSource(id);
    refresh();
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">
          <FontAwesomeIcon icon={faDatabase} style={{ marginRight: 10, color: '#059669' }} />
          Sources connectées
        </h1>
        <p className="page-sub">Supervision des APIs académiques externes</p>
      </div>

      {error && (
        <div className="alert alert--error">
          <FontAwesomeIcon icon={faCircleXmark} style={{ marginRight: 8 }} />
          {error}
          <button onClick={() => setError(null)}><FontAwesomeIcon icon={faXmark} /></button>
        </div>
      )}

      <div className="toolbar">
        <span className="text-muted">{sources.length} source(s)</span>
      </div>

      {loading ? (
        <p className="page-loading">
          <FontAwesomeIcon icon={faArrowsRotate} spin /> Chargement…
        </p>
      ) : (
        <div className="card table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Type</th>
                <th>Statut</th>
                <th>Latence</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sources.length === 0 ? (
                <tr><td colSpan={5} className="empty-row">Aucune source configurée</td></tr>
              ) : sources.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="user-cell">
                      <span className="source-icon">
                        <FontAwesomeIcon icon={faDatabase} />
                      </span>
                      <div>
                        <div style={{ fontWeight: 500, color: '#1e3a5f' }}>{s.nom}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                          <FontAwesomeIcon icon={faLink} style={{ marginRight: 4 }} />
                          {s.urlBase}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge--gray">
                      <FontAwesomeIcon icon={faTag} style={{ marginRight: 5 }} />
                      {s.typeApi ?? '—'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge--${COLORS[s.statut] ?? 'gray'}`}>
                      <FontAwesomeIcon
                        icon={STATUS_ICON[s.statut] ?? faWifi}
                        style={{ marginRight: 5 }}
                      />
                      {s.statut}
                    </span>
                  </td>
                  <td>{s.latenceMs ? `${s.latenceMs} ms` : '—'}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn btn--sm btn--blue" onClick={() => handleRafraichir(s.id)}>
                        <FontAwesomeIcon icon={faArrowsRotate} /> Rafraîchir
                      </button>
                      <button
                        className={`btn btn--sm ${s.statut === 'EN_LIGNE' ? 'btn--amber' : 'btn--green'}`}
                        onClick={() => handleToggle(s)}
                      >
                        <FontAwesomeIcon icon={s.statut === 'EN_LIGNE' ? faToggleOff : faToggleOn} />
                        {s.statut === 'EN_LIGNE' ? ' Désactiver' : ' Activer'}
                      </button>
                      <button className="btn btn--sm btn--red" onClick={() => handleSupprimer(s.id)}>
                        <FontAwesomeIcon icon={faTrashCan} /> Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      
    </div>
  );
}