import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { getProjectById } from '../../services/ProjectServices'
import {
    getMembres,
    inviterMembre,
    modifierRole,
    retirerMembre,
    getMonRole,
} from '../../services/CollaborationService'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faArrowLeft, faUsers, faUserPlus, faTrash,
    faCrown, faPen, faEye, faCircleNotch,
    faCheckCircle, faTimesCircle, faFolderOpen,
} from '@fortawesome/free-solid-svg-icons'
import './CollaborationPage.css'

export default function CollaborationPage() {
    const { projetId } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()

    // ── États page ────────────────────────────────────────────────────────
    const [projet, setProjet] = useState(null)
    const [membres, setMembres] = useState([])
    const [monRole, setMonRole] = useState(null)
    const [pageLoading, setPageLoading] = useState(true)

    // ── États formulaire invitation ───────────────────────────────────────
    const [email, setEmail] = useState('')
    const [roleChoisi, setRoleChoisi] = useState('EDITEUR')
    const [inviting, setInviting] = useState(false)

    // ── Message feedback ──────────────────────────────────────────────────
    const [message, setMessage] = useState(null)  // { text, type:'ok'|'error' }

    const estProprietaire = monRole === 'PROPRIETAIRE'

    // ── Chargement initial ────────────────────────────────────────────────
    useEffect(() => {
        if (!user?.id || !projetId) return
        let ignore = false

        async function init() {
            setPageLoading(true)
            try {
                const [projetData, role, membresData] = await Promise.all([
                    getProjectById(projetId),
                    getMonRole(projetId, user.id),
                    getMembres(projetId),
                ])
                if (ignore) return
                setProjet(projetData)
                setMonRole(role)
                setMembres(membresData)
            } catch {
                if (!ignore) afficherMessage('Erreur lors du chargement de la page.', 'error')
            } finally {
                if (!ignore) setPageLoading(false)
            }
        }

        init()
        return () => { ignore = true }
    }, [projetId, user])

    // ── Helpers ───────────────────────────────────────────────────────────
    function afficherMessage(text, type = 'ok') {
        setMessage({ text, type })
        setTimeout(() => setMessage(null), 4000)
    }

    function labelRole(role) {
        if (role === 'PROPRIETAIRE') return 'Propriétaire'
        if (role === 'EDITEUR') return 'Éditeur'
        return 'Lecteur'
    }

    function iconeRole(role) {
        if (role === 'PROPRIETAIRE') return faCrown
        if (role === 'EDITEUR') return faPen
        return faEye
    }

    function classBadge(role) {
        if (role === 'PROPRIETAIRE') return 'cp-badge cp-badge--owner'
        if (role === 'EDITEUR') return 'cp-badge cp-badge--editor'
        return 'cp-badge cp-badge--reader'
    }

    function initiales(prenom, nom) {
        return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase()
    }

    // ── Inviter ───────────────────────────────────────────────────────────
    async function handleInviter(e) {
        e.preventDefault()
        if (!email.trim()) return
        setInviting(true)
        try {
            const nouveau = await inviterMembre(projetId, email.trim(), roleChoisi)
            setMembres(prev => [...prev, nouveau])
            setEmail('')
            afficherMessage(`✓ ${nouveau.prenom} ${nouveau.nom} a été ajouté en tant que ${labelRole(roleChoisi)}.`, 'ok')
        } catch (err) {
            const msg = err.response?.data?.message || "Aucun compte trouvé pour cet email."
            afficherMessage(msg, 'error')
        } finally {
            setInviting(false)
        }
    }

    // ── Modifier rôle ─────────────────────────────────────────────────────
    async function handleModifierRole(membreId, nouveauRole) {
        try {
            const updated = await modifierRole(membreId, nouveauRole)
            setMembres(prev => prev.map(m => m.id === membreId ? updated : m))
            afficherMessage('Rôle mis à jour.', 'ok')
        } catch (err) {
            afficherMessage(err.response?.data?.message || 'Erreur lors de la modification.', 'error')
        }
    }

    // ── Retirer membre ────────────────────────────────────────────────────
    async function handleRetirer(membreId, nomComplet) {
        if (!window.confirm(`Retirer ${nomComplet} du projet ?`)) return
        try {
            await retirerMembre(membreId)
            setMembres(prev => prev.filter(m => m.id !== membreId))
            afficherMessage(`${nomComplet} a été retiré du projet.`, 'ok')
        } catch (err) {
            afficherMessage(err.response?.data?.message || 'Erreur lors de la suppression.', 'error')
        }
    }

    // ── Affichage chargement ──────────────────────────────────────────────
    if (pageLoading) {
        return (
            <div className="cp-loading">
                <FontAwesomeIcon icon={faCircleNotch} spin size="2x" />
                <p>Chargement...</p>
            </div>
        )
    }

    // ── Rendu principal ───────────────────────────────────────────────────
    return (
        <div className="cp-page">

            {/* ── Bouton retour ── */}
            <button className="cp-back" onClick={() => navigate(-1)}>
                <FontAwesomeIcon icon={faArrowLeft} />
                Retour au projet
            </button>

            {/* ── En-tête projet ── */}
            <div className="cp-header">
                <div className="cp-header-icon">
                    <FontAwesomeIcon icon={faFolderOpen} />
                </div>
                <div>
                    <h1 className="cp-title">{projet?.nomProjet}</h1>
                    <p className="cp-subtitle">Gestion des collaborateurs</p>
                </div>
                {monRole && (
                    <span className={classBadge(monRole)}>
                        <FontAwesomeIcon icon={iconeRole(monRole)} />
                        {labelRole(monRole)}
                    </span>
                )}
            </div>

            {/* ── Message feedback ── */}
            {message && (
                <div className={`cp-alert cp-alert--${message.type}`}>
                    <FontAwesomeIcon icon={message.type === 'ok' ? faCheckCircle : faTimesCircle} />
                    <span>{message.text}</span>
                    <button onClick={() => setMessage(null)}>×</button>
                </div>
            )}

            <div className="cp-body">

                {/* ════════════════════════════════════════════════════
                    COLONNE GAUCHE — Formulaire d'invitation
                ════════════════════════════════════════════════════ */}
                {estProprietaire && (
                    <div className="cp-card cp-invite-card">
                        <div className="cp-card-title">
                            <FontAwesomeIcon icon={faUserPlus} />
                            Inviter un collaborateur
                        </div>
                        <p className="cp-card-desc">
                            Saisissez l'email d'un utilisateur déjà inscrit sur BiblioApp.
                        </p>

                        <form onSubmit={handleInviter} className="cp-form">
                            {/* Email */}
                            <div className="cp-field">
                                <label className="cp-label">Adresse email *</label>
                                <input
                                    type="email"
                                    className="cp-input"
                                    placeholder="ex: binome@email.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    autoComplete="off"
                                />
                            </div>

                            {/* Rôle */}
                            <div className="cp-field">
                                <label className="cp-label">Rôle *</label>
                                <div className="cp-role-options">
                                    <label className={`cp-role-option ${roleChoisi === 'EDITEUR' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="EDITEUR"
                                            checked={roleChoisi === 'EDITEUR'}
                                            onChange={() => setRoleChoisi('EDITEUR')}
                                        />
                                        <FontAwesomeIcon icon={faPen} />
                                        <div>
                                            <strong>Éditeur</strong>
                                            <span>Peut ajouter, annoter et modifier des articles</span>
                                        </div>
                                    </label>

                                    <label className={`cp-role-option ${roleChoisi === 'LECTEUR' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="LECTEUR"
                                            checked={roleChoisi === 'LECTEUR'}
                                            onChange={() => setRoleChoisi('LECTEUR')}
                                        />
                                        <FontAwesomeIcon icon={faEye} />
                                        <div>
                                            <strong>Lecteur</strong>
                                            <span>Consultation uniquement, aucune modification</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <button type="submit" className="cp-btn-submit" disabled={inviting}>
                                {inviting
                                    ? <><FontAwesomeIcon icon={faCircleNotch} spin /> Invitation en cours...</>
                                    : <><FontAwesomeIcon icon={faUserPlus} /> Inviter</>
                                }
                            </button>
                        </form>
                    </div>
                )}

                {/* ════════════════════════════════════════════════════
                    COLONNE DROITE — Liste des membres
                ════════════════════════════════════════════════════ */}
                <div className={`cp-card cp-members-card ${!estProprietaire ? 'cp-full-width' : ''}`}>
                    <div className="cp-card-title">
                        <FontAwesomeIcon icon={faUsers} />
                        Membres du projet
                        <span className="cp-members-count">{membres.length}</span>
                    </div>

                    {membres.length === 0 ? (
                        <p className="cp-empty">Aucun membre pour l&apos;instant.</p>
                    ) : (
                        <ul className="cp-members-list">
                            {membres.map(m => (
                                <li key={m.id} className="cp-member-item">
                                    {/* Avatar */}
                                    <div className="cp-avatar">
                                        {initiales(m.prenom, m.nom)}
                                    </div>

                                    {/* Infos */}
                                    <div className="cp-member-info">
                                        <span className="cp-member-name">
                                            {m.prenom} {m.nom}
                                            {m.utilisateurId === user?.id && (
                                                <span className="cp-you-tag">Vous</span>
                                            )}
                                        </span>
                                        <span className="cp-member-email">{m.email}</span>
                                    </div>

                                    {/* Badge rôle */}
                                    <span className={classBadge(m.role)}>
                                        <FontAwesomeIcon icon={iconeRole(m.role)} />
                                        {labelRole(m.role)}
                                    </span>

                                    {/* Actions — propriétaire seulement, pas sur lui-même */}
                                    {estProprietaire && m.role !== 'PROPRIETAIRE' && (
                                        <div className="cp-member-actions">
                                            <select
                                                className="cp-role-select"
                                                value={m.role}
                                                onChange={e => handleModifierRole(m.id, e.target.value)}
                                                title="Changer le rôle"
                                            >
                                                <option value="EDITEUR">Éditeur</option>
                                                <option value="LECTEUR">Lecteur</option>
                                            </select>
                                            <button
                                                className="cp-btn-remove"
                                                title={`Retirer ${m.prenom} du projet`}
                                                onClick={() => handleRetirer(m.id, `${m.prenom} ${m.nom}`)}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>
        </div>
    )
}