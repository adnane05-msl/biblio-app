import { useState } from 'react'
import { useAuth } from '../../context/useAuth'
import { updateProfil, changePassword } from '../../services/ProfilServices'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import './ProfilPage.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faUser, faEnvelope, faLock,
    faFloppyDisk, faKey,
    faGraduationCap,faEye, faEyeSlash
} from '@fortawesome/free-solid-svg-icons'

const PROFILS = [
    'Etudiant Licence',
    'Etudiant Master',
    'Doctorant',
    'Chercheur',
    'Enseignant-Chercheur',
]

function ProfilPage() {
    const { user, login } = useAuth()

    // ── État formulaire profil ──
    const [form, setForm] = useState({
        nom:    user?.nom    || '',
        prenom: user?.prenom || '',
        profil: user?.profil || '',
    })

    // ── État formulaire mot de passe ──
    const [passwords, setPasswords] = useState({
        ancien:    '',
        nouveau:   '',
        confirmer: '',
    })

    const [showAncien,   setShowAncien]   = useState(false)
    const [showNouveau,  setShowNouveau]  = useState(false)
    const [showConfirmer,setShowConfirmer]= useState(false)

    // ── États UI ──
    const [loadingProfil,   setLoadingProfil]   = useState(false)
    const [loadingPassword, setLoadingPassword] = useState(false)
    const [successProfil,   setSuccessProfil]   = useState('')
    const [errorProfil,     setErrorProfil]     = useState('')
    const [successPassword, setSuccessPassword] = useState('')
    const [errorPassword,   setErrorPassword]   = useState('')

    // ── Handlers profil ──
    const handleFormChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleUpdateProfil = async (e) => {
        e.preventDefault()
        setLoadingProfil(true)
        setErrorProfil('')
        setSuccessProfil('')

        try {
            const updated = await updateProfil(
                user.id, form.nom,
                form.prenom, form.profil
            )
            // Mettre à jour le contexte avec les nouvelles infos
            login({
                id:     updated.id,
                nom:    updated.nom,
                prenom: updated.prenom,
                email:  updated.email,
                role:   updated.role,
                profil: updated.profil,
            }, updated.token)

            setSuccessProfil('Profil mis à jour avec succès !')
            setTimeout(() => setSuccessProfil(''), 3000)
        } catch {
            setErrorProfil('Erreur lors de la mise à jour')
        } finally {
            setLoadingProfil(false)
        }
    }

    // ── Handlers mot de passe ──
    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value })
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()
        setErrorPassword('')
        setSuccessPassword('')

        if (passwords.nouveau !== passwords.confirmer) {
            setErrorPassword(
                'Les nouveaux mots de passe ne correspondent pas')
            return
        }

        if (passwords.nouveau.length < 6) {
            setErrorPassword(
                'Le nouveau mot de passe doit contenir au moins 6 caractères')
            return
        }

        setLoadingPassword(true)
        try {
            await changePassword(
                user.id,
                passwords.ancien,
                passwords.nouveau
            )
            setSuccessPassword('Mot de passe modifié avec succès !')
            setPasswords({ ancien: '', nouveau: '', confirmer: '' })
            setTimeout(() => setSuccessPassword(''), 3000)
        } catch (err) {
            setErrorPassword(
                err.response?.data?.message ||
                'Erreur lors du changement de mot de passe')
        } finally {
            setLoadingPassword(false)
        }
    }

    return (
        <div className="profil-page">
            <Navbar />

            <div className="profil-container">

                {/* ── En-tête ── */}
                <div className="profil-header">
                    <div className="profil-avatar">
                        <FontAwesomeIcon icon={faUser} />
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
                                <FontAwesomeIcon icon={faGraduationCap} />
                                {user?.profil || 'Profil non défini'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="profil-grid">

                    {/* ── Formulaire infos personnelles ── */}
                    <div className="profil-card">
                        <div className="profil-card-header">
                            <FontAwesomeIcon icon={faUser} />
                            <h2>Informations personnelles</h2>
                        </div>

                        {errorProfil && (
                            <div className="alert alert-error">
                                {errorProfil}
                            </div>
                        )}
                        {successProfil && (
                            <div className="alert alert-success">
                                {successProfil}
                            </div>
                        )}

                        <form
                            onSubmit={handleUpdateProfil}
                            className="profil-form"
                        >
                            <div className="form-row">
                                <div className="input-group">
                                    <label className="input-label">
                                        Nom
                                    </label>
                                    <input
                                        className="input-field"
                                        type="text"
                                        name="nom"
                                        value={form.nom}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">
                                        Prénom
                                    </label>
                                    <input
                                        className="input-field"
                                        type="text"
                                        name="prenom"
                                        value={form.prenom}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="input-label">
                                    Email
                                </label>
                                <input
                                    className="input-field input-disabled"
                                    type="email"
                                    value={user?.email}
                                    disabled
                                />
                                <span className="input-hint">
                                    L'email ne peut pas être modifié
                                </span>
                            </div>

                            <div className="input-group">
                                <label className="input-label">
                                    <FontAwesomeIcon icon={faGraduationCap} />
                                    Profil
                                </label>
                                <select
                                    className="input-field"
                                    name="profil"
                                    value={form.profil}
                                    onChange={handleFormChange}
                                >
                                    <option value="">
                                        -- Choisir votre profil --
                                    </option>
                                    {PROFILS.map(p => (
                                        <option key={p} value={p}>
                                            {p}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* <div className="input-group">
                                <label className="input-label">
                                    <FontAwesomeIcon icon={faCalendar} />
                                    Membre depuis
                                </label>
                                <input
                                    className="input-field input-disabled"
                                    type="text"
                                    value={user?.date_inscription
                                        ? new Date(user.date_inscription)
                                            .toLocaleDateString('fr-FR')
                                        : '—'}
                                    disabled
                                />
                            </div> */}

                            <button
                                type="submit"
                                className="btn-save"
                                disabled={loadingProfil}
                            >
                                <FontAwesomeIcon icon={faFloppyDisk} />
                                {loadingProfil
                                    ? 'Enregistrement...'
                                    : 'Enregistrer les modifications'}
                            </button>
                        </form>
                    </div>

                    {/* ── Formulaire mot de passe ── */}
                    <div className="profil-card">
                        <div className="profil-card-header">
                            <FontAwesomeIcon icon={faLock} />
                            <h2>Changer le mot de passe</h2>
                        </div>

                        {errorPassword && (
                            <div className="alert alert-error">
                                {errorPassword}
                            </div>
                        )}
                        {successPassword && (
                            <div className="alert alert-success">
                                {successPassword}
                            </div>
                        )}

                        <form
                            onSubmit={handleChangePassword}
                            className="profil-form"
                        >
                            <div className="input-group">
                                <label className="input-label">
                                    Ancien mot de passe
                                </label>
                                <div className="input-password-wrapper">
                                    <input
                                        className="input-field"
                                        type={showAncien ? 'text' : 'password'}
                                        name="ancien"
                                        value={passwords.ancien}
                                        onChange={handlePasswordChange}
                                        placeholder="Votre mot de passe actuel"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="btn-eye"
                                        onClick={() =>
                                            setShowAncien(!showAncien)}
                                    >
                                        <FontAwesomeIcon
                                            icon={showAncien
                                                ? faEyeSlash : faEye}
                                        />
                                    </button>
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="input-label">
                                    Nouveau mot de passe
                                </label>
                                <div className="input-password-wrapper">
                                    <input
                                        className="input-field"
                                        type={showNouveau
                                            ? 'text' : 'password'}
                                        name="nouveau"
                                        value={passwords.nouveau}
                                        onChange={handlePasswordChange}
                                        placeholder="Minimum 6 caractères"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="btn-eye"
                                        onClick={() =>
                                            setShowNouveau(!showNouveau)}
                                    >
                                        <FontAwesomeIcon
                                            icon={showNouveau
                                                ? faEyeSlash : faEye}
                                        />
                                    </button>
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="input-label">
                                    Confirmer le nouveau mot de passe
                                </label>
                                <div className="input-password-wrapper">
                                    <input
                                        className={`input-field ${
                                            passwords.confirmer &&
                                            passwords.nouveau !==
                                                passwords.confirmer
                                            ? 'input-error' : ''
                                        }`}
                                        type={showConfirmer
                                            ? 'text' : 'password'}
                                        name="confirmer"
                                        value={passwords.confirmer}
                                        onChange={handlePasswordChange}
                                        placeholder="Répétez le nouveau mot de passe"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="btn-eye"
                                        onClick={() =>
                                            setShowConfirmer(!showConfirmer)}
                                    >
                                        <FontAwesomeIcon
                                            icon={showConfirmer
                                                ? faEyeSlash : faEye}
                                        />
                                    </button>
                                </div>
                                {passwords.confirmer &&
                                    passwords.nouveau !==
                                        passwords.confirmer && (
                                    <span className="input-hint error-hint">
                                        Les mots de passe ne correspondent pas
                                    </span>
                                )}
                            </div>

                            {/* Indicateur de force */}
                            {passwords.nouveau && (
                                <div className="password-strength">
                                    <div className={`strength-bar ${
                                        passwords.nouveau.length < 6
                                            ? 'weak'
                                        : passwords.nouveau.length < 10
                                            ? 'medium'
                                        : 'strong'
                                    }`} />
                                    <span className="strength-label">
                                        {passwords.nouveau.length < 6
                                            ? 'Faible'
                                        : passwords.nouveau.length < 10
                                            ? 'Moyen'
                                        : 'Fort'}
                                    </span>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn-password"
                                disabled={loadingPassword}
                            >
                                <FontAwesomeIcon icon={faKey} />
                                {loadingPassword
                                    ? 'Modification...'
                                    : 'Modifier le mot de passe'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default ProfilPage