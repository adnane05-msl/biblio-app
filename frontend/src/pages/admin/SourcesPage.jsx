// src/pages/admin/SourcesPage.jsx
// Sources connectées avec icônes Font Awesome

import { useEffect, useState } from 'react';
import {
  getSources, rafraichirSource, changerStatutSource,
  supprimerSource, createSource,
} from '../../services/adminService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlug, faPlus, faRotate, faToggleOn, faToggleOff,
  faTrashCan, faXmark, faFloppyDisk,
} from '@fortawesome/free-solid-svg-icons';
import './AdminPages.css';

const COLORS = { EN_LIGNE: 'green', HORS_LIGNE: 'red', LATENCE_ELEVEE: 'amber', MAINTENANCE: 'gray' };
const EMPTY  = { nom: '', urlBase: '', typeApi: 'REST / JSON', limiteRequetes: '', cleApi: '' };

export default function SourcesPage() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tick,    setTick]    = useState(0);
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);
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
    await supprimerSource(id); refresh();
  }
  async function handleSubmit(e) {
    e.preventDefault(); setSaving(true);
    try {
      await createSource({ ...form, limiteRequetes: form.limiteRequetes || null });
      setModal(false); setForm(EMPTY); refresh();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">
          <FontAwesomeIcon icon={faPlug} style={{ marginRight: 10, color: '#2563eb' }} />
          Sources connectées
        </h1>
        <p className="page-sub">Supervision des APIs académiques externes</p>
      </div>

      {error && (
        <div className="alert alert--error">
          {error}
          <button onClick={() => setError(null)}><FontAwesomeIcon icon={faXmark} /></button>
        </div>
      )}

      <div className="toolbar">
        <span className="text-muted">{sources.length} source(s)</span>
        <button className="btn btn--primary" onClick={() => setModal(true)}>
          <FontAwesomeIcon icon={faPlus} /> Ajouter une source
        </button>
      </div>

      {loading ? (
        <p className="page-loading">Chargement…</p>
      ) : (
        <div className="card table-card">
          <table className="admin-table">
            <thead>
              <tr><th>Source</th><th>Type</th><th>Statut</th><th>Latence</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="user-cell">
                      <span className="source-icon">{s.nom?.slice(0, 2).toUpperCase()}</span>
                      <div>
                        <div style={{ fontWeight: 500, color: '#1e3a5f' }}>{s.nom}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{s.urlBase}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-muted">{s.typeApi}</td>
                  <td>
                    <span className={`badge badge--${COLORS[s.statut] ?? 'gray'}`}>{s.statut}</span>
                  </td>
                  <td>{s.latenceMs ? `${s.latenceMs} ms` : '—'}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn btn--sm btn--blue" onClick={() => handleRafraichir(s.id)}>
                        <FontAwesomeIcon icon={faRotate} /> Rafraîchir
                      </button>
                      <button
                        className={`btn btn--sm ${s.statut === 'EN_LIGNE' ? 'btn--warn' : 'btn--green'}`}
                        onClick={() => handleToggle(s)}
                      >
                        <FontAwesomeIcon icon={s.statut === 'EN_LIGNE' ? faToggleOff : faToggleOn} />
                        {s.statut === 'EN_LIGNE' ? ' Désactiver' : ' Activer'}
                      </button>
                      <button className="btn btn--sm btn--danger" onClick={() => handleSupprimer(s.id)}>
                        <FontAwesomeIcon icon={faTrashCan} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sources.length === 0 && (
                <tr><td colSpan={5} className="empty-row">Aucune source configurée</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal Ajouter ─────────────────────────────────────── */}
      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">
                <FontAwesomeIcon icon={faPlug} style={{ marginRight: 8, color: '#2563eb' }} />
                Ajouter une source
              </h2>
              <button className="modal-close" onClick={() => setModal(false)}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nom de la source</label>
                  <input className="form-input" placeholder="OpenAlex" value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">URL de base</label>
                  <input className="form-input" placeholder="https://api.openalex.org" value={form.urlBase}
                    onChange={(e) => setForm({ ...form, urlBase: e.target.value })} required />
                </div>
                <div className="two-col" style={{ gap: 12, marginBottom: 0 }}>
                  <div className="form-group">
                    <label className="form-label">Type d'API</label>
                    <select className="form-select" value={form.typeApi}
                      onChange={(e) => setForm({ ...form, typeApi: e.target.value })}>
                      <option>REST / JSON</option>
                      <option>GraphQL</option>
                      <option>SOAP / XML</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Limite requêtes/min</label>
                    <input className="form-input" type="number" placeholder="100" value={form.limiteRequetes}
                      onChange={(e) => setForm({ ...form, limiteRequetes: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Clé API (optionnel)</label>
                  <input className="form-input" type="password" placeholder="sk-…" value={form.cleApi}
                    onChange={(e) => setForm({ ...form, cleApi: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setModal(false)}>
                  <FontAwesomeIcon icon={faXmark} /> Annuler
                </button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  <FontAwesomeIcon icon={faFloppyDisk} />
                  {saving ? ' Enregistrement…' : ' Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}