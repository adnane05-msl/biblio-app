import './ProjectCard.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFile } from '@fortawesome/free-solid-svg-icons'
import { faPencil,faTrashCan } from '@fortawesome/free-solid-svg-icons'

function ProjectCard({ project, onEdit, onDelete, onClick }) {

    const formatDate = (dateStr) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    return (
        <div className="project-card" onClick={onClick}>
            <div className="project-card-header">
                <h3 className="project-name">{project.nomProjet}</h3>
                <span className="project-articles">
                    <FontAwesomeIcon icon={faFile} /> {project.nombreArticles} article{project.nombreArticles !== 1 ? 's' : ''}
                </span>
            </div>

            <p className="project-description">
                {project.description || 'Aucune description'}
            </p>

            <div className="project-card-footer">
                <div className="project-dates">
                    <span>Créé le {formatDate(project.dateCreation)}</span>
                </div>
                <div className="project-actions">
                    <button
                        className="btn-edit"
                        onClick={(e) => { e.stopPropagation(); onEdit(project) }}
                    >
                        <FontAwesomeIcon icon={faPencil} /> Modifier
                    </button>
                    <button
                        className="btn-delete"
                        onClick={(e) => { e.stopPropagation(); onDelete(project.id) }}
                    >
                        <FontAwesomeIcon icon={faTrashCan} /> Supprimer
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProjectCard