import { useState } from 'react'
import './ProjectForm.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { faPencil } from '@fortawesome/free-solid-svg-icons'

function ProjectForm({ project, onSubmit, onCancel, loading }) {

    const [form, setForm] = useState({
    nomProjet: project?.nomProjet || '',
    description: project?.description || '',
    })


    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit(form.nomProjet, form.description)
    }

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <h2 className="modal-title">
                    {project 
                        ? <><FontAwesomeIcon icon={faPencil} /> Modifier le projet</>
                        : <><FontAwesomeIcon icon={faPlus} /> Nouveau projet</>
}
                </h2>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="input-group">
                        <label className="input-label">Nom du projet *</label>
                        <input
                            className="input-field"
                            type="text"
                            name="nomProjet"
                            placeholder="Ex: Revue sur l'IA en médecine"
                            value={form.nomProjet}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Description</label>
                        <textarea
                            className="input-field textarea-field"
                            name="description"
                            placeholder="Décrivez l'objectif de ce projet..."
                            value={form.description}
                            onChange={handleChange}
                            rows={4}
                        />
                    </div>

                    <div className="modal-buttons">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onCancel}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={loading}
                        >
                            {loading ? 'Enregistrement...' : (project ? 'Modifier' : 'Créer')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ProjectForm