// src/pages/admin/MaintenancePage.jsx
// Opérations de maintenance : base de données, cache, sessions, versions.

import { useState } from 'react';
import { viderCache, reinitialiserSessions } from '../../services/adminService';
import './AdminPages.css';

const VERSIONS = [
  { composant: 'Frontend (React.js)',  version: 'v1.2.0', statut: 'OK',   date: '12 mai 2026' },
  { composant: 'Backend (Spring Boot)', version: 'v1.1.3', statut: 'MAJ', date: '3 avril 2026' },
  { composant: 'Base de données (PostgreSQL)', version: '15.4', statut: 'OK', date: 'Janv. 2026' },
];

export default function MaintenancePage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState({});

  function addMsg(msg, type = 'ok') {
    setMessages((prev) => [{ msg, type, id: Date.now() }, ...prev.slice(0, 4)]);
  }

  async function run(key, fn, label) {
    setLoading((l) => ({ ...l, [key]: true }));
    try {
      await fn();
      addMsg(`✅ ${label} effectué avec succès`, 'ok');
    } catch (e) {
      addMsg(`❌ Erreur : ${e.message}`, 'error');
    } finally {
      setLoading((l) => ({ ...l, [key]: false }));
    }
  }

  return (
    <div className="admin-page">
      <h1 className="page-title">Maintenance</h1>
      <p className="page-sub">Opérations système et base de données</p>

      {/* ── Messages d'action ────────────────────────────────────── */}
      {messages.map((m) => (
        <div key={m.id} className={`alert alert--${m.type}`}>{m.msg}</div>
      ))}

      <div className="two-col">
        {/* ── Base de données ──────────────────────────────────────── */}
        <section className="card">
          <h2 className="card-title">🗄️ Base de données</h2>
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
                {loading.dup ? '…' : '🧹 Lancer'}
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
                {loading.backup ? '…' : '💾 Exporter'}
              </button>
            </div>
            <div className="action-item">
              <div>
                <p className="action-label">Optimisation des index</p>
                <p className="action-desc">Améliore les performances de recherche</p>
              </div>
              <button
                className="btn btn--sm"
                disabled={loading.idx}
                onClick={() => run('idx', () => Promise.resolve(), 'Optimisation')}
              >
                {loading.idx ? '…' : '⚡ Optimiser'}
              </button>
            </div>
          </div>
        </section>

        {/* ── Système ──────────────────────────────────────────────── */}
        <section className="card">
          <h2 className="card-title">⚙️ Système</h2>
          <div className="action-list">
            <div className="action-item">
              <div>
                <p className="action-label">Vider le cache</p>
                <p className="action-desc">Cache des résultats API et requêtes</p>
              </div>
              <button
                className="btn btn--sm"
                disabled={loading.cache}
                onClick={() => run('cache', viderCache, 'Cache vidé')}
              >
                {loading.cache ? '…' : '🔄 Vider'}
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
                onClick={() => {
                  if (window.confirm('Déconnecter tous les utilisateurs ?'))
                    run('sessions', reinitialiserSessions, 'Sessions réinitialisées');
                }}
              >
                {loading.sessions ? '…' : '🔓 Forcer'}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ── Versions ─────────────────────────────────────────────── */}
      <section className="card">
        <h2 className="card-title">📦 Versions des composants</h2>
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