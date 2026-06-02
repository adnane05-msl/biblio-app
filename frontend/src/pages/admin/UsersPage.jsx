import { useEffect, useState } from 'react';
import {
  getUsers, createUser, updateUser, desactiverUser, supprimerUser,
} from '../../services/adminService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserPlus, faUserPen, faUserXmark, faUserMinus,
  faMagnifyingGlass, faUsersViewfinder, faXmark, faFloppyDisk,
  faUserShield, faUser, faCircleCheck, faCircleXmark,
  faEnvelope, faIdCard,
} from '@fortawesome/free-solid-svg-icons';
import './AdminPages.css';

const ROLES   = ['ROLE_USER', 'ROLE_ADMIN'];
const STATUTS = ['ACTIF', 'INACTIF'];
const EMPTY   = { nom: '', email: '', role: 'ROLE_USER', statut: 'ACTIF' };

function initials(nom = '') {
  return nom.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

// dateInscription arrive comme "2026-04-27" (LocalDate)
function formatDate(d) {
  if (!d) return '—';
  const [year, month, day] = d.toString().split('-');
  return `${day}/${month}/${year}`;
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
    setForm({
      nom:    u.nom    ?? '',
      email:  u.email  ?? '',
      role:   u.role   ?? 'ROLE_USER',
      statut: u.statut ?? 'ACTIF',
    });
    setEdit(u);
    setModal('edit');
  }

  function closeModal() { setModal(null); setError(null); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'create') await createUser(form);
      else await updateUser(editUser.id, form);
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
          <FontAwesomeIcon icon={faUsersViewfinder} style={{ marginRight: 10, color: '#7c3aed' }} />
          Gestion des utilisateurs
        </h1>
        <p className="page-sub">Créer, modifier ou désactiver les comptes</p>
      </div>

      {error && (
        <div className="alert alert--error">
          <FontAwesomeIcon icon={faCircleXmark} style={{ marginRight: 8 }} />
          {error}
          <button onClick={() => setError(null)}><FontAwesomeIcon icon={faXmark} /></button>
        </div>
      )}

      <div className="toolbar">
        <div className="search-box">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="search-box__icon" />
          <input
            className="search-box__input"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-muted">{users.length} utilisateur(s)</span>
        <button className="btn btn--primary" onClick={openCreate}>
          <FontAwesomeIcon icon={faUserPlus} /> Ajouter
        </button>
      </div>

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
              {users.length === 0 ? (
                <tr><td colSpan={5} className="empty-row">Aucun utilisateur trouvé</td></tr>
              ) : users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="user-cell">
                      <span className="avatar">{initials(u.nom)}</span>
                      <div>
                        <div style={{ fontWeight: 500, color: '#1e3a5f' }}>{u.nom}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                          <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: 4 }} />
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge--${u.role === 'ROLE_ADMIN' ? 'purple' : 'blue'}`}>
                      <FontAwesomeIcon
                        icon={u.role === 'ROLE_ADMIN' ? faUserShield : faUser}
                        style={{ marginRight: 5 }}
                      />
                      {u.role === 'ROLE_ADMIN' ? 'Admin' : 'Utilisateur'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge--${u.statut === 'ACTIF' ? 'green' : 'gray'}`}>
                      <FontAwesomeIcon
                        icon={u.statut === 'ACTIF' ? faCircleCheck : faCircleXmark}
                        style={{ marginRight: 5 }}
                      />
                      {u.statut ?? 'ACTIF'}
                    </span>
                  </td>
                  {/* ← dateInscription (vraie date d'inscription) */}
                  <td className="text-muted">{formatDate(u.dateInscription)}</td>
                  <td>
                    <div className="action-btns">
                      <button
                        className="icon-btn icon-btn--blue"
                        title="Modifier"
                        onClick={() => openEdit(u)}
                      >
                        <FontAwesomeIcon icon={faUserPen} />
                      </button>
                      <button
                        className="icon-btn icon-btn--amber"
                        title="Désactiver"
                        onClick={() => handleDesactiver(u.id)}
                      >
                        <FontAwesomeIcon icon={faUserXmark} />
                      </button>
                      <button
                        className="icon-btn icon-btn--red"
                        title="Supprimer"
                        onClick={() => handleSupprimer(u.id)}
                      >
                        <FontAwesomeIcon icon={faUserMinus} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal créer / modifier ───────────────────────────── */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <FontAwesomeIcon
                  icon={modal === 'create' ? faUserPlus : faUserPen}
                  style={{ marginRight: 10, color: '#2563eb' }}
                />
                {modal === 'create' ? 'Nouvel utilisateur' : "Modifier l'utilisateur"}
              </h2>
              <button className="modal-close" onClick={closeModal}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-form">
                {error && (
                  <div className="alert alert--error" style={{ marginBottom: 12 }}>
                    <FontAwesomeIcon icon={faCircleXmark} style={{ marginRight: 8 }} />
                    {error}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">
                    <FontAwesomeIcon icon={faIdCard} style={{ marginRight: 6, color: '#6b7280' }} />
                    Nom complet
                  </label>
                  <input
                    className="form-input"
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    placeholder="Prénom Nom"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: 6, color: '#6b7280' }} />
                    Email
                  </label>
                  <input
                    className="form-input"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@exemple.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FontAwesomeIcon icon={faUserShield} style={{ marginRight: 6, color: '#6b7280' }} />
                    Rôle
                  </label>
                  <select
                    className="form-input"
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

                {modal === 'edit' && (
                  <div className="form-group">
                    <label className="form-label">
                      <FontAwesomeIcon icon={faCircleCheck} style={{ marginRight: 6, color: '#6b7280' }} />
                      Statut
                    </label>
                    <select
                      className="form-input"
                      value={form.statut}
                      onChange={(e) => setForm({ ...form, statut: e.target.value })}
                    >
                      {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                <div className="modal-footer">
                  <button type="button" className="btn btn--ghost" onClick={closeModal}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn--primary" disabled={saving}>
                    <FontAwesomeIcon icon={faFloppyDisk} style={{ marginRight: 6 }} />
                    {saving ? 'Enregistrement…' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}