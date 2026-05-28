import api from './Api'

export const register = async (nom, prenom, email, motDePasse, profil, verificationCode) => {
    console.log('Appel register avec:', { nom, prenom, email, profil, verificationCode });
    
    const response = await api.post('/api/authentification/inscription', {
        nom,
        prenom,
        email,
        motDePasse,
        profil,
        verificationCode
    });
    
    console.log('Register succès:', response.data);
    return response.data;
};

export const login = async (email, motDePasse) => {
    const response = await api.post('/api/authentification/SeConnecter', {
        email,
        motDePasse,
    });
    return response.data;
};

export const sendVerificationCode = async (email) => {
    console.log('Envoi code pour:', email);
    const response = await api.post('/api/authentification/envoyer-code', {
        email,
    });
    return response.data;
};

export const verifyCode = async (email, code) => {
    console.log('Vérification code pour:', email, code);
    const response = await api.post('/api/authentification/verifier-code', {
        email,
        code,
    });
    return response.data;
};