import { useEffect, useState, useRef } from 'react'
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
    faCheckCircle, faChartLine, faDatabase,
    faFilePdf, faSpinner
} from '@fortawesome/free-solid-svg-icons'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

function PrismaDashboardPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [data, setData]           = useState(null)
    const [project, setProject]     = useState(null)
    const [loading, setLoading]     = useState(true)
    const [error, setError]         = useState('')
    const [exporting, setExporting] = useState(false)

    /* Ref sur le bloc diagramme seul */
    const diagramRef = useRef(null)

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

    /*Export PDF — capture uniquement #prisma-diagram */

    const handleExportPDF = async () => {
        if (!diagramRef.current) return
        setExporting(true)
        try {
            const el = diagramRef.current

            const canvas = await html2canvas(el, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#f0f4f8',
                logging: false,
            })

            const imgData = canvas.toDataURL('image/png')

            /* Dimensions en mm (A4 portrait) */
            const pdfW = 210
            const pdfH = 297
            const margin = 15 

            const usableW = pdfW - margin * 2
            const usableH = pdfH - margin * 2

            /* Ratio image → calcul hauteur proportionnelle */
            const ratio   = canvas.width / canvas.height
            let imgW      = usableW
            let imgH      = imgW / ratio

            /* Si trop haut, on recalcule en fixant la hauteur */
            if (imgH > usableH) {
                imgH = usableH
                imgW = imgH * ratio
            }

            /* Centrer horizontalement */
            const offsetX = margin + (usableW - imgW) / 2
            const offsetY = margin + (usableH - imgH) / 2

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            })

            /* Titre en petit en haut */
            pdf.setFontSize(9)
            pdf.setTextColor(150)
            const titre = project?.nomProjet
                ? `Diagramme PRISMA — ${project.nomProjet}`
                : 'Diagramme PRISMA'
            pdf.text(titre, pdfW / 2, 10, { align: 'center' })

            pdf.addImage(imgData, 'PNG', offsetX, offsetY, imgW, imgH)

            const filename = project?.nomProjet
                ? `PRISMA_${project.nomProjet.replace(/\s+/g, '_')}.pdf`
                : 'PRISMA_diagramme.pdf'

            pdf.save(filename)
        } catch (err) {
            console.error('Export PDF échoué :', err)
        } finally {
            setExporting(false)
        }
    }

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

                {/* ── Barre d'actions : Retour + Export PDF ── */}
                <div className="prisma-topbar">
                    <button className="btn-back" onClick={() => navigate(`/projects/${id}`)}>
                        <FontAwesomeIcon icon={faArrowLeft} /> Retour au projet
                    </button>

                    <button
                        className={`btn-export-pdf${exporting ? ' btn-export-pdf--loading' : ''}`}
                        onClick={handleExportPDF}
                        disabled={exporting}
                        title="Télécharger le diagramme en PDF"
                    >
                        <FontAwesomeIcon icon={exporting ? faSpinner : faFilePdf} spin={exporting} />
                        {exporting ? 'Export en cours…' : 'Télécharger PDF'}
                    </button>
                </div>

                {/* ── Titre ── */}
                <div className="prisma-header">
                    <h1 className="prisma-title">
                        <FontAwesomeIcon icon={faChartLine} /> Diagramme PRISMA
                    </h1>
                    <p className="prisma-subtitle">
                        Flux de sélection des articles — {project?.nomProjet}
                    </p>
                </div>

                {/* ZONE CAPTURÉE POUR LE PDF */}
                <div id="prisma-diagram" ref={diagramRef} className="prisma-diagram-wrapper">

                    {/* FLUX PRISMA */}
                    <div className="prisma-flow">

                        {/* Résultats de la recherche */}
                        <div className="flow-card card-search">
                            <div className="flow-card-icon"><FontAwesomeIcon icon={faSearch} /></div>
                            <div className="flow-card-body">
                                <div className="flow-card-label">RÉSULTATS DE LA RECHERCHE</div>
                                <div className="flow-card-value">{data?.totalRecherche || 0}</div>
                                <div className="flow-card-desc">articles retournés par les API scientifiques</div>
                            </div>
                        </div>

                        <ArrowDown />

                        {/* ② Articles sauvegardés */}
                        <div className="flow-card card-saved">
                            <div className="flow-card-icon"><FontAwesomeIcon icon={faSave} /></div>
                            <div className="flow-card-body">
                                <div className="flow-card-label">ARTICLES SAUVEGARDÉS</div>
                                <div className="flow-card-value">{data?.totalSauvegardes || 0}</div>
                                <div className="flow-card-desc">importés dans le projet</div>
                            </div>
                        </div>

                        <ArrowDown />

                        {/* Doublons */}
                        <div className="flow-card card-doublons">
                            <div className="flow-card-icon"><FontAwesomeIcon icon={faCopy} /></div>
                            <div className="flow-card-body">
                                <div className="flow-card-label">DOUBLONS SUPPRIMÉS</div>
                                <div className="flow-card-value">{data?.totalDoublons || 0}</div>
                                <div className="flow-card-desc">articles supprimés</div>
                            </div>
                        </div>

                        <ArrowDown />

                        {/* Après déduplication */}
                        <div className="flow-card card-dedup">
                            <div className="flow-card-icon"><FontAwesomeIcon icon={faDatabase} /></div>
                            <div className="flow-card-body">
                                <div className="flow-card-label">APRÈS DÉDUPLICATION</div>
                                <div className="flow-card-value">{data?.apresDeduplication || 0}</div>
                                <div className="flow-card-desc">articles uniques</div>
                            </div>
                        </div>

                        {/* Fourche SVG */}
                        <ForkArrows />

                        {/* Exclus + Retenus */}
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
                    {/* fin .prisma-flow */}

                    {/* Légende */}
                    <div className="prisma-legend">
                        <span className="legend-item"><span className="ldot ldot-blue"/>Recherche</span>
                        <span className="legend-item"><span className="ldot ldot-green"/>Sauvegarde</span>
                        <span className="legend-item"><span className="ldot ldot-amber"/>Doublons / Déduplication</span>
                        <span className="legend-item"><span className="ldot ldot-red"/>Exclus</span>
                        <span className="legend-item"><span className="ldot ldot-emerald"/>Retenus</span>
                    </div>

                </div>
                {/* fin #prisma-diagram */}

            </div>

            <Footer />
        </div>
    )
}

/* ── Flèche verticale droite avec pointe ── */
function ArrowDown() {
    return (
        <div className="arrow-down">
            <svg viewBox="0 0 24 56" xmlns="http://www.w3.org/2000/svg" fill="none">
                <line x1="12" y1="0" x2="12" y2="42"
                    stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"/>
                <polyline points="5,34 12,46 19,34"
                        fill="none" stroke="#94a3b8" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
    )
}

function ForkArrows() {
    const CX = 240, L = 100, R = 380
    const stemY  = 48
    const barY   = 48
    const arrowY = 110

    return (
        <div className="fork-wrapper">
            <svg
                className="fork-svg"
                viewBox="0 0 480 120"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                preserveAspectRatio="xMidYMid meet"
            >
                <line x1={CX} y1="0" x2={CX} y2={stemY}
                    stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1={L} y1={barY} x2={R} y2={barY}
                    stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1={L} y1={barY} x2={L} y2={arrowY - 10}
                    stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"/>
                <polyline points={`${L-7},${arrowY-18} ${L},${arrowY} ${L+7},${arrowY-18}`}
                        stroke="#94a3b8" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round"/>
                <line x1={R} y1={barY} x2={R} y2={arrowY - 10}
                    stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"/>
                <polyline points={`${R-7},${arrowY-18} ${R},${arrowY} ${R+7},${arrowY-18}`}
                        stroke="#94a3b8" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
    )
}

export default PrismaDashboardPage