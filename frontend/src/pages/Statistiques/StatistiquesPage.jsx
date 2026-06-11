import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie,
    Cell, Legend
} from 'recharts'
import { getStatistiques } from '../../services/StatistiquesServices'
import { getProjectById } from '../../services/ProjectServices'
import Navbar from '../../components/Navbar/Navbar'
import './StatistiquesPage.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faChartBar, faArrowLeft,
    faCircleCheck, faCircleXmark,
    faBookOpen, faCopy,
    faFilePdf, faSpinner
} from '@fortawesome/free-solid-svg-icons'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// Couleurs pour les graphiques
const STATUT_COLORS = {
    RETENU:  '#16a34a',
    A_LIRE:  '#6b7280',
    EXCLU:   '#dc2626',
    DOUBLON: '#d97706',
}

const PIE_COLORS = ['#16a34a', '#6b7280', '#dc2626', '#d97706']

function StatistiquesPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [data, setData]           = useState(null)
    const [project, setProject]     = useState(null)
    const [loading, setLoading]     = useState(true)
    const [error, setError]         = useState('')
    const [exporting, setExporting] = useState(false)

    /* Ref sur la zone à capturer (cartes stats + graphiques) */
    const statsRef = useRef(null)

    useEffect(() => {
        const load = async () => {
            try {
                const [stats, proj] = await Promise.all([
                    getStatistiques(id),
                    getProjectById(id)
                ])
                setData(stats)
                setProject(proj)
            } catch {
                setError('Erreur lors du chargement des statistiques')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id])

    /* Export PDF — capture chaque section séparément, taille proportionnelle */
    const handleExportPDF = async () => {
        if (!statsRef.current) return
        setExporting(true)
        try {
            /* Dimensions A4 portrait en mm */
            const pdfW = 210
            const pdfH = 297
            const margin = 15
            const usableW = pdfW - margin * 2
            const gap = 6

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            })

            /* Titre en haut de la 1ère page */
            pdf.setFontSize(9)
            pdf.setTextColor(150)
            const titre = project?.nomProjet
                ? `Statistiques — ${project.nomProjet}`
                : 'Statistiques bibliométriques'
            pdf.text(titre, pdfW / 2, 10, { align: 'center' })

            /* Largeur réelle du conteneur à l'écran (référence = 100%) */
            const containerW = statsRef.current.offsetWidth

            const blocks = statsRef.current.querySelectorAll(
                '.stats-grid, .chart-card, .top-articles-section'
            )

            let y = margin

            for (const block of blocks) {
                const canvas = await html2canvas(block, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#f0f4f8',
                    logging: false,
                })

                const imgData = canvas.toDataURL('image/png')

                /* Proportion de la section par rapport au conteneur :
                1 = pleine largeur, ~0.5 = demi-largeur (camembert) */
                const widthRatio = Math.min(block.offsetWidth / containerW, 1)

                const imgW = usableW * widthRatio
                const imgH = (canvas.height * imgW) / canvas.width

                /* Nouvelle page si la section ne rentre pas entière */
                if (y + imgH > pdfH - margin) {
                    pdf.addPage()
                    y = margin
                }

                /* Centrer horizontalement les sections moins larges */
                const x = margin + (usableW - imgW) / 2

                pdf.addImage(imgData, 'PNG', x, y, imgW, imgH)
                y += imgH + gap
            }

            const filename = project?.nomProjet
                ? `Statistiques_${project.nomProjet.replace(/\s+/g, '_')}.pdf`
                : 'Statistiques.pdf'

            pdf.save(filename)
        } catch (err) {
            console.error('Export PDF échoué :', err)
        } finally {
            setExporting(false)
        }
    }


    if (loading) return (
        <div className="statistiques-page">
            <Navbar />
            <div className="statistiques-loading">
                Chargement des statistiques...
            </div>
        </div>
    )

    if (error) return (
        <div className="statistiques-page">
            <Navbar />
            <div className="statistiques-error">{error}</div>
        </div>
    )

    // Préparer Données pour BarChart années
    const yearData = data?.articlesByYear
        ? Object.entries(data.articlesByYear).map(([year, count]) => ({
            year: parseInt(year),
            articles: count
        }))
        : []

    // Préparer données pour PieChart statuts
    const statutData = data?.articlesByStatut
        ? Object.entries(data.articlesByStatut).map(([statut, count]) => ({
            name: statut === 'A_LIRE' ? 'À lire'
                : statut === 'RETENU' ? 'Retenu'
                : statut === 'EXCLU' ? 'Exclu'
                : 'Doublon',
            value: count,
            color: STATUT_COLORS[statut] || '#6b7280'
        }))
        : []

    // Préparer données top auteurs
    const auteurData = data?.topAuteurs
        ? data.topAuteurs.map(auteur => ({
            name: auteur.name && auteur.name.length > 20
                ? auteur.name.substring(0, 20) + '...'
                : auteur.name || 'Inconnu',
            articles: auteur.count
        }))
        : []

    return (
        <div className="statistiques-page">
            <Navbar />
            <div className="statistiques-container">

                {/* ── Barre d'actions : Retour + Export PDF ── */}
                <div className="stats-topbar">
                    <button className="btn-back"
                        onClick={() => navigate(`/projects/${id}`)}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Retour au projet
                    </button>

                    <button
                        className={`btn-export-pdf${exporting ? ' btn-export-pdf--loading' : ''}`}
                        onClick={handleExportPDF}
                        disabled={exporting}
                        title="Télécharger les statistiques en PDF"
                    >
                        <FontAwesomeIcon icon={exporting ? faSpinner : faFilePdf} spin={exporting} />
                        {exporting ? 'Export en cours…' : 'Télécharger PDF'}
                    </button>
                </div>

                <h1 className="statistiques-title">
                    <FontAwesomeIcon icon={faChartBar} />
                    Statistiques — {project?.nomProjet}
                </h1>
                <p className="statistiques-subtitle">
                    Analyse bibliométrique de votre projet
                </p>

                {/* ZONE CAPTURÉE POUR LE PDF */}
                <div id="stats-content" ref={statsRef} className="stats-capture-wrapper">

                    {/* ── Cartes stats globales ── */}
                    <div className="stats-grid">
                        <div className="stat-card stat-blue">
                            <span className="stat-card-num">
                                {data.totalArticles}
                            </span>
                            <span className="stat-card-lbl">
                                Total articles
                            </span>
                        </div>
                        <div className="stat-card stat-green">
                            <FontAwesomeIcon icon={faCircleCheck}
                                className="stat-icon" />
                            <span className="stat-card-num">
                                {data.totalRetenus}
                            </span>
                            <span className="stat-card-lbl">Retenus</span>
                        </div>
                        <div className="stat-card stat-gray">
                            <FontAwesomeIcon icon={faBookOpen}
                                className="stat-icon" />
                            <span className="stat-card-num">
                                {data.totalALire}
                            </span>
                            <span className="stat-card-lbl">À lire</span>
                        </div>
                        <div className="stat-card stat-red">
                            <FontAwesomeIcon icon={faCircleXmark}
                                className="stat-icon" />
                            <span className="stat-card-num">
                                {data.totalExclus}
                            </span>
                            <span className="stat-card-lbl">Exclus</span>
                        </div>
                        <div className="stat-card stat-yellow">
                            <FontAwesomeIcon icon={faCopy}
                                className="stat-icon" />
                            <span className="stat-card-num">
                                {data.totalDoublons}
                            </span>
                            <span className="stat-card-lbl">Doublons</span>
                        </div>
                    </div>

                    {/* ── Graphiques ── */}
                    <div className="charts-grid">

                        {/* Publications par année */}
                        <div className="chart-card chart-wide">
                            <h2 className="chart-title">
                                📅 Publications par année
                            </h2>
                            {yearData.length > 0 ? (
                                <ResponsiveContainer
                                    width="100%" height={260}>
                                    <BarChart data={yearData}
                                        margin={{ top: 10, right: 20,
                                            left: 0, bottom: 5 }}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#f0f0f0" />
                                        <XAxis dataKey="year"
                                            tick={{ fontSize: 12 }} />
                                        <YAxis
                                            tick={{ fontSize: 12 }}
                                            allowDecimals={false} />
                                        <Tooltip
                                            formatter={(v) =>
                                                [`${v} article(s)`,
                                                'Articles']} />
                                        <Bar dataKey="articles"
                                            fill="#2563eb"
                                            radius={[4,4,0,0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="chart-empty">
                                    Pas assez de données
                                </p>
                            )}
                        </div>

                        {/* Répartition par statut */}
                        <div className="chart-card">
                            <h2 className="chart-title">
                                📊 Répartition par statut
                            </h2>
                            {statutData.length > 0 ? (
                                <ResponsiveContainer
                                    width="100%" height={260}>
                                    <PieChart>
                                        <Pie
                                            data={statutData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={90}
                                            dataKey="value"
                                            label={({ name, value }) =>
                                                `${name}: ${value}`}
                                            labelLine={false}
                                        >
                                            {statutData.map((entry, i) => (
                                                <Cell
                                                    key={`cell-${i}`}
                                                    fill={entry.color ||
                                                        PIE_COLORS[
                                                            i % PIE_COLORS.length
                                                        ]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(v, n) =>
                                                [`${v} article(s)`, n]} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="chart-empty">
                                    Pas assez de données
                                </p>
                            )}
                        </div>

                        {/* Top auteurs */}
                        <div className="chart-card chart-wide">
                            <h2 className="chart-title">
                                👥 Top 10 auteurs
                            </h2>
                            {auteurData.length > 0 ? (
                                <ResponsiveContainer
                                    width="100%" height={260}>
                                    <BarChart
                                        data={auteurData}
                                        layout="vertical"
                                        margin={{ top: 5, right: 30,
                                            left: 10, bottom: 5 }}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#f0f0f0" />
                                        <XAxis type="number"
                                            tick={{ fontSize: 11 }}
                                            allowDecimals={false} />
                                        <YAxis type="category"
                                            dataKey="name"
                                            tick={{ fontSize: 11 }}
                                            width={140} />
                                        <Tooltip
                                            formatter={(v) =>
                                                [`${v} article(s)`,
                                                'Articles']} />
                                        <Bar dataKey="articles"
                                            fill="#16a34a"
                                            radius={[0,4,4,0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="chart-empty">
                                    Pas assez de données
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ── Top articles par citations ── */}
                    {data.topArticlesByCitations?.length > 0 && (
                        <div className="top-articles-section">
                            <h2 className="chart-title">
                                🏆 Top 5 articles les plus cités
                            </h2>
                            <div className="top-articles-list">
                                {data.topArticlesByCitations.map(
                                    (article, index) => (
                                    <div key={index}
                                        className="top-article-item">
                                        <div className="top-article-rank">
                                            #{index + 1}
                                        </div>
                                        <div className="top-article-info">
                                            <p className="top-article-title">
                                                {article.url ? (
                                                    <a href={article.url}
                                                        target="_blank"
                                                        rel="noreferrer">
                                                        {article.titre}
                                                    </a>
                                                ) : article.titre}
                                            </p>
                                            <p className="top-article-meta">
                                                {article.auteurs &&
                                                    `👥 ${article.auteurs}`}
                                                {article.annee &&
                                                    ` · 📅 ${article.annee}`}
                                            </p>
                                        </div>
                                        <div className="top-article-citations">
                                            <span className="citations-badge">
                                                📊 {article.citations}
                                            </span>
                                            <span className="citations-lbl">
                                                citations
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>{/* fin zone capturée */}

            </div>
        </div>
    )
}

export default StatistiquesPage