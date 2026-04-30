import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getProjectById } from '../../services/ProjectServices'
import Navbar from '../../components/Navbar/Navbar'
import './ProjectDetail.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFile } from '@fortawesome/free-solid-svg-icons'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'

function ProjectDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [project, setProject] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadProject = async () => {
            try {
                const data = await getProjectById(id)
                setProject(data)
            } catch {
                navigate('/projects')
            } finally {
                setLoading(false)
            }
        }
        loadProject()
    }, [id, navigate])

    if (loading) return (
        <div className="detail-page">
            <Navbar />
            <div className="detail-loading">Chargement...</div>
        </div>
    )

    return (
        <div className="detail-page">
            <Navbar />
            <div className="detail-container">
                <button className="btn-back" onClick={() => navigate('/projects')}>
                    ← Retour aux projets
                </button>
                <h1 className="detail-title">{project?.nomProjet}</h1>
                <p className="detail-description">{project?.description}</p>
                <div className="detail-info">
                    <span><FontAwesomeIcon icon={faFile} /> {project?.nombreArticles} article(s)</span>
                </div>
                <div className="detail-section">
                    <p className="coming-soon">
                        <FontAwesomeIcon icon={faMagnifyingGlass} /> Les articles de ce projet apparaîtront ici — module de recherche à venir
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ProjectDetail