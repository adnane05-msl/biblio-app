// src/pages/admin/UsersPage.jsx
import { useEffect, useState } from 'react';
import {
  getUsers, createUser, updateUser, desactiverUser, supprimerUser,
} from '../../services/adminService';
import './AdminPages.css';

const ROLES   = ['ROLE_USER', 'ROLE_ADMIN'];
const STATUTS = ['ACTIF', 'INACTIF'];
const EMPTY   = { nom: '', email: '', motDePasse: '', role: 'ROLE_USER', statut: 'ACTIF' };

export default function UsersPage() {
  const [users,    setUsers]   = useState([]);
  const [loading,  setLoading] = useState(false);
  const [search,   setSearch]  = useState('');
  const [modal,    setModal]   = useState(null);
  const [editUser, setEdit]    = useState(null);
  const [form,     setForm]    = useState(EMPTY);
  const [saving,   setSaving]  = useState(false);
  const [error,    setError]   = useState(null);

  // ✅ Inline dans useEffect — aucune fonction externe appelée, aucun setState synchrone
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getUsers(search);
        if (alive) setUsers(data);
      } catch (e) {
        if (alive) setError(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [search]);

  function openCreate() { setForm(EMPTY); setEdit(null); setModal('create'); }
  function openEdit(u) {
    setForm({ nom: u.nom, email: u.email, motDePasse: '', role: u.role, statut: u.statut });
    setEdit(u);
    setModal('edit');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'create') {
        await createUser(form);
      } else {
        const { motDePasse, ...rest } = form; void motDePasse;
        await updateUser(editUser.id, rest);
      }
      setModal(null);
      // Forcer un re-fetch en changeant la dépendance via un trick : on toggle search
      setSearch((s) => s);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDesactiver(id) {
    if (!window.confirm('Désactiver ?')) return;
    await desactiverUser(id);
    setSearch((s) => s);
  }

  async function handleSupprimer(id) {
    if (!window.confirm('Supprimer définitivement ?')) return;
    await supprimerUser(id);
    setSearch((s) => s);
  }

  return (
    <div className="admin-page">
      <h1 className="page-title">Gestion des utilisateurs</h1>
      <p className="page-sub">Créer, modifier ou désactiver les comptes</p>

      {error && <div className="alert alert--error">{error}<button onClick={() => setError(null)}>✕</button></div>}

      <div className="toolbar">
        <input className="search-input" placeholder="Rechercher…" value={search}
          onChange={(e) => setSearch(e.target.value)} />
        <button className="btn btn--primary" onClick={openCreate}>+ Ajouter</button>
      </div>

      {loading ? <p className="page-loading">Chargement…</p> : (
        <div className="card table-card">
          <table className="admin-table">
            <thead><tr>
              <th>Nom</th><th>Email</th><th>Rôle</th><th>Statut</th><th>Projets</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td><div className="user-cell">
                    <span className="avatar avatar--sm">{initials(u.nom)}</span>{u.nom}
                  </div></td>
                  <td className="text-muted">{u.email}</td>
                  <td><span className={`badge badge--${u.role === 'ROLE_ADMIN' ? 'purple' : 'teal'}`}>{u.role}</span></td>
                  <td><span className={`badge badge--${u.statut === 'ACTIF' ? 'green' : 'gray'}`}>{u.statut}</span></td>
                  <td className="text-muted">{u.nombreProjets}</td>
                  <td><div className="action-btns">
                    <button className="btn btn--sm" onClick={() => openEdit(u)}>✏️</button>
                    <button className="btn btn--sm btn--warn" onClick={() => handleDesactiver(u.id)}>⏸</button>
                    <button className="btn btn--sm btn--danger" onClick={() => handleSupprimer(u.id)}>🗑</button>
                  </div></td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={6} className="empty-row">Aucun utilisateur</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{modal === 'create' ? 'Nouvel utilisateur' : 'Modifier'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Nom</label>
                <input required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} /></div>
              <div className="form-group"><label>Email</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              {modal === 'create' && (
                <div className="form-group"><label>Mot de passe</label>
                  <input required type="password" value={form.motDePasse}
                    onChange={(e) => setForm({ ...form, motDePasse: e.target.value })} /></div>
              )}
              <div className="form-row">
                <div className="form-group"><label>Rôle</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    {ROLES.map((r) => <option key={r}>{r}</option>)}</select></div>
                <div className="form-group"><label>Statut</label>
                  <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })}>
                    {STATUTS.map((s) => <option key={s}>{s}</option>)}</select></div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setModal(null)}>Annuler</button>
                <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? '…' : 'Confirmer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function initials(n) { return n?.split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase() || '?'; }