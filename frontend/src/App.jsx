import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { useAuth } from './context/useAuth'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SearchPage from './pages/SearchPage'
// import ProjectPage from './pages/ProjectPage'
// import DashboardPage from './pages/DashboardPage'

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
            {/* <Route path="/projects" element={
                <ProtectedRoute><ProjectPage /></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
                <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } /> */}
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