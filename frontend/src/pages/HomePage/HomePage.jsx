import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import './HomePage.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faSearch,
    faFolder, faFileExport, faCopy,
    faNoteSticky, faChartBar,
    faBookOpen, faArrowRight, faGraduationCap, faUserPlus
} from '@fortawesome/free-solid-svg-icons'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'

const features = [
    {
        icon: faSearch,
        color: 'icon-blue',
        name: 'Recherche intelligente',
        desc: 'Trouvez des milliers d\'articles scientifiques à partir de simples mots-clés.'
    },
    {
        icon: faFolder,
        color: 'icon-green',
        name: 'Gestion de projets',
        desc: 'Organisez vos articles par projet de recherche avec statuts et annotations.'
    },
    {
        icon: faFileExport,
        color: 'icon-amber',
        name: 'Export bibliographique',
        desc: 'Générez vos références pour LaTeX, Zotero ou Mendeley en un clic.'
    },
    {
        icon: faCopy,
        color: 'icon-coral',
        name: 'Déduplication auto',
        desc: 'Détection automatique des doublons pour des résultats toujours propres.'
    },
    {
        icon: faNoteSticky,
        color: 'icon-purple',
        name: 'Annotations et statuts',
        desc: 'Marquez chaque article : retenu, exclu, à lire ou doublon.'
    },
    {
        icon: faChartBar,
        color: 'icon-teal',
        name: 'Dashboard bibliométrique',
        desc: 'Visualisez la répartition par année, auteur et statut de vos articles.'
    },
]

const steps = [
    {
        num: 1,
        label: 'Créez un compte',
        desc: 'Inscription rapide avec votre profil académique'
    },
    {
        num: 2,
        label: 'Recherchez',
        desc: 'Entrez vos mots-clés et obtenez des résultats dédupliqués'
    },
    {
        num: 3,
        label: 'Organisez',
        desc: 'Sauvegardez et annotez vos articles dans vos projets'
    },
    {
        num: 4,
        label: 'Exportez',
        desc: 'Téléchargez vos références en BibTeX, CSV ou RIS'
    },
]

const previewArticles = [
    {
        year: 2023,
        title: 'Deep Learning for Natural Language Processing',
        meta: 'Smith et al. · 142 citations'
    },
    {
        year: 2024,
        title: 'Machine Learning in Healthcare: A Review',
        meta: 'Johnson et al. · 89 citations'
    },
    {
        year: 2024,
        title: 'Transformer Models for Scientific Text',
        meta: 'Lee et al. · 56 citations'
    },
]

function HomePage() {
    const navigate = useNavigate()
    const { user } = useAuth()


    return (
        <div className="home-page">
            <Navbar />
            {/* ── HERO ── */}
            <section className="hero-section">
                <svg className="hero-bg" viewBox="0 0 680 420" preserveAspectRatio="xMidYMid slice">
                    <circle cx="580" cy="80" r="120" fill="#2563eb" opacity="0.15"/>
                    <circle cx="620" cy="320" r="90" fill="#16a34a" opacity="0.1"/>
                    <circle cx="30" cy="30" r="90" fill="#7c3aed" opacity="0.12"/>
                </svg>

                <div className="hero-content">
                    <span className="hero-badge">
                        <FontAwesomeIcon icon={faGraduationCap} />
                        Application de recherche bibliographique
                    </span>
                    <h1 className="hero-title">
                        Recherchez, organisez et exportez vos{' '}
                        <span>références scientifiques</span>
                    </h1>
                    <p className="hero-subtitle">
                        BiblioApp interroge automatiquement les bases de données
                        scientifiques, déduplique les résultats et génère vos
                        fichiers BibTeX, CSV et RIS en un clic.
                    </p>


                    <div className="hero-cta">
                        {!user ? (
                            <>
                                <button
                                    className="btn-primary-hero"
                                    onClick={() => navigate('/register')}
                                >
                                    <FontAwesomeIcon icon={faUserPlus} />
                                    Créer un compte
                                </button>
                                <button
                                    className="btn-secondary-hero"
                                    onClick={() => navigate('/Login')}
                                >
                                    Se connecter
                                </button>
                            </>
                        ) : (
                            <button
                                className="btn-primary-hero"
                                onClick={() => navigate('/Projects')}
                            >
                                <FontAwesomeIcon icon={faArrowRight} />
                                Accéder à mes projets
                            </button>
                        )}
                    </div>

                </div>

                {/* Cartes d'aperçu */}
                <div className="hero-visual">
                    <div className="hero-card-stack">
                        {previewArticles.map((article, index) => (
                            <div
                                key={index}
                                className={`mini-card mini-card-${index + 1}`}
                            >
                                <span className="mini-card-type">
                                    <FontAwesomeIcon icon={faBookOpen} />
                                    Article · {article.year}
                                </span>
                                <p className="mini-card-title">
                                    {article.title}
                                </p>
                                <p className="mini-card-meta">
                                    {article.meta}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── STATS ── */}
            <section className="stats-section">
                <div className="stats-grid">
                    <div className="stat-box">
                        <span className="stat-num">+200</span>
                        <p className="stat-label">Articles par recherche</p>
                    </div>
                    <div className="stat-box">
                        <span className="stat-num">3</span>
                        <p className="stat-label">Formats d'export</p>
                    </div>
                    <div className="stat-box">
                        <span className="stat-num">100%</span>
                        <p className="stat-label">Gratuit et accessible</p>
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section className="features-section">
                <h2 className="section-title">
                    Tout ce dont vous avez besoin pour votre revue de littérature
                </h2>
                <p className="section-sub">
                    6 modules conçus pour les étudiants et chercheurs
                </p>
                <div className="features-grid">
                    {features.map((f, index) => (
                        <div key={index} className="feature-card">
                            <div className={`feature-icon ${f.color}`}>
                                <FontAwesomeIcon icon={f.icon} />
                            </div>
                            <p className="feature-name">{f.name}</p>
                            <p className="feature-desc">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── COMMENT ÇA MARCHE ── */}
            <section className="steps-section">
                <h2 className="section-title">Comment ça marche ?</h2>
                <p className="section-sub">
                    4 étapes pour une revue de littérature complète
                </p>
                <div className="steps-row">
                    {steps.map((step, index) => (
                        <div key={index} className="step-item">
                            <div className="step-connector" />
                            <div className="step-num">{step.num}</div>
                            <p className="step-label">{step.label}</p>
                            <p className="step-desc">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA FINAL ── */}
            <section className="cta-section">
                <h2 className="cta-title">
                    Prêt à simplifier votre recherche bibliographique ?
                </h2>
                <p className="cta-sub">
                    Rejoignez BiblioApp et commencez votre première
                    revue de littérature aujourd'hui.
                </p>
                <div className="cta-buttons">
                    <button
                        className="btn-primary-hero"
                        onClick={() => navigate('/register')}
                    >
                        <FontAwesomeIcon icon={faUserPlus} />
                        Créer un compte
                    </button>
                    <button
                        className="btn-secondary-hero"
                        onClick={() => navigate('/Login')}
                    >
                        Se connecter
                    </button>
                </div>
            </section>

            <Footer />
        </div>
    )
}

export default HomePage