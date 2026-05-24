import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register, sendVerificationCode, verifyCode } from '../../services/AuthService'
import { useAuth } from '../../context/useAuth'
import './RegisterPage.css'

function RegisterPage() {
    const navigate = useNavigate()
    const { login } = useAuth()

    // ÉTAPE 1: formulaire inscription (sans email car déjà saisi)
    const [form, setForm] = useState({
        nom: '',
        prenom: '',
        email: '',
        motDePasse: '',
        profil: '',
    })
    
    // Étape 2: Vérification email
    const [step, setStep] = useState(1) // 1: formulaire, 2: vérification code
    const [verificationCode, setVerificationCode] = useState('')
    const [tempEmail, setTempEmail] = useState('') // Email à vérifier
    
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    // Étape 1: Envoyer le code de vérification
    const handleSendCode = async (e) => {
        e.preventDefault()
        
        // Validation simple
        if (!form.email || !form.email.includes('@')) {
            setError('Email valide requis')
            return
        }
        if (!form.nom || !form.prenom || !form.motDePasse || !form.profil) {
            setError('Tous les champs sont requis')
            return
        }
        
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            // Envoyer le code à l'email
            const response = await sendVerificationCode(form.email)
            
            if (response.success) {
                setSuccess('✅ Code envoyé ! Vérifiez votre boîte mail')
                setTempEmail(form.email)
                setStep(2) // Passer à l'étape de vérification
            } else {
                setError(response.message || 'Erreur lors de l\'envoi du code')
            }
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de l'envoi du code")
        } finally {
            setLoading(false)
        }
    }

    // Étape 2: Vérifier le code et compléter l'inscription
    const handleVerifyAndRegister = async (e) => {
        e.preventDefault()
        
        if (!verificationCode || verificationCode.length !== 6) {
            setError('Code à 6 chiffres requis')
            return
        }
        
        setError('')
        setLoading(true)

        try {
            // Vérifier le code
            const verifyResponse = await verifyCode(tempEmail, verificationCode)
            
            if (!verifyResponse.success) {
                setError(verifyResponse.message || 'Code invalide ou expiré')
                setLoading(false)
                return
            }
            
            // Code vérifié, procéder à l'inscription
            const data = await register(
                form.nom,
                form.prenom,
                tempEmail,
                form.motDePasse,
                form.profil,
                verificationCode
            )
            
            login(
                {
                    id: data.id, 
                    email: data.email, 
                    nom: data.nom, 
                    prenom: data.prenom, 
                    role: data.role, 
                    profil: data.profil
                },
                data.token
            )
            navigate('/Projects')
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de l'inscription")
        } finally {
            setLoading(false)
        }
    }

    // Retour à l'étape 1
    const handleBackToForm = () => {
        setStep(1)
        setError('')
        setSuccess('')
        setVerificationCode('')
    }

    // Renvoyer le code
    const handleResendCode = async () => {
        setLoading(true)
        setError('')
        try {
            const response = await sendVerificationCode(tempEmail)
            if (response.success) {
                setSuccess('✅ Nouveau code envoyé !')
            } else {
                setError(response.message || 'Erreur lors du renvoi')
            }
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors du renvoi")
        } finally {
            setLoading(false)
        }
    }

    // ÉTAPE 1 : Formulaire d'inscription
    if (step === 1) {
        return (
            <div className="register-container">
                <div className="register-card">
                    <h1 className="register-title">📚 BiblioApp</h1>
                    <h2 className="register-subtitle">Créer un compte</h2>

                    {error && <div className="register-error">{error}</div>}
                    {success && <div className="register-success">{success}</div>}

                    <form onSubmit={handleSendCode} className="register-form">
                        <div className="form-row">
                            <div className="input-group">
                                <label className="input-label">Nom</label>
                                <input
                                    className="input-field"
                                    type="text"
                                    name="nom"
                                    placeholder="Votre nom"
                                    value={form.nom}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Prénom</label>
                                <input
                                    className="input-field"
                                    type="text"
                                    name="prenom"
                                    placeholder="Votre prénom"
                                    value={form.prenom}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Email</label>
                            <input
                                className="input-field"
                                type="email"
                                name="email"
                                placeholder="votre@email.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Mot de passe</label>
                            <input
                                className="input-field"
                                type="password"
                                name="motDePasse"
                                placeholder="Minimum 6 caractères"
                                value={form.motDePasse}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Profil</label>
                            <select
                                className="input-field"
                                name="profil"
                                value={form.profil}
                                onChange={handleChange}
                                required
                            >
                                <option value="">-- Choisir votre profil --</option>
                                <option value="Etudiant Licence">Étudiant Licence</option>
                                <option value="Etudiant Master">Étudiant Master</option>
                                <option value="Doctorant">Doctorant</option>
                                <option value="Chercheur">Chercheur</option>
                                <option value="Enseignant-Chercheur">Enseignant-Chercheur</option>
                                <option value="Autre">Autre</option>
                            </select>
                        </div>

                        <button className="btn-primary" type="submit" disabled={loading}>
                            {loading ? 'Envoi en cours...' : 'Continuer'}
                        </button>
                    </form>

                    <p className="register-footer">
                        Déjà un compte ?{' '}
                        <Link to="/login">Se connecter</Link>
                    </p>
                </div>
            </div>
        )
    }

    // ÉTAPE 2 : Vérification du code
    return (
        <div className="register-container">
            <div className="register-card">
                <h1 className="register-title">📚 BiblioApp</h1>
                <h2 className="register-subtitle">Vérifiez votre email</h2>

                <div className="verification-info">
                    <p>Un code à 6 chiffres a été envoyé à :</p>
                    <p className="verification-email"><strong>{tempEmail}</strong></p>
                </div>

                {error && <div className="register-error">{error}</div>}
                {success && <div className="register-success">{success}</div>}

                <form onSubmit={handleVerifyAndRegister} className="register-form">
                    <div className="input-group">
                        <label className="input-label">Code de vérification</label>
                        <input
                            className="input-field code-input"
                            type="text"
                            placeholder="123456"
                            maxLength="6"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                            required
                        />
                    </div>

                    <button className="btn-primary" type="submit" disabled={loading}>
                        {loading ? 'Vérification...' : 'Vérifier et s\'inscrire'}
                    </button>

                    <div className="verification-actions">
                        <button type="button" className="btn-link" onClick={handleResendCode} disabled={loading}>
                            Renvoyer le code
                        </button>
                        <button type="button" className="btn-link" onClick={handleBackToForm}>
                            Modifier l'email
                        </button>
                    </div>
                </form>

                <p className="register-footer">
                    Déjà un compte ?{' '}
                    <Link to="/login">Se connecter</Link>
                </p>
            </div>
        </div>
    )
}

export default RegisterPage