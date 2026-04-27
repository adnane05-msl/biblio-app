import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import {
    getProjectsByUser,
    createProject,
    updateProject,
    deleteProject
} from '../../services/ProjectServices'
import Navbar from '../../components/Navbar'
import ProjectCard from '../../components/Projets/ProjectCard'
import ProjectForm from '../../components/Projets/ProjectForm'
import './ProjectsPage.css'

function ProjectsPage() {
    const { user } = useAuth()
    const navigate = useNavigate()

    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [formLoading, setFormLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editingProject, setEditingProject] = useState(null)
    const [refreshKey, setRefreshKey] = useState(0)

    

    // Charger les projets au démarrage et après chaque modification
    useEffect(() => {
        if (!user?.id) return

        const fetchProjects = async () => {
            try {
                setLoading(true)
                const data = await getProjectsByUser(user.id)
                setProjects(data)
            } catch {
                setError('Erreur lors du chargement des projets')
            } finally {
                setLoading(false)
            }
        }

        fetchProjects()
    }, [user, refreshKey])

    const reloadProjects = useCallback(() => {
        setRefreshKey(k => k + 1)
    }, [])

    const handleCreate = async (nomProjet, description) => {
        try {
            setFormLoading(true)
            await createProject(user.id, nomProjet, description)
            setShowForm(false)
            setSuccess('Projet créé avec succès !')
            reloadProjects()
            setTimeout(() => setSuccess(''), 3000)
        } catch {
            setError('Erreur lors de la création')
        } finally {
            setFormLoading(false)
        }
    }


    const handleUpdate = async (nomProjet, description) => {
        try {
            setFormLoading(true)
            await updateProject(editingProject.id, nomProjet, description)
            setEditingProject(null)
            setSuccess('Projet modifié avec succès !')
            reloadProjects()
            setTimeout(() => setSuccess(''), 3000)
        } catch {
            setError('Erreur lors de la modification')
        } finally {
            setFormLoading(false)
        }
    }

    const handleDelete = async (projectId) => {
        if (!window.confirm('Supprimer ce projet ?')) return
        try {
            await deleteProject(projectId)
            setSuccess('Projet supprimé !')
            reloadProjects()
            setTimeout(() => setSuccess(''), 3000)
        } catch {
            setError('Erreur lors de la suppression')
        }
    }

    return (
        <div className="projects-page">
            <Navbar />

            <div className="projects-container">
                <div className="projects-header">
                    <div>
                        <h1 className="projects-title">📁 Mes Projets</h1>
                        <p className="projects-subtitle">
                            {projects.length} projet{projects.length !== 1 ? 's' : ''} de recherche
                        </p>
                    </div>
                    <button
                        className="btn-new-project"
                        onClick={() => setShowForm(true)}
                    >
                        ➕ Nouveau projet
                    </button>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                        <button onClick={() => setError('')}>✕</button>
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        {success}
                    </div>
                )}

                {loading ? (
                    <div className="loading-state">
                        <p>Chargement des projets...</p>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="empty-state">
                        <p className="empty-icon">📂</p>
                        <p className="empty-title">Aucun projet pour l'instant</p>
                        <p className="empty-subtitle">
                            Créez votre premier projet de recherche
                        </p>
                        <button
                            className="btn-new-project"
                            onClick={() => setShowForm(true)}
                        >
                            ➕ Créer un projet
                        </button>
                    </div>
                ) : (
                    <div className="projects-grid">
                        {projects.map(project => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onEdit={(p) => setEditingProject(p)}
                                onDelete={handleDelete}
                                onClick={() => navigate(`/projects/${project.id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {showForm && (
                <ProjectForm
                    project={null}
                    onSubmit={handleCreate}
                    onCancel={() => setShowForm(false)}
                    loading={formLoading}
                />
            )}

            {editingProject && (
                <ProjectForm
                    key={editingProject.id}
                    project={editingProject}
                    onSubmit={handleUpdate}
                    onCancel={() => setEditingProject(null)}
                    loading={formLoading}
                />
            )}
        </div>
    )
}

export default ProjectsPage