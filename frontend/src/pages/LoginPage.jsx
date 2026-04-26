import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login as loginService } from '../services/AuthService'
import { useAuth } from '../context/useAuth'
import './LoginPage.css'

function LoginPage() {
    const navigate = useNavigate()
    const { login } = useAuth()

    const [form, setForm] = useState({ email: '', motDePasse: '' })
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
            const data = await loginService(form.email, form.motDePasse)
            login(
                { email: data.email, nom: data.nom, prenom: data.prenom },
                data.token
            )
            navigate('/search')
        } catch (err) {
            setError(err.response?.data?.message || 'Email ou mot de passe incorrect')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">📚 BiblioApp</h1>
                <h2 className="login-subtitle">Connexion</h2>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
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
                            placeholder="Votre mot de passe"
                            value={form.motDePasse}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button className="btn-primary" type="submit" disabled={loading}>
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>

                <p className="login-footer">
                    Pas encore de compte ?{' '}
                    <Link to="/register">S'inscrire</Link>
                </p>
            </div>
        </div>
    )
}

export default LoginPage