// src/pages/admin/SourcesPage.jsx
import { useEffect, useState, useCallback } from 'react';
import {
  getSources, rafraichirSource, changerStatutSource,
  supprimerSource, createSource,
} from '../../services/adminService';
import './AdminPages.css';

const STATUTS_COLORS = {
  EN_LIGNE: 'green', HORS_LIGNE: 'red', LATENCE_ELEVEE: 'amber', MAINTENANCE: 'gray',
};
const EMPTY = { nom: '', urlBase: '', typeApi: 'REST / JSON', limiteRequetes: '', cleApi: '' };

export default function SourcesPage() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);

  // ✅ Même pattern que UsersPage : async/await dans useCallback.
  //    Aucun setState synchrone dans useEffect.
  const fetchSources = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSources();
      setSources(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  async function handleRafraichir(id) { await rafraichirSource(id); fetchSources(); }

  async function handleToggle(s) {
    const next = s.statut === 'EN_LIGNE' ? 'HORS_LIGNE' : 'EN_LIGNE';
    await changerStatutSource(s.id, next);
    fetchSources();
  }

  async function handleSupprimer(id) {
    if (!window.confirm('Supprimer cette source ?')) return;
    await supprimerSource(id);
    fetchSources();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await createSource({ ...form, limiteRequetes: form.limiteRequetes || null });
      setModal(false);
      setForm(EMPTY);
      fetchSources();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page">
      <h1 className="page-title">Sources connectées</h1>
      <p className="page-sub">Supervision des APIs académiques externes</p>

      {error && <div className="alert alert--error">{error} <button onClick={() => setError(null)}>✕</button></div>}

      <div className="toolbar">
        <span className="text-muted">{sources.length} source(s)</span>
        <button className="btn btn--primary" onClick={() => setModal(true)}>+ Ajouter</button>
      </div>

      {loading ? <p className="page-loading">Chargement…</p> : (
        <div className="card table-card">
          <table className="admin-table">
            <thead><tr>
              <th>Source</th><th>Type</th><th>Statut</th>
              <th>Latence</th><th>Req./j</th><th>Limite</th>
              <th>Synchro</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="user-cell">
                      <span className="source-icon">{s.nom.slice(0, 2).toUpperCase()}</span>
                      <div>
                        <p style={{ margin: 0, fontWeight: 500 }}>{s.nom}</p>
                        <p style={{ margin: 0, fontSize: 11, color: '#999' }}>{s.urlBase}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-muted">{s.typeApi || 'REST'}</td>
                  <td><span className={`badge badge--${STATUTS_COLORS[s.statut] || 'gray'}`}>{s.statut?.replace('_', ' ')}</span></td>
                  <td className={s.latenceMs > 2000 ? 'text-amber' : ''}>{s.latenceMs ? `${s.latenceMs} ms` : '—'}</td>
                  <td>{s.requetesJour ?? '—'}</td>
                  <td>{s.limiteRequetes ? s.limiteRequetes.toLocaleString() : 'illimité'}</td>
                  <td className="text-muted">{fmt(s.derniereSynchro)}</td>
                  <td><div className="action-btns">
                    <button className="btn btn--sm" onClick={() => handleRafraichir(s.id)}>🔄</button>
                    <button className="btn btn--sm btn--warn" onClick={() => handleToggle(s)}>{s.statut === 'EN_LIGNE' ? '⏸' : '▶️'}</button>
                    <button className="btn btn--sm btn--danger" onClick={() => handleSupprimer(s.id)}>🗑</button>
                  </div></td>
                </tr>
              ))}
              {sources.length === 0 && <tr><td colSpan={8} className="empty-row">Aucune source</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Nouvelle source</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Nom</label>
                <input required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} /></div>
              <div className="form-group"><label>URL de base</label>
                <input required value={form.urlBase} onChange={(e) => setForm({ ...form, urlBase: e.target.value })} /></div>
              <div className="form-row">
                <div className="form-group"><label>Type API</label>
                  <input value={form.typeApi} onChange={(e) => setForm({ ...form, typeApi: e.target.value })} /></div>
                <div className="form-group"><label>Limite req./jour</label>
                  <input type="number" value={form.limiteRequetes}
                    onChange={(e) => setForm({ ...form, limiteRequetes: e.target.value })}
                    placeholder="vide = illimité" /></div>
              </div>
              <div className="form-group"><label>Clé API (optionnel)</label>
                <input type="password" value={form.cleApi} onChange={(e) => setForm({ ...form, cleApi: e.target.value })} /></div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? '…' : 'Ajouter'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}