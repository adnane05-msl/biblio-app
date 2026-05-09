// frontend/src/pages/HomePage.jsx
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import './HomePage.css'
import Navbar from '../../components/Navbar/Navbar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faFolder, faFileExport, faChartBar, faMicroscope, faBook} from '@fortawesome/free-solid-svg-icons'

function HomePage() {
    const { user } = useAuth()

    return (
        <div className="homepage">
            <Navbar />
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Bibliographic Assistant
                    </h1>
                    <p className="hero-subtitle">
                        Gérez vos références scientifiques en toute simplicité
                    </p>
                    <p className="hero-description">
                        Recherchez dans plusieurs sources, organisez vos projets,
                        et exportez vos bibliographies au format BibTeX, CSV ou RIS.
                    </p>
                    <Link 
                        to={user ? "/projects" : "/register"} 
                        className="btn-hero"
                    >
                        {user ? "Accéder à mes projets →" : "Commencer gratuitement →"}
                    </Link>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <h2 className="section-title">Fonctionnalités</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </div>
                        <h3>Recherche multi-sources</h3>
                        <p>Interrogez Crossref, OpenAlex et arXiv simultanément</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <FontAwesomeIcon icon={faFolder} />
                        </div>
                        <h3>Projets organisés</h3>
                        <p>Créez des projets et classez vos articles par statut</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <FontAwesomeIcon icon={faFileExport} />
                            </div>
                        <h3>Export BibTeX/CSV/RIS</h3>
                        <p>Compatibilité avec LaTeX, Zotero et Mendeley</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <FontAwesomeIcon icon={faChartBar} />
                        </div>
                        <h3>Analyse bibliométrique</h3>
                        <p>Visualisez vos publications par année, auteurs, citations</p>
                    </div>
                </div>
            </section>

            {/* Sources Section */}
            <section className="sources">
                <h2 className="section-title">Sources scientifiques</h2>
                <div className="sources-grid">
                    <div className="source-card">
                        <div className="source-icon">
                            <FontAwesomeIcon icon={faMicroscope} />
                        </div>
                        <h3>Crossref</h3>
                        <p>API académique majeure</p>
                    </div>
                    <div className="source-card">
                        <div className="source-icon">
                            <FontAwesomeIcon icon={faBook} />
                        </div>
                        <h3>OpenAlex</h3>
                        <p>Base de données gratuite</p>
                    </div>
                    {/* <div className="source-card">
                        <div className="source-icon">
                            <FontAwesomeIcon icon={faFileAlt} />
                        </div>
                        <h3>arXiv</h3>
                        <p>Preprints scientifiques</p>
                    </div> */}
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats">
                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="stat-number">2+</span>
                        <span className="stat-label">Sources API</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">100+</span>
                        <span className="stat-label">Articles par recherche</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">3+</span>
                        <span className="stat-label">Formats d'export</span>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <h2>Prêt à organiser vos recherches ?</h2>
                <Link to="/register" className="btn-cta">
                    Créer un compte gratuitement
                </Link>
            </section>
        </div>
    )
}

export default HomePage