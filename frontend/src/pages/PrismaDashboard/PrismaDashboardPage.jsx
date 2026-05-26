import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPrismaData } from '../../services/PrismaServices'
import { getProjectById } from '../../services/ProjectServices'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import './PrismaDashboardPage.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faArrowLeft, faArrowRight, faArrowDown,
    faSearch, faSave, faCopy, faTrashAlt,
    faCheckCircle, faBookOpen, faChartLine,
    faDatabase
} from '@fortawesome/free-solid-svg-icons'

function PrismaDashboardPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [data, setData] = useState(null)
    const [project, setProject] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

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
            <div className="prisma-loading">
                <div className="loading-spinner"></div>
                <p>Chargement du diagramme PRISMA...</p>
            </div>
        </div>
    )

    if (error) return (
        <div className="prisma-page">
            <Navbar />
            <div className="prisma-error">{error}</div>
        </div>
    )

    return (
        <div className="prisma-page">
            <Navbar />

            <div className="prisma-container">
                {/* Header */}
                <button className="btn-back" onClick={() => navigate(`/projects/${id}`)}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                    Retour au projet
                </button>

                <div className="prisma-header">
                    <h1 className="prisma-title">
                        <FontAwesomeIcon icon={faChartLine} /> Diagramme PRISMA
                    </h1>
                    <p className="prisma-subtitle">
                        Flux de sélection des articles — {project?.nomProjet}
                    </p>
                </div>

                {/* ========== SCHÉMA PRISMA ========== */}
                <div className="prisma-schema">

                    {/* Bloc 1 : Résultats de recherche */}
                    <div className="schema-block block-search">
                        <div className="block-icon">
                            <FontAwesomeIcon icon={faSearch} />
                        </div>
                        <div className="block-content">
                            <h3 className="block-title">RÉSULTATS DE LA RECHERCHE</h3>
                            <div className="block-value">{data?.totalRecherche || 0}</div>
                            <p className="block-subtitle">articles trouvés via les API scientifiques</p>
                        </div>
                    </div>

                    {/* Flèche vers le bas */}
                    <div className="schema-arrow-down">
                        <FontAwesomeIcon icon={faArrowDown} />
                    </div>

                    {/* Bloc 2 : Articles sauvegardés */}
                    <div className="schema-block block-saved">
                        <div className="block-icon">
                            <FontAwesomeIcon icon={faSave} />
                        </div>
                        <div className="block-content">
                            <h3 className="block-title">ARTICLES SAUVEGARDÉS</h3>
                            <div className="block-value">{data?.totalSauvegardes || 0}</div>
                            <p className="block-subtitle">articles importés dans le projet</p>
                        </div>
                    </div>

                    {/* Flèche vers le bas */}
                    <div className="schema-arrow-down">
                        <FontAwesomeIcon icon={faArrowDown} />
                    </div>

                    {/* Bloc 3 : Analyse des articles */}
                    <div className="schema-branch">
                        <div className="schema-branch-label">ANALYSE DES ARTICLES</div>
                        
                        <div className="branch-cards">
                            {/* Doublons */}
                            <div className="branch-card branch-doublons">
                                <div className="branch-icon">
                                    <FontAwesomeIcon icon={faCopy} />
                                </div>
                                <div className="branch-value">{data?.totalDoublons || 0}</div>
                                <div className="branch-label">DOUBLONS</div>
                                <div className="branch-desc">articles supprimés</div>
                            </div>

                            {/* Flèche droite */}
                            <div className="branch-arrow">
                                <FontAwesomeIcon icon={faArrowRight} />
                            </div>

                            {/* Après déduplication */}
                            <div className="branch-card branch-dedup">
                                <div className="branch-icon">
                                    <FontAwesomeIcon icon={faDatabase} />
                                </div>
                                <div className="branch-value">{data?.apresDeduplication || 0}</div>
                                <div className="branch-label">APRÈS DÉDUPLICATION</div>
                                <div className="branch-desc">articles uniques</div>
                            </div>

                            {/* Flèche droite */}
                            <div className="branch-arrow">
                                <FontAwesomeIcon icon={faArrowRight} />
                            </div>

                            {/* Répartition Exclus / Retenus */}
                            <div className="branch-split">
                                <div className="split-card split-exclus">
                                    <div className="split-icon">
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                    </div>
                                    <div className="split-value">{data?.totalExclus || 0}</div>
                                    <div className="split-label">EXCLUS</div>
                                    <div className="split-desc">non retenus</div>
                                </div>
                                
                                <div className="split-card split-retenus">
                                    <div className="split-icon">
                                        <FontAwesomeIcon icon={faCheckCircle} />
                                    </div>
                                    <div className="split-value">{data?.totalRetenus || 0}</div>
                                    <div className="split-label">RETENUS</div>
                                    <div className="split-desc">inclus dans l'étude</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Flèche vers le bas pour les retenus */}
                    <div className="schema-arrow-down">
                        <FontAwesomeIcon icon={faArrowDown} />
                    </div>

                    {/* Bloc Final : Résultat */}
                    <div className="schema-block block-final">
                        <div className="block-icon">
                            <FontAwesomeIcon icon={faCheckCircle} />
                        </div>
                        <div className="block-content">
                            <h3 className="block-title">RÉSULTAT FINAL</h3>
                            <div className="block-value-final">{data?.totalRetenus || 0}</div>
                            <p className="block-subtitle">articles retenus pour la revue</p>
                        </div>
                    </div>

                </div>

                {/* ========== LÉGENDE / NOTES ========== */}
                <div className="prisma-legend">
                    <div className="legend-item">
                        <div className="legend-color color-blue"></div>
                        <span>Résultats de recherche</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color color-green"></div>
                        <span>Articles sauvegardés</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color color-amber"></div>
                        <span>Doublons / Exclus</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color color-emerald"></div>
                        <span>Articles retenus</span>
                    </div>
                </div>

                {/* Note sur les articles "À lire" */}
                {data?.totalALire > 0 && (
                    <div className="prisma-note">
                        <FontAwesomeIcon icon={faBookOpen} />
                        <span>
                            <strong>{data.totalALire}</strong> article(s) encore à lire
                        </span>
                    </div>
                )}

            </div>

            <Footer />
        </div>
    )
}

export default PrismaDashboardPage