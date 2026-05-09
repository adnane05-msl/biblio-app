import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { useAuth } from './context/useAuth'
import LoginPage from './pages/Authentification/LoginPage'
import RegisterPage from './pages/Authentification/RegisterPage'
import SearchPage from './pages/Search/SearchPage'
import ProjectsPage from './pages/Projets/ProjectsPage'
import ProjectDetail from './pages/Projets/ProjectDetail'
import DashboardPage from './pages/Dashboard/DashboardPage'

function ProtectedRoute({ children }) {
    const { user } = useAuth()
    return user ? children : <Navigate to="/" />
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/"         element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/search"   element={
                <ProtectedRoute><SearchPage /></ProtectedRoute>
            } />
            <Route path="/projects"   element={
                <ProtectedRoute><ProjectsPage /></ProtectedRoute>
            } />
            <Route path="/projects/:id" element={
                <ProtectedRoute><ProjectDetail /></ProtectedRoute>
            } />
            <Route path="/projects/:id/dashboard" element={
                <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            
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