// src/pages/admin/AdminProfilPage.jsx
// Design identique à ProfilPage utilisateur — même classes CSS
// Sans Navbar/Footer, intégré dans le layout admin

import { useState } from 'react';
import { updateProfil, changePassword } from '../../services/ProfilServices';
import { useAuth } from '../../context/useAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faLock,
  faFloppyDisk,
  faKey,
  faEye,
  faEyeSlash,
  faUserShield,
  faShield,
} from '@fortawesome/free-solid-svg-icons';

import '../../pages/Profil/ProfilPage.css';

export default function AdminProfilPage() {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    nom:    user?.nom    || '',
    prenom: user?.prenom || '',
  });

  const [passwords, setPasswords] = useState({
    ancien:    '',
    nouveau:   '',
    confirmer: '',
  });

  const [showAncien,    setShowAncien]    = useState(false);
  const [showNouveau,   setShowNouveau]   = useState(false);
  const [showConfirmer, setShowConfirmer] = useState(false);

  const [loadingProfil,   setLoadingProfil]   = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [successProfil,   setSuccessProfil]   = useState('');
  const [errorProfil,     setErrorProfil]     = useState('');
  const [successPassword, setSuccessPassword] = useState('');
  const [errorPassword,   setErrorPassword]   = useState('');

  const handleUpdateProfil = async (e) => {
    e.preventDefault();
    setLoadingProfil(true);
    setErrorProfil('');
    setSuccessProfil('');
    try {
      const updated = await updateProfil(user.id, form.nom, form.prenom, user.profil);
      updateUser({ nom: updated.nom, prenom: updated.prenom });
      setSuccessProfil('Profil mis à jour avec succès !');
      setTimeout(() => setSuccessProfil(''), 3000);
    } catch {
      setErrorProfil('Erreur lors de la mise à jour');
    } finally {
      setLoadingProfil(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErrorPassword('');
    setSuccessPassword('');

    if (passwords.nouveau !== passwords.confirmer) {
      setErrorPassword('Les nouveaux mots de passe ne correspondent pas');
      return;
    }
    if (passwords.nouveau.length < 6) {
      setErrorPassword('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoadingPassword(true);
    try {
      await changePassword(user.id, passwords.ancien, passwords.nouveau);
      setSuccessPassword('Mot de passe modifié avec succès !');
      setPasswords({ ancien: '', nouveau: '', confirmer: '' });
      setTimeout(() => setSuccessPassword(''), 3000);
    } catch (err) {
      setErrorPassword(err.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoadingPassword(false);
    }
  };

  const strengthClass =
    passwords.nouveau.length === 0 ? '' :
    passwords.nouveau.length < 6   ? 'weak' :
    passwords.nouveau.length < 10  ? 'medium' : 'strong';

  const strengthLabel = { weak: 'Faible', medium: 'Moyen', strong: 'Fort' };

  return (
    // ← pas de .profil-page ni Navbar/Footer — juste le contenu
    <div className="profil-container" style={{ maxWidth: '100%', padding: 0, margin: 0 }}>

      {/* ── En-tête identité — même style que ProfilPage ── */}
      <div className="profil-header">
        <div className="profil-avatar">
          <FontAwesomeIcon icon={faUserShield} />
        </div>
        <div className="profil-header-info">
          <h1 className="profil-name">
            {user?.prenom} {user?.nom}
          </h1>
          <p className="profil-email">
            <FontAwesomeIcon icon={faEnvelope} />
            {user?.email}
          </p>
          <div className="profil-tags">
            <span className="profil-tag tag-profil">
              <FontAwesomeIcon icon={faShield} />
              Administrateur
            </span>
            <span className="profil-tag tag-role">
              <FontAwesomeIcon icon={faUserShield} />
              Accès total
            </span>
          </div>
        </div>
      </div>

      {/* ── Grille 2 colonnes — même structure que ProfilPage ── */}
      <div className="profil-grid">

        {/* ── Informations personnelles ── */}
        <div className="profil-card">
          <div className="profil-card-header">
            <FontAwesomeIcon icon={faUser} />
            <h2>Informations personnelles</h2>
          </div>

          {errorProfil   && <div className="alert alert-error">{errorProfil}</div>}
          {successProfil && <div className="alert alert-success">{successProfil}</div>}

          <form onSubmit={handleUpdateProfil} className="profil-form">

            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Nom</label>
                <input
                  className="input-field"
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  placeholder="Votre nom"
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label">Prénom</label>
                <input
                  className="input-field"
                  type="text"
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                  placeholder="Votre prénom"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">
                <FontAwesomeIcon icon={faEnvelope} /> Email
              </label>
              <input
                className="input-field input-disabled"
                type="email"
                value={user?.email || ''}
                disabled
              />
              <span className="input-hint">L'email ne peut pas être modifié</span>
            </div>

            <div className="input-group">
              <label className="input-label">
                <FontAwesomeIcon icon={faUserShield} /> Rôle
              </label>
              <input
                className="input-field input-disabled"
                value="Administrateur"
                disabled
              />
            </div>

            <button
              type="submit"
              className="btn-save"
              disabled={loadingProfil}
            >
              <FontAwesomeIcon icon={faFloppyDisk} />
              {loadingProfil ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </form>
        </div>

        {/* ── Changer le mot de passe ── */}
        <div className="profil-card">
          <div className="profil-card-header">
            <FontAwesomeIcon icon={faLock} />
            <h2>Changer le mot de passe</h2>
          </div>

          {errorPassword   && <div className="alert alert-error">{errorPassword}</div>}
          {successPassword && <div className="alert alert-success">{successPassword}</div>}

          <form onSubmit={handleChangePassword} className="profil-form">

            <div className="input-group">
              <label className="input-label">Ancien mot de passe</label>
              <div className="input-password-wrapper">
                <input
                  className="input-field"
                  type={showAncien ? 'text' : 'password'}
                  value={passwords.ancien}
                  onChange={(e) => setPasswords({ ...passwords, ancien: e.target.value })}
                  placeholder="Votre mot de passe actuel"
                  required
                />
                <button type="button" className="btn-eye" onClick={() => setShowAncien(!showAncien)}>
                  <FontAwesomeIcon icon={showAncien ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Nouveau mot de passe</label>
              <div className="input-password-wrapper">
                <input
                  className="input-field"
                  type={showNouveau ? 'text' : 'password'}
                  value={passwords.nouveau}
                  onChange={(e) => setPasswords({ ...passwords, nouveau: e.target.value })}
                  placeholder="Minimum 6 caractères"
                  required
                />
                <button type="button" className="btn-eye" onClick={() => setShowNouveau(!showNouveau)}>
                  <FontAwesomeIcon icon={showNouveau ? faEyeSlash : faEye} />
                </button>
              </div>
              {strengthClass && (
                <div className="password-strength">
                  <div className={`strength-bar ${strengthClass}`} />
                  <span className="strength-label">{strengthLabel[strengthClass]}</span>
                </div>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">Confirmer le nouveau mot de passe</label>
              <div className="input-password-wrapper">
                <input
                  className="input-field"
                  type={showConfirmer ? 'text' : 'password'}
                  value={passwords.confirmer}
                  onChange={(e) => setPasswords({ ...passwords, confirmer: e.target.value })}
                  placeholder="Répétez le nouveau mot de passe"
                  required
                />
                <button type="button" className="btn-eye" onClick={() => setShowConfirmer(!showConfirmer)}>
                  <FontAwesomeIcon icon={showConfirmer ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-password"
              disabled={loadingPassword}
            >
              <FontAwesomeIcon icon={faKey} />
              {loadingPassword ? 'Modification...' : 'Modifier le mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}