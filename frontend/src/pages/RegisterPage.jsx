import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../services/AuthService'
import { useAuth } from '../context/useAuth'
import './RegisterPage.css'

function RegisterPage() {
    const navigate = useNavigate()
    const { login } = useAuth()

    const [form, setForm] = useState({
        nom: '',
        prenom: '',
        email: '',
        motDePasse: '',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const data = await register(
                form.nom,
                form.prenom,
                form.email,
                form.motDePasse
            )
            login(
                { email: data.email, nom: data.nom, prenom: data.prenom },
                null
            )
            navigate('/search')
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de l'inscription")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="register-container">
            <div className="register-card">
                <h1 className="register-title">📚 BiblioApp</h1>
                <h2 className="register-subtitle">Créer un compte</h2>

                {error && <div className="register-error">{error}</div>}

                <form onSubmit={handleSubmit} className="register-form">
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

                    <button className="btn-primary" type="submit" disabled={loading}>
                        {loading ? 'Inscription...' : "S'inscrire"}
                    </button>
                </form>

                <p className="register-footer">
                    Déjà un compte ?{' '}
                    <Link to="/">Se connecter</Link>
                </p>
            </div>
        </div>
    )
}

export default RegisterPage