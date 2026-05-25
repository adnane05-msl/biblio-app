import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './context/AuthProvider'
import { useAuth } from './context/useAuth'
import LoginPage from './pages/Authentification/LoginPage'
import RegisterPage from './pages/Authentification/RegisterPage'
import SearchPage from './pages/Search/SearchPage'
import ProjectsPage from './pages/Projets/ProjectsPage'
import ProjectDetail from './pages/Projets/ProjectDetail'
import Statistiques from './pages/Statistiques/StatistiquesPage'
import HomePage from './pages/HomePage/HomePage'
import AboutPage from './pages/About/AboutPage'
import ProfilPage from './pages/Profil/ProfilPage'


function ProtectedRoute({ children }) {
    const { user } = useAuth()
    return user ? children : <Navigate to="/" />
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/search"   element={<SearchPage />} />
            <Route path="/projects"   element={<ProjectsPage />} />
            <Route path="/projects/:id" element={
                <ProtectedRoute><ProjectDetail /></ProtectedRoute>
            } />
            <Route path="/projects/:id/statistiques" element={
                <ProtectedRoute><Statistiques /></ProtectedRoute>
            } />
            <Route path="/" element={<HomePage />} />
            <Route path="/profil" element={
                <ProtectedRoute><ProfilPage /></ProtectedRoute>
                } />    
            {/* <Route path="/about" element={<AboutPage />} /> */}
            
        </Routes>
    )
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App