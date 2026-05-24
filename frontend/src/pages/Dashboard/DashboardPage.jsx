import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie,
    Cell, Legend
} from 'recharts'
import { getDashboard } from '../../services/DashboardServices'
import { getProjectById } from '../../services/ProjectServices'
import Navbar from '../../components/Navbar/Navbar'
import './DashboardPage.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faChartBar, faArrowLeft,
    faCircleCheck, faCircleXmark,
    faBookOpen, faCopy
} from '@fortawesome/free-solid-svg-icons'

// Couleurs pour les graphiques
const STATUT_COLORS = {
    RETENU:  '#16a34a',
    A_LIRE:  '#6b7280',
    EXCLU:   '#dc2626',
    DOUBLON: '#d97706',
}

const PIE_COLORS = ['#16a34a', '#6b7280', '#dc2626', '#d97706']

function DashboardPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [data, setData]       = useState(null)
    const [project, setProject] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError]     = useState('')

    useEffect(() => {
        const load = async () => {
            try {
                const [dash, proj] = await Promise.all([
                    getDashboard(id),
                    getProjectById(id)
                ])
                setData(dash)
                setProject(proj)
            } catch {
                setError('Erreur lors du chargement du dashboard')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id])

    if (loading) return (
        <div className="dashboard-page">
            <Navbar />
            <div className="dashboard-loading">
                Chargement du dashboard...
            </div>
        </div>
    )

    if (error) return (
        <div className="dashboard-page">
            <Navbar />
            <div className="dashboard-error">{error}</div>
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
        <div className="dashboard-page">
            <Navbar />
            <div className="dashboard-container">

                {/* En-tête */}
                <button className="btn-back"
                    onClick={() => navigate(`/projects/${id}`)}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                    Retour au projet
                </button>

                <h1 className="dashboard-title">
                    <FontAwesomeIcon icon={faChartBar} />
                    Dashboard — {project?.nomProjet}
                </h1>
                <p className="dashboard-subtitle">
                    Analyse bibliométrique de votre projet
                </p>

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

            </div>
        </div>
    )
}

export default DashboardPage