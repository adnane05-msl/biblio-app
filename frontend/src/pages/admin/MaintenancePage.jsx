// src/pages/admin/MaintenancePage.jsx
// Maintenance avec icônes Font Awesome

import { useState } from 'react';
import { viderCache, reinitialiserSessions } from '../../services/adminService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faScrewdriverWrench, faDatabase, faServer,
  faTrashCan, faFloppyDisk, faArrowsRotate,
  faLockOpen, faBoxArchive, faCircleCheck, faCircleXmark,faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons';
import './AdminPages.css';

const VERSIONS = [
  { composant: 'Frontend (React.js)',          version: 'v1.2.0', statut: 'OK',  date: '12 mai 2026'   },
  { composant: 'Backend (Spring Boot)',         version: 'v1.1.3', statut: 'MAJ', date: '3 avril 2026'  },
  { composant: 'Base de données (PostgreSQL)',  version: '15.4',   statut: 'OK',  date: 'Janv. 2026'    },
];

export default function MaintenancePage() {
  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState({});

  function addMsg(msg, type = 'ok') {
    setMessages((prev) => [{ msg, type, id: Date.now() }, ...prev.slice(0, 4)]);
  }

  async function run(key, fn, label) {
    setLoading((l) => ({ ...l, [key]: true }));
    try {
      await fn();
      addMsg(`${label} effectué avec succès`, 'ok');
    } catch (e) {
      addMsg(`Erreur : ${e.message}`, 'error');
    } finally {
      setLoading((l) => ({ ...l, [key]: false }));
    }
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">
          <FontAwesomeIcon icon={faScrewdriverWrench} style={{ marginRight: 10, color: '#2563eb' }} />
          Maintenance
        </h1>
        <p className="page-sub">Opérations système et base de données</p>
      </div>

      {/* ── Messages d'action ──────────────────────────────────── */}
      {messages.map((m) => (
        <div key={m.id} className={`alert alert--${m.type}`}>
          <span>
            <FontAwesomeIcon
              icon={m.type === 'ok' ? faCircleCheck : faCircleXmark}
              style={{ marginRight: 8 }}
            />
            {m.msg}
          </span>
        </div>
      ))}

      <div className="two-col">

        {/* ── Base de données ────────────────────────────────────── */}
        <section className="card">
          <h2 className="card-title">
            <FontAwesomeIcon icon={faDatabase} /> Base de données
          </h2>
          <div className="action-list">
            <div className="action-item">
              <div>
                <p className="action-label">Nettoyage des doublons</p>
                <p className="action-desc">Supprimer les articles dupliqués détectés</p>
              </div>
              <button
                className="btn btn--sm"
                disabled={loading.dup}
                onClick={() => run('dup', () => Promise.resolve(), 'Nettoyage des doublons')}
              >
                <FontAwesomeIcon icon={faTrashCan} />
                {loading.dup ? ' …' : ' Lancer'}
              </button>
            </div>

            <div className="action-item">
              <div>
                <p className="action-label">Sauvegarde complète</p>
                <p className="action-desc">Dernière : aujourd'hui 03h00</p>
              </div>
              <button
                className="btn btn--sm btn--primary"
                disabled={loading.backup}
                onClick={() => run('backup', () => Promise.resolve(), 'Sauvegarde')}
              >
                <FontAwesomeIcon icon={faFloppyDisk} />
                {loading.backup ? ' …' : ' Sauvegarder'}
              </button>
            </div>

            <div className="action-item">
              <div>
                <p className="action-label">Optimisation des index</p>
                <p className="action-desc">Réindexation complète de la base</p>
              </div>
              <button
                className="btn btn--sm btn--blue"
                disabled={loading.reindex}
                onClick={() => run('reindex', () => Promise.resolve(), 'Réindexation')}
              >
                <FontAwesomeIcon icon={faBoxArchive} />
                {loading.reindex ? ' …' : ' Réindexer'}
              </button>
            </div>
          </div>
        </section>

        {/* ── Serveur / Cache ────────────────────────────────────── */}
        <section className="card">
          <h2 className="card-title">
            <FontAwesomeIcon icon={faServer} /> Serveur &amp; Cache
          </h2>
          <div className="action-list">
            <div className="action-item">
              <div>
                <p className="action-label">Vider le cache</p>
                <p className="action-desc">Purge complète du cache applicatif</p>
              </div>
              <button
                className="btn btn--sm btn--warn"
                disabled={loading.cache}
                onClick={() => run('cache', viderCache, 'Cache vidé')}
              >
                <FontAwesomeIcon icon={faArrowsRotate} />
                {loading.cache ? ' …' : ' Vider'}
              </button>
            </div>

            <div className="action-item">
              <div>
                <p className="action-label">Réinitialiser les sessions</p>
                <p className="action-desc">Déconnecte tous les utilisateurs actifs</p>
              </div>
              <button
                className="btn btn--sm btn--danger"
                disabled={loading.sessions}
                onClick={() => run('sessions', reinitialiserSessions, 'Sessions réinitialisées')}
              >
                <FontAwesomeIcon icon={faLockOpen} />
                {loading.sessions ? ' …' : ' Forcer'}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ── Versions ──────────────────────────────────────────────── */}
      <section className="card">
        <h2 className="card-title">
          <FontAwesomeIcon icon={faBoxArchive} /> Versions des composants
        </h2>
        <table className="admin-table">
          <thead>
            <tr><th>Composant</th><th>Version</th><th>Statut</th><th>Mise à jour</th></tr>
          </thead>
          <tbody>
            {VERSIONS.map((v) => (
              <tr key={v.composant}>
                <td>{v.composant}</td>
                <td><code>{v.version}</code></td>
                <td>
                  <span className={`badge badge--${v.statut === 'OK' ? 'green' : 'amber'}`}>
                    <FontAwesomeIcon
                      icon={v.statut === 'OK' ? faCircleCheck : faTriangleExclamation}
                      style={{ marginRight: 5 }}
                    />
                    {v.statut === 'OK' ? 'À jour' : 'Mise à jour disponible'}
                  </span>
                </td>
                <td className="text-muted">{v.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}