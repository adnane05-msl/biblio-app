import { useEffect, useState } from 'react'
import api from '../services/api'

function LoginPage() {
    const [message, setMessage] = useState('')

    useEffect(() => {
        api.get('/test')
        .then(res => setMessage(res.data))
        .catch(() => setMessage('Erreur de connexion'))
    }, [])

    return (
        <div>
        <h1>Login Page</h1>
        <p>Réponse Spring Boot : {message}</p>
        </div>
    )
}

export default LoginPage