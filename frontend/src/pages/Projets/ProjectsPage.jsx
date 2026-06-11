import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import {
    getProjectsByUser,
    createProject,
    updateProject,
    deleteProject
} from '../../services/ProjectServices'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import ProjectCard from '../../components/Projets/ProjectCard'
import ProjectForm from '../../components/Projets/ProjectForm'
import './ProjectsPage.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faPlus, faFolder, faSearch,
    faFolderOpen, faBookOpen
} from '@fortawesome/free-solid-svg-icons'

function ProjectsPage() {
    const { user } = useAuth()
    const navigate = useNavigate()

    const [projects,      setProjects]      = useState([])
    const [loading,       setLoading]       = useState(true)
    const [formLoading,   setFormLoading]   = useState(false)
    const [error,         setError]         = useState('')
    const [success,       setSuccess]       = useState('')
    const [showForm,      setShowForm]      = useState(false)
    const [editingProject,setEditingProject]= useState(null)
    const [refreshKey,    setRefreshKey]    = useState(0)
    const [searchQuery,   setSearchQuery]   = useState('')

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

    // Filtrer par recherche
    const filteredProjects = projects.filter(p =>
        p.nomProjet.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase()
            .includes(searchQuery.toLowerCase()))
    )

    // Stats
    const totalArticles = projects.reduce(
        (sum, p) => sum + (p.nombreArticles || 0), 0)

    return (
        <div className="projects-page">
            <Navbar />

            {/* ── Hero section ── */}
            <section className="projects-hero">
                <div className="projects-hero-bg">
                    <div className="hero-circle circle1" />
                    <div className="hero-circle circle2" />
                    <div className="hero-circle circle3" />
                </div>

                <div className="projects-hero-content">
                    <span className="projects-hero-badge">
                        <FontAwesomeIcon icon={faFolder} />
                        Espace de recherche
                    </span>
                    <h1 className="projects-hero-title">
                        Mes Projets de{' '}
                        <span>Recherche</span>
                    </h1>
                    <p className="projects-hero-subtitle">
                        Organisez vos articles scientifiques
                        par projet, annotez-les et exportez
                        vos références bibliographiques.
                    </p>
                </div>

                {/* Stats hero */}
                <div className="projects-hero-stats">
                    <div className="hero-stat-box">
                        <span className="hero-stat-num">
                            {projects.length}
                        </span>
                        <span className="hero-stat-lbl">
                            Projet{projects.length > 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="hero-stat-divider" />
                    <div className="hero-stat-box">
                        <span className="hero-stat-num">
                            {totalArticles}
                        </span>
                        <span className="hero-stat-lbl">
                            Article{totalArticles > 1 ? 's' : ''}
                            {' '}sauvegardé{totalArticles > 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="hero-stat-divider" />
                    <div className="hero-stat-box">
                        <span className="hero-stat-num">
                            {user?.profil?.split(' ')[0] || '—'}
                        </span>
                        <span className="hero-stat-lbl">
                            Profil
                        </span>
                    </div>
                </div>
            </section>

            {/* ── Contenu principal ── */}
            <div className="projects-container">

                {/* Toolbar */}
                <div className="projects-toolbar">
                    <div className="projects-search-bar">
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="search-icon"
                        />
                        <input
                            type="text"
                            placeholder="Rechercher un projet..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="projects-search-input"
                        />
                    </div>
                    <button
                        className="btn-new-project"
                        onClick={() => setShowForm(true)}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Nouveau projet
                    </button>
                </div>

                {/* Alertes */}
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

                {/* Contenu */}
                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner" />
                        <p>Chargement des projets...</p>
                    </div>
                ) : projects.length === 0 ? (

                    /* Empty state — aucun projet */
                    <div className="empty-state">
                        <div className="empty-icon-wrapper">
                            <FontAwesomeIcon icon={faFolderOpen} />
                        </div>
                        <h2 className="empty-title">
                            Aucun projet pour l'instant
                        </h2>
                        <p className="empty-subtitle">
                            Créez votre premier projet pour commencer
                            à organiser vos articles scientifiques
                        </p>
                        <div className="empty-actions">
                            <button
                                className="btn-new-project"
                                onClick={() => setShowForm(true)}
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                Créer mon premier projet
                            </button>
                            <button
                                className="btn-go-search"
                                onClick={() => navigate('/search')}
                            >
                                <FontAwesomeIcon icon={faSearch} />
                                Faire une recherche
                            </button>
                        </div>
                    </div>

                ) : filteredProjects.length === 0 ? (

                    /* Empty state — aucun résultat de recherche */
                    <div className="empty-state">
                        <div className="empty-icon-wrapper">
                            <FontAwesomeIcon icon={faSearch} />
                        </div>
                        <h2 className="empty-title">
                            Aucun projet trouvé
                        </h2>
                        <p className="empty-subtitle">
                            Aucun projet ne correspond à
                            "{searchQuery}"
                        </p>
                        <button
                            className="btn-go-search"
                            onClick={() => setSearchQuery('')}
                        >
                            Effacer la recherche
                        </button>
                    </div>

                ) : (
                    <>
                        {/* Compteur */}
                        <div className="projects-count">
                            <span>
                                <strong>{filteredProjects.length}</strong>
                                {' '}projet
                                {filteredProjects.length > 1 ? 's' : ''}
                                {searchQuery && ` pour "${searchQuery}"`}
                            </span>
                        </div>

                        {/* Grille projets */}
                        <div className="projects-grid">
                            {filteredProjects.map(project => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onEdit={p => setEditingProject(p)}
                                    onDelete={handleDelete}
                                    onClick={() => navigate(`/projects/${project.id}`)}
                                    onCollaborer={() => navigate(`/projets/${project.id}/collaboration`)}
                                />
                            ))}

                            {/* Carte "Nouveau projet" */}
                            <div
                                className="project-card-new"
                                onClick={() => setShowForm(true)}
                            >
                                <div className="card-new-icon">
                                    <FontAwesomeIcon icon={faPlus} />
                                </div>
                                <p className="card-new-title">
                                    Nouveau projet
                                </p>
                                <p className="card-new-desc">
                                    Créer un nouveau projet de recherche
                                </p>
                            </div>
                        </div>
                    </>
                )}

                {/* Tip */}
                {!loading && projects.length > 0 && (
                    <div className="projects-tip">
                        <FontAwesomeIcon icon={faBookOpen} />
                        Conseil : Cliquez sur un projet pour voir
                        ses articles et accéder au dashboard
                        bibliométrique.
                    </div>
                )}
            </div>

            {/* Modals */}
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

            <Footer />
        </div>
    )
}

export default ProjectsPage