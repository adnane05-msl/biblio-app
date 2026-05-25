import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPrismaData } from '../../services/PrismaServices'
import { getProjectById } from '../../services/ProjectServices'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import './PrismaDashboardPage.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faArrowLeft,
    faArrowDown,
    faDatabase,
    faCopy,
    faFilter,
    faCircleXmark,
    faCircleCheck,
    faBookOpen
} from '@fortawesome/free-solid-svg-icons'

function PrismaDashboardPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [data, setData]       = useState(null)
    const [project, setProject] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError]     = useState('')

    useEffect(() => {
        const load = async () => {
            try {
                const [prisma, proj] = await Promise.all([
                    getPrismaData(id),
                    getProjectById(id)
                ])
                setData(prisma)
                setProject(proj)
            } catch {
                setError('Erreur lors du chargement')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id])

    if (loading) return (
        <div className="prisma-page">
            <Navbar />
            <div className="prisma-loading">Chargement...</div>
        </div>
    )

    if (error) return (
        <div className="prisma-page">
            <Navbar />
            <div className="prisma-error">{error}</div>
        </div>
    )

    const steps = [
        {
            id: 'identification',
            icon: faDatabase,
            color: 'step-blue',
            label: 'Identification',
            value: data.totalIdentifies,
            description: 'Articles identifiés depuis les sources',
        },
        
        {
            id: 'deduplication',
            icon: faCopy,
            color: 'step-amber',
            label: 'Déduplication',
            value: data.totalDoublons,
            description: 'Doublons détectés et supprimés',
            sub: `Reste : ${data.apresDeduplication} articles`,
            // removed: true
        },
        {
            id: 'apres-dedup',
            icon: faFilter,
            color: 'step-purple',
            label: 'Après déduplication',
            value: data.apresDeduplication,
            description: 'Articles uniques à examiner',
            sub: 'Prêts pour le filtrage'
        },
        {
            id: 'exclus',
            icon: faCircleXmark,
            color: 'step-red',
            label: 'Exclus',
            value: data.totalExclus,
            description: 'Articles exclus après lecture',
            sub: 'Non pertinents',
            // removed: true
        },
        {
            id: 'retenus',
            icon: faCircleCheck,
            color: 'step-green',
            label: 'Articles retenus',
            value: data.totalRetenus,
            description: 'Articles inclus dans la revue',
            sub: 'Résultat final',
            final: true
        },
    ]

    return (
        <div className="prisma-page">
            <Navbar />

            <div className="prisma-container">

                {/* Header */}
                <button
                    className="btn-back"
                    onClick={() => navigate(`/projects/${id}`)}
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                    Retour au projet
                </button>

                <div className="prisma-header">
                    <h1 className="prisma-title">
                        Diagramme PRISMA
                    </h1>
                    <p className="prisma-subtitle">
                        Flux de sélection des articles — {project?.nomProjet}
                    </p>
                </div>

                {/* Résumé rapide */}
                <div className="prisma-summary">
                    <div className="summary-card">
                        <span className="summary-num blue">
                            {data.totalIdentifies}
                        </span>
                        <span className="summary-lbl">Identifiés</span>
                    </div>
                    <div className="summary-arrow">→</div>
                    <div className="summary-card">
                        <span className="summary-num amber">
                            {data.totalDoublons}
                        </span>
                        <span className="summary-lbl">Doublons</span>
                    </div>
                    <div className="summary-arrow">→</div>
                    <div className="summary-card">
                        <span className="summary-num red">
                            {data.totalExclus}
                        </span>
                        <span className="summary-lbl">Exclus</span>
                    </div>
                    <div className="summary-arrow">→</div>
                    <div className="summary-card highlight">
                        <span className="summary-num green">
                            {data.totalRetenus}
                        </span>
                        <span className="summary-lbl">Retenus</span>
                    </div>
                </div>

                {/* Flux PRISMA */}
                <div className="prisma-flow">
                    {steps.map((step, index) => (
                        <div key={step.id} className="prisma-step-wrapper">

                            <div className={`prisma-step ${step.color} ${step.final ? 'final' : ''} ${step.removed ? 'removed' : ''}`}>
                                <div className="step-icon">
                                    <FontAwesomeIcon icon={step.icon} />
                                </div>
                                <div className="step-content">
                                    <div className="step-label">
                                        {step.label}
                                    </div>
                                    <div className="step-value">
                                        {step.value}
                                        <span className="step-unit"> articles</span>
                                    </div>
                                    <div className="step-desc">
                                        {step.description}
                                    </div>
                                    <div className="step-sub">
                                        {step.sub}
                                    </div>
                                </div>
                            </div>

                            {index < steps.length - 1 && (
                                <div className="prisma-arrow">
                                    <FontAwesomeIcon icon={faArrowDown} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* À lire */}
                {data.totalALire > 0 && (
                    <div className="prisma-alire">
                        <FontAwesomeIcon icon={faBookOpen} />
                        <span>
                            <strong>{data.totalALire}</strong> article(s)
                            encore à lire — non comptabilisés dans les retenus
                        </span>
                    </div>
                )}

            </div>

            <Footer />
        </div>
    )
}
export default PrismaDashboardPage