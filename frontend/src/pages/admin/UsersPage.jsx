// src/pages/admin/UsersPage.jsx
// Gestion des utilisateurs avec icônes Font Awesome

import { useEffect, useState } from 'react';
import {
  getUsers, createUser, updateUser, desactiverUser, supprimerUser,
} from '../../services/adminService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserPlus, faPenToSquare, faUserSlash, faTrashCan,
  faMagnifyingGlass, faUsers, faXmark, faFloppyDisk,
  faCrown, faUser,
} from '@fortawesome/free-solid-svg-icons';
import './AdminPages.css';

const ROLES   = ['ROLE_USER', 'ROLE_ADMIN'];
const STATUTS = ['ACTIF', 'INACTIF'];
const EMPTY   = { nom: '', email: '', motDePasse: '', role: 'ROLE_USER', statut: 'ACTIF' };

function initials(nom = '') {
  return nom.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

export default function UsersPage() {
  const [users,    setUsers]   = useState([]);
  const [loading,  setLoading] = useState(false);
  const [search,   setSearch]  = useState('');
  const [modal,    setModal]   = useState(null);
  const [editUser, setEdit]    = useState(null);
  const [form,     setForm]    = useState(EMPTY);
  const [saving,   setSaving]  = useState(false);
  const [error,    setError]   = useState(null);

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
  function closeModal() { setModal(null); setError(null); }

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
      closeModal();
      setSearch((s) => s);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDesactiver(id) {
    if (!window.confirm('Désactiver cet utilisateur ?')) return;
    await desactiverUser(id);
    setSearch((s) => s);
  }

  async function handleSupprimer(id) {
    if (!window.confirm('Supprimer définitivement cet utilisateur ?')) return;
    await supprimerUser(id);
    setSearch((s) => s);
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">
          <FontAwesomeIcon icon={faUsers} style={{ marginRight: 10, color: '#2563eb' }} />
          Gestion des utilisateurs
        </h1>
        <p className="page-sub">Créer, modifier ou désactiver les comptes</p>
      </div>

      {error && (
        <div className="alert alert--error">
          {error}
          <button onClick={() => setError(null)}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      )}

      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div style={{ position: 'relative' }}>
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 13 }}
            />
            <input
              className="search-input"
              style={{ paddingLeft: 34 }}
              placeholder="Rechercher par nom ou email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="text-muted" style={{ fontSize: 13 }}>
            {users.length} utilisateur(s)
          </span>
        </div>
        <div className="toolbar-right">
          <button className="btn btn--primary" onClick={openCreate}>
            <FontAwesomeIcon icon={faUserPlus} /> Ajouter un utilisateur
          </button>
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────── */}
      {loading ? (
        <p className="page-loading">Chargement…</p>
      ) : (
        <div className="card table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Inscrit le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="user-cell">
                      <span className="avatar">{initials(u.nom)}</span>
                      <div>
                        <div style={{ fontWeight: 500, color: '#1e3a5f' }}>{u.nom}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${u.role === 'ROLE_ADMIN' ? 'badge--purple' : 'badge--blue'}`}>
                      <FontAwesomeIcon
                        icon={u.role === 'ROLE_ADMIN' ? faCrown : faUser}
                        style={{ marginRight: 5 }}
                      />
                      {u.role === 'ROLE_ADMIN' ? 'Admin' : 'Utilisateur'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.statut === 'ACTIF' ? 'badge--green' : 'badge--gray'}`}>
                      {u.statut}
                    </span>
                  </td>
                  <td className="text-muted">{fmt(u.createdAt)}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn btn--sm btn--blue" onClick={() => openEdit(u)}>
                        <FontAwesomeIcon icon={faPenToSquare} /> Modifier
                      </button>
                      {u.statut === 'ACTIF' && (
                        <button className="btn btn--sm btn--warn" onClick={() => handleDesactiver(u.id)}>
                          <FontAwesomeIcon icon={faUserSlash} /> Désactiver
                        </button>
                      )}
                      <button className="btn btn--sm btn--danger" onClick={() => handleSupprimer(u.id)}>
                        <FontAwesomeIcon icon={faTrashCan} /> Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="empty-row">Aucun utilisateur trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          MODAL
      ══════════════════════════════════════════════ */}
      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">
                <FontAwesomeIcon
                  icon={modal === 'create' ? faUserPlus : faPenToSquare}
                  style={{ marginRight: 8, color: '#2563eb' }}
                />
                {modal === 'create' ? 'Ajouter un utilisateur' : "Modifier l'utilisateur"}
              </h2>
              <button className="modal-close" onClick={closeModal}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div className="alert alert--error">
                    {error}
                    <button type="button" onClick={() => setError(null)}>
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Nom complet</label>
                  <input
                    className="form-input"
                    placeholder="Jean Dupont"
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Adresse email</label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="jean@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                {modal === 'create' && (
                  <div className="form-group">
                    <label className="form-label">Mot de passe</label>
                    <input
                      className="form-input"
                      type="password"
                      placeholder="••••••••"
                      value={form.motDePasse}
                      onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
                      required
                    />
                  </div>
                )}

                <div className="two-col" style={{ gap: 12, marginBottom: 0 }}>
                  <div className="form-group">
                    <label className="form-label">Rôle</label>
                    <select
                      className="form-select"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r === 'ROLE_ADMIN' ? 'Administrateur' : 'Utilisateur'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Statut</label>
                    <select
                      className="form-select"
                      value={form.statut}
                      onChange={(e) => setForm({ ...form, statut: e.target.value })}
                    >
                      {STATUTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn" onClick={closeModal}>
                  <FontAwesomeIcon icon={faXmark} /> Annuler
                </button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  <FontAwesomeIcon icon={faFloppyDisk} />
                  {saving ? ' Enregistrement…' : modal === 'create' ? ' Créer' : ' Enregistrer'}
                </button>
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
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}