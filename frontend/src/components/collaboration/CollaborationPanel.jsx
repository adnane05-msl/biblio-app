import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faUserPlus, faTrash, faCrown, faPen, faEye,
    faCircleNotch, faCheckCircle, faTimesCircle, faUsers
} from '@fortawesome/free-solid-svg-icons'
import {
    getMembres,
    inviterMembre,
    modifierRole,
    retirerMembre,
} from '../../services/CollaborationService'
import './CollaborationPanel.css'

export default function CollaborationPanel({ projetId, monRole }) {
    const [membres, setMembres] = useState([])
    const [loading, setLoading] = useState(true)
    const [email, setEmail] = useState('')
    const [roleInvit, setRoleInvit] = useState('EDITEUR')
    const [inviting, setInviting] = useState(false)
    const [message, setMessage] = useState(null)

    const estProprietaire = monRole === 'PROPRIETAIRE'

    // ── Charger les membres — logique inline dans l'effet ──────────────────
    useEffect(() => {
        let ignore = false   // flag pour éviter les setState sur composant démonté

        async function load() {
            setLoading(true)
            try {
                const data = await getMembres(projetId)
                if (!ignore) setMembres(data)
            } catch {
                if (!ignore) setMessage({ text: 'Erreur lors du chargement des membres.', type: 'error' })
            } finally {
                if (!ignore) setLoading(false)
            }
        }

        load()

        return () => { ignore = true }
    }, [projetId])

    // ── Inviter un nouveau membre ──────────────────────────────────────────
    async function handleInviter(e) {
        e.preventDefault()
        if (!email.trim()) return
        setInviting(true)
        setMessage(null)
        try {
            const nouveau = await inviterMembre(projetId, email.trim(), roleInvit)
            setMembres(prev => [...prev, nouveau])
            setEmail('')
            setMessage({ text: `${nouveau.prenom} ${nouveau.nom} a été invité avec succès.`, type: 'ok' })
        } catch (err) {
            const msg = err.response?.data?.message || "Erreur lors de l'invitation."
            setMessage({ text: msg, type: 'error' })
        } finally {
            setInviting(false)
        }
    }

    // ── Modifier le rôle d'un membre ──────────────────────────────────────
    async function handleModifierRole(membreId, nouveauRole) {
        try {
            const updated = await modifierRole(membreId, nouveauRole)
            setMembres(prev => prev.map(m => m.id === membreId ? updated : m))
        } catch (err) {
            const msg = err.response?.data?.message || 'Erreur lors de la modification du rôle.'
            setMessage({ text: msg, type: 'error' })
        }
    }

    // ── Retirer un membre ─────────────────────────────────────────────────
    async function handleRetirer(membreId, nomMembre) {
        if (!window.confirm(`Retirer ${nomMembre} du projet ?`)) return
        try {
            await retirerMembre(membreId)
            setMembres(prev => prev.filter(m => m.id !== membreId))
            setMessage({ text: `${nomMembre} a été retiré du projet.`, type: 'ok' })
        } catch (err) {
            const msg = err.response?.data?.message || 'Erreur lors de la suppression.'
            setMessage({ text: msg, type: 'error' })
        }
    }

    function iconeRole(role) {
        if (role === 'PROPRIETAIRE') return faCrown
        if (role === 'EDITEUR') return faPen
        return faEye
    }

    function classBadge(role) {
        if (role === 'PROPRIETAIRE') return 'badge-proprietaire'
        if (role === 'EDITEUR') return 'badge-editeur'
        return 'badge-lecteur'
    }

    return (
        <div className="collab-panel">
            <div className="collab-header">
                <FontAwesomeIcon icon={faUsers} />
                <h3>Collaborateurs</h3>
                <span className="collab-count">{membres.length}</span>
            </div>

            {message && (
                <div className={`collab-message ${message.type}`}>
                    <FontAwesomeIcon icon={message.type === 'ok' ? faCheckCircle : faTimesCircle} />
                    {message.text}
                    <button className="collab-message-close" onClick={() => setMessage(null)}>×</button>
                </div>
            )}

            {estProprietaire && (
                <form className="collab-invite-form" onSubmit={handleInviter}>
                    <div className="collab-invite-row">
                        <input
                            type="email"
                            className="collab-input"
                            placeholder="Email du collaborateur..."
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                        <select
                            className="collab-select"
                            value={roleInvit}
                            onChange={e => setRoleInvit(e.target.value)}
                        >
                            <option value="EDITEUR">Éditeur</option>
                            <option value="LECTEUR">Lecteur</option>
                        </select>
                        <button type="submit" className="collab-btn-invite" disabled={inviting}>
                            {inviting
                                ? <FontAwesomeIcon icon={faCircleNotch} spin />
                                : <><FontAwesomeIcon icon={faUserPlus} /> Inviter</>
                            }
                        </button>
                    </div>
                    <p className="collab-hint">
                        <strong>Éditeur</strong> : peut ajouter et annoter des articles.&nbsp;
                        <strong>Lecteur</strong> : consultation uniquement.
                    </p>
                </form>
            )}

            {loading ? (
                <div className="collab-loading">
                    <FontAwesomeIcon icon={faCircleNotch} spin /> Chargement...
                </div>
            ) : membres.length === 0 ? (
                <p className="collab-empty">Aucun collaborateur pour l&apos;instant.</p>
            ) : (
                <ul className="collab-list">
                    {membres.map(m => (
                        <li key={m.id} className="collab-item">
                            <div className="collab-avatar">
                                {m.prenom?.[0]?.toUpperCase()}{m.nom?.[0]?.toUpperCase()}
                            </div>
                            <div className="collab-info">
                                <span className="collab-name">{m.prenom} {m.nom}</span>
                                <span className="collab-email">{m.email}</span>
                            </div>
                            <span className={`collab-badge ${classBadge(m.role)}`}>
                                <FontAwesomeIcon icon={iconeRole(m.role)} />
                                {m.role === 'PROPRIETAIRE' ? 'Propriétaire'
                                    : m.role === 'EDITEUR' ? 'Éditeur' : 'Lecteur'}
                            </span>

                            {estProprietaire && m.role !== 'PROPRIETAIRE' && (
                                <div className="collab-actions">
                                    <select
                                        className="collab-role-select"
                                        value={m.role}
                                        onChange={e => handleModifierRole(m.id, e.target.value)}
                                    >
                                        <option value="EDITEUR">Éditeur</option>
                                        <option value="LECTEUR">Lecteur</option>
                                    </select>
                                    <button
                                        className="collab-btn-retirer"
                                        title="Retirer du projet"
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
    )
}