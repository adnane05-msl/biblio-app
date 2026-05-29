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
    faSearch, faSave, faCopy, faTrashAlt,
    faCheckCircle, faChartLine, faDatabase
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
            <div className="prisma-loading">
                <div className="loading-spinner" />
                <p>Chargement du diagramme PRISMA…</p>
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

                {/* ── Back ── */}
                <button className="btn-back" onClick={() => navigate(`/projects/${id}`)}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Retour au projet
                </button>

                {/* ── Titre ── */}
                <div className="prisma-header">
                    <h1 className="prisma-title">
                        <FontAwesomeIcon icon={faChartLine} /> Diagramme PRISMA
                    </h1>
                    <p className="prisma-subtitle">
                        Flux de sélection des articles — {project?.nomProjet}
                    </p>
                </div>

                {/* ════════════════════════════════
                    FLUX PRISMA
                ════════════════════════════════ */}
                <div className="prisma-flow">

                    {/* ① Résultats de la recherche */}
                    <div className="flow-card card-search">
                        <div className="flow-card-icon"><FontAwesomeIcon icon={faSearch} /></div>
                        <div className="flow-card-body">
                            <div className="flow-card-label">RÉSULTATS DE LA RECHERCHE</div>
                            <div className="flow-card-value">{data?.totalRecherche || 0}</div>
                            <div className="flow-card-desc">articles retournés par les API scientifiques</div>
                        </div>
                    </div>

                    <ArrowV />

                    {/* ② Articles sauvegardés */}
                    <div className="flow-card card-saved">
                        <div className="flow-card-icon"><FontAwesomeIcon icon={faSave} /></div>
                        <div className="flow-card-body">
                            <div className="flow-card-label">ARTICLES SAUVEGARDÉS</div>
                            <div className="flow-card-value">{data?.totalSauvegardes || 0}</div>
                            <div className="flow-card-desc">importés dans le projet</div>
                        </div>
                    </div>

                    <ArrowV />

                    {/* ③ Ligne horizontale : Doublons → Après déduplication */}
                    <div className="flow-row">
                        <div className="flow-card card-doublons">
                            <div className="flow-card-icon"><FontAwesomeIcon icon={faCopy} /></div>
                            <div className="flow-card-body">
                                <div className="flow-card-label">DOUBLONS</div>
                                <div className="flow-card-value">{data?.totalDoublons || 0}</div>
                                <div className="flow-card-desc">articles supprimés</div>
                            </div>
                        </div>

                        <ArrowH />

                        <div className="flow-card card-dedup" id="dedup-card">
                            <div className="flow-card-icon"><FontAwesomeIcon icon={faDatabase} /></div>
                            <div className="flow-card-body">
                                <div className="flow-card-label">APRÈS DÉDUPLICATION</div>
                                <div className="flow-card-value">{data?.apresDeduplication || 0}</div>
                                <div className="flow-card-desc">articles uniques</div>
                            </div>
                        </div>
                    </div>

                    {/* ④ Fourche SVG depuis "Après déduplication" vers Exclus / Retenus */}
                    {/*
                        La carte "Après déduplication" est alignée à droite dans flow-row.
                        On utilise un SVG centré sur cette carte pour tracer la fourche.
                    */}
                    <div className="flow-fork-wrapper">
                        {/* Tige descend depuis le centre de la carte Après déduplication */}
                        <svg className="fork-svg" viewBox="0 0 500 130" xmlns="http://www.w3.org/2000/svg"
                             preserveAspectRatio="none">
                            {/* Tige verticale centrale (depuis le milieu de la carte dédup, côté droit) */}
                            <line x1="350" y1="0"  x2="350" y2="50"
                                  stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"/>
                            {/* Barre horizontale */}
                            <line x1="120" y1="50" x2="350" y2="50"
                                  stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"/>
                            {/* Branche gauche → Exclus */}
                            <line x1="120" y1="50"  x2="120" y2="110"
                                  stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"/>
                            <polyline points="112,98 120,112 128,98"
                                      fill="none" stroke="#94a3b8" strokeWidth="2.5"
                                      strokeLinecap="round" strokeLinejoin="round"/>
                            {/* Branche droite → Retenus */}
                            <line x1="350" y1="50"  x2="350" y2="110"
                                  stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"/>
                            <polyline points="342,98 350,112 358,98"
                                      fill="none" stroke="#94a3b8" strokeWidth="2.5"
                                      strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>

                        {/* Deux cartes côte à côte */}
                        <div className="flow-fork-cards">
                            <div className="flow-card card-exclus">
                                <div className="flow-card-icon"><FontAwesomeIcon icon={faTrashAlt} /></div>
                                <div className="flow-card-body">
                                    <div className="flow-card-label">EXCLUS</div>
                                    <div className="flow-card-value">{data?.totalExclus || 0}</div>
                                    <div className="flow-card-desc">non retenus</div>
                                </div>
                            </div>

                            <div className="flow-card card-retenus">
                                <div className="flow-card-icon"><FontAwesomeIcon icon={faCheckCircle} /></div>
                                <div className="flow-card-body">
                                    <div className="flow-card-label">RETENUS</div>
                                    <div className="flow-card-value">{data?.totalRetenus || 0}</div>
                                    <div className="flow-card-desc">inclus dans l'étude</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                {/* fin .prisma-flow */}

                {/* ── Légende ── */}
                <div className="prisma-legend">
                    <span className="legend-item"><span className="ldot ldot-blue"/>Recherche</span>
                    <span className="legend-item"><span className="ldot ldot-green"/>Sauvegarde</span>
                    <span className="legend-item"><span className="ldot ldot-amber"/>Doublons / Déduplication</span>
                    <span className="legend-item"><span className="ldot ldot-red"/>Exclus</span>
                    <span className="legend-item"><span className="ldot ldot-emerald"/>Retenus</span>
                </div>

            </div>

            <Footer />
        </div>
    )
}

/* ── Flèche verticale ── */
function ArrowV() {
    return (
        <div className="arrow-v">
            <svg viewBox="0 0 20 44" xmlns="http://www.w3.org/2000/svg">
                <line x1="10" y1="2"  x2="10" y2="32"
                      stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"/>
                <polyline points="3,24 10,36 17,24"
                          fill="none" stroke="#94a3b8" strokeWidth="2.5"
                          strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
    )
}

/* ── Flèche horizontale ── */
function ArrowH() {
    return (
        <div className="arrow-h">
            <svg viewBox="0 0 64 20" xmlns="http://www.w3.org/2000/svg">
                <line x1="2"  y1="10" x2="48" y2="10"
                      stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"/>
                <polyline points="40,3 52,10 40,17"
                          fill="none" stroke="#94a3b8" strokeWidth="2.5"
                          strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
    )
}

export default PrismaDashboardPage