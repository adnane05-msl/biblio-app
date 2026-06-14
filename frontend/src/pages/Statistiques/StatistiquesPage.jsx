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
    faFilePdf, faSpinner,
    faLayerGroup, faCalendarDays,
    faChartPie, faUsers, faTrophy,
    faStar
} from '@fortawesome/free-solid-svg-icons'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

/* ── Palette des statuts ── */
const STATUT_COLORS = {
    RETENU:  '#16a34a',
    A_LIRE:  '#6b7280',
    EXCLU:   '#dc2626',
    DOUBLON: '#d97706',
}

const PIE_COLORS = ['#16a34a', '#6b7280', '#dc2626', '#d97706']

function StatistiquesPage() {
    const { id }       = useParams()
    const navigate     = useNavigate()

    const [data,      setData]      = useState(null)
    const [project,   setProject]   = useState(null)
    const [loading,   setLoading]   = useState(true)
    const [error,     setError]     = useState('')
    const [exporting, setExporting] = useState(false)

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

    /* ── Export PDF ── */
    const handleExportPDF = async () => {
        if (!statsRef.current) return
        setExporting(true)
        try {
            const pdfW    = 210
            const pdfH    = 297
            const margin  = 15
            const usableW = pdfW - margin * 2
            const gap     = 6

            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

            pdf.setFontSize(9)
            pdf.setTextColor(150)
            const titre = project?.nomProjet
                ? `Statistiques — ${project.nomProjet}`
                : 'Statistiques'
            pdf.text(titre, margin, margin - 3)

            const sections = statsRef.current.querySelectorAll(
                '.stats-grid, .charts-grid, .top-articles-section'
            )

            let cursorY = margin

            for (const section of sections) {
                const canvas = await html2canvas(section, {
                    scale: 2,
                    backgroundColor: '#f0f4f8',
                    useCORS: true,
                    logging: false,
                })
                const imgData = canvas.toDataURL('image/png')
                const imgW    = usableW
                const imgH    = (canvas.height / canvas.width) * imgW

                if (cursorY + imgH > pdfH - margin) {
                    pdf.addPage()
                    cursorY = margin
                }

                pdf.addImage(imgData, 'PNG', margin, cursorY, imgW, imgH)
                cursorY += imgH + gap
            }

            pdf.save(`stats-${project?.nomProjet ?? id}.pdf`)
        } catch (err) {
            console.error('PDF export error:', err)
        } finally {
            setExporting(false)
        }
    }

    /* ── États ── */
    if (loading) return (
        <div className="statistiques-page">
            <Navbar />
            <div className="statistiques-loading">
                <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                Chargement des statistiques…
            </div>
        </div>
    )

    if (error) return (
        <div className="statistiques-page">
            <Navbar />
            <div className="statistiques-error">{error}</div>
        </div>
    )

    /* ── Préparer les données ── */
    const yearData = data?.articlesByYear
        ? Object.entries(data.articlesByYear)
            .map(([year, count]) => ({ year: parseInt(year), articles: count }))
            .sort((a, b) => a.year - b.year)
        : []

    const statutData = data?.articlesByStatut
        ? Object.entries(data.articlesByStatut).map(([statut, count]) => ({
            name: statut === 'A_LIRE'  ? 'À lire'
                : statut === 'RETENU'  ? 'Retenu'
                : statut === 'EXCLU'   ? 'Exclu'
                : 'Doublon',
            value: count,
            color: STATUT_COLORS[statut] || '#6b7280'
        }))
        : []

    const auteurData = data?.topAuteurs
        ? data.topAuteurs.map(auteur => ({
            name: auteur.name && auteur.name.length > 22
                ? auteur.name.substring(0, 22) + '…'
                : auteur.name || 'Inconnu',
            articles: auteur.count
        }))
        : []

    /* ── Préparer top articles dédupliqués ── */
    // Déduplication : on garde le 1er occurrence par DOI (si dispo), sinon par titre normalisé
    const deduplicatedTop = (() => {
        if (!data.topArticlesByCitations?.length) return []
        const seenDoi   = new Set()
        const seenTitle = new Set()
        const result    = []
        for (const article of data.topArticlesByCitations) {
            const doi   = article.doi?.trim().toLowerCase()
            const titre = article.titre?.trim().toLowerCase().replace(/\s+/g, ' ')
            if (doi && seenDoi.has(doi))     continue
            if (titre && seenTitle.has(titre)) continue
            if (doi)   seenDoi.add(doi)
            if (titre) seenTitle.add(titre)
            result.push(article)
            if (result.length === 5) break   // max 5 articles
        }
        return result
    })()
    const RANK_ICONS = [faTrophy, faStar, faStar, faStar, faStar]
    const RANK_COLORS = ['#d97706', '#6b7280', '#92400e', '#374151', '#374151']

    return (
        <div className="statistiques-page">
            <Navbar />

            <div className="statistiques-container">

                {/* ══ Barre Retour + Export PDF ══ */}
                <div className="stats-topbar">
                    <button
                        className="btn-back"
                        onClick={() => navigate(`/projects/${id}`)}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Retour au projet
                    </button>

                    <button
                        className={`btn-export-pdf${exporting ? ' btn-export-pdf--loading' : ''}`}
                        onClick={handleExportPDF}
                        disabled={exporting}
                        title="Télécharger les statistiques en PDF"
                    >
                        <FontAwesomeIcon
                            icon={exporting ? faSpinner : faFilePdf}
                            spin={exporting}
                        />
                        {exporting ? 'Export en cours…' : 'Télécharger PDF'}
                    </button>
                </div>

                {/* ══ En-tête ══ */}
                <div className="stats-page-header">
                    <h1 className="statistiques-title">
                        <FontAwesomeIcon icon={faChartBar} />
                        Statistiques — {project?.nomProjet}
                    </h1>
                    <p className="statistiques-subtitle">
                        Analyse bibliométrique de votre projet
                    </p>
                </div>

                {/* ══ Zone capturée PDF ══ */}
                <div id="stats-content" ref={statsRef} className="stats-capture-wrapper">

                    {/* ── 5 cartes globales ── */}
                    <div className="stats-grid">

                        <div className="stat-card stat-blue">
                            <FontAwesomeIcon icon={faLayerGroup} className="stat-icon" />
                            <span className="stat-card-num">{data.totalArticles}</span>
                            <span className="stat-card-lbl">Total articles</span>
                        </div>

                        <div className="stat-card stat-green">
                            <FontAwesomeIcon icon={faCircleCheck} className="stat-icon" />
                            <span className="stat-card-num">{data.totalRetenus}</span>
                            <span className="stat-card-lbl">Retenus</span>
                        </div>

                        <div className="stat-card stat-gray">
                            <FontAwesomeIcon icon={faBookOpen} className="stat-icon" />
                            <span className="stat-card-num">{data.totalALire}</span>
                            <span className="stat-card-lbl">À lire</span>
                        </div>

                        <div className="stat-card stat-red">
                            <FontAwesomeIcon icon={faCircleXmark} className="stat-icon" />
                            <span className="stat-card-num">{data.totalExclus}</span>
                            <span className="stat-card-lbl">Exclus</span>
                        </div>

                        <div className="stat-card stat-yellow">
                            <FontAwesomeIcon icon={faCopy} className="stat-icon" />
                            <span className="stat-card-num">{data.totalDoublons}</span>
                            <span className="stat-card-lbl">Doublons</span>
                        </div>
                    </div>

                    {/* ── Graphiques ── */}
                    <div className="charts-grid">

                        {/* Publications par année — pleine largeur */}
                        <div className="chart-card chart-wide">
                            <h2 className="chart-title">
                                <span className="chart-title-icon chart-title-icon--blue">
                                    <FontAwesomeIcon icon={faCalendarDays} />
                                </span>
                                Publications par année
                            </h2>
                            {yearData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={240}>
                                    <BarChart
                                        data={yearData}
                                        margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                                        <Tooltip formatter={(v) => [`${v} article(s)`, 'Articles']} />
                                        <Bar dataKey="articles" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="chart-empty">Pas assez de données</p>
                            )}
                        </div>

                        {/* Répartition par statut */}
                        <div className="chart-card">
                            <h2 className="chart-title">
                                <span className="chart-title-icon chart-title-icon--purple">
                                    <FontAwesomeIcon icon={faChartPie} />
                                </span>
                                Répartition par statut
                            </h2>
                            {statutData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie
                                            data={statutData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={90}
                                            dataKey="value"
                                            label={({ name, value }) => `${name}: ${value}`}
                                            labelLine={false}
                                        >
                                            {statutData.map((entry, i) => (
                                                <Cell
                                                    key={`cell-${i}`}
                                                    fill={entry.color || PIE_COLORS[i % PIE_COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(v, n) => [`${v} article(s)`, n]} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="chart-empty">Pas assez de données</p>
                            )}
                        </div>

                        {/* Top 10 auteurs */}
                        <div className="chart-card">
                            <h2 className="chart-title">
                                <span className="chart-title-icon chart-title-icon--green">
                                    <FontAwesomeIcon icon={faUsers} />
                                </span>
                                Top 10 auteurs
                            </h2>
                            {auteurData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart
                                        data={auteurData}
                                        layout="vertical"
                                        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            tick={{ fontSize: 11 }}
                                            width={140}
                                        />
                                        <Tooltip formatter={(v) => [`${v} article(s)`, 'Articles']} />
                                        <Bar dataKey="articles" fill="#16a34a" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="chart-empty">Pas assez de données</p>
                            )}
                        </div>
                    </div>

                    {/* ── Top 5 articles les plus cités ── */}
                    {deduplicatedTop.length > 0 && (
                        <div className="chart-card top-articles-section">
                            <h2 className="chart-title">
                                <span className="chart-title-icon chart-title-icon--amber">
                                    <FontAwesomeIcon icon={faTrophy} />
                                </span>
                                Top 5 articles les plus cités
                            </h2>

                            <div className="top-articles-list">
                                {deduplicatedTop.map((article, index) => (
                                    <div key={index} className="top-article-item">

                                        {/* Icône rang */}
                                        <div
                                            className="top-article-rank"
                                            style={{ color: RANK_COLORS[index] }}
                                        >
                                            <FontAwesomeIcon
                                                icon={RANK_ICONS[index]}
                                                className="rank-icon"
                                            />
                                            <span className="rank-num">#{index + 1}</span>
                                        </div>

                                        <div className="top-article-info">
                                            <p className="top-article-title">
                                                {article.url ? (
                                                    <a
                                                        href={article.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        {article.titre || 'Sans titre'}
                                                    </a>
                                                ) : (
                                                    article.titre || 'Sans titre'
                                                )}
                                            </p>
                                            <p className="top-article-meta">
                                                {[article.auteurs, article.annee]
                                                    .filter(Boolean)
                                                    .join(' · ')}
                                            </p>
                                        </div>

                                        <div className="top-article-citations">
                                            <span className="citations-badge">
                                                {article.citations ?? '—'}
                                            </span>
                                            <span className="citations-lbl">citations</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>{/* /stats-capture-wrapper */}
            </div>{/* /statistiques-container */}
        </div>
    )
}

export default StatistiquesPage