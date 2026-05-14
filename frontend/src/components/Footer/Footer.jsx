import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faBookOpen,
    faSearch,
    faFolder,
    faFileExport,
    faChartBar,
    faEnvelope,
    faGraduationCap
} from '@fortawesome/free-solid-svg-icons'
import './Footer.css'
import '../../../public/image/logo FSBM.jpeg'

function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="footer">
            <div className="footer-container">

                {/* ── Colonne 1 : Brand ── */}
                <div className="footer-brand-col">
                    <div className="footer-brand">
                        <FontAwesomeIcon icon={faBookOpen} />
                        BiblioApp
                    </div>
                    <p className="footer-brand-desc">
                        Application web d'aide à la recherche
                        bibliographique, à la gestion des références
                        scientifiques et à la génération automatique
                        de fichiers BibTeX.
                    </p>
                </div>

                {/* ── Colonne 2 : Navigation ── */}
                <div className="footer-col">
                    <h4 className="footer-col-title">Navigation</h4>
                    <ul className="footer-links">
                        <li>
                            <Link to="/home" className="footer-link">
                                <FontAwesomeIcon icon={faBookOpen} />
                                Accueil
                            </Link>
                        </li>
                        <li>
                            <Link to="/search" className="footer-link">
                                <FontAwesomeIcon icon={faSearch} />
                                Recherche
                            </Link>
                        </li>
                        <li>
                            <Link to="/projects" className="footer-link">
                                <FontAwesomeIcon icon={faFolder} />
                                Mes Projets
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* ── Colonne 3 : Fonctionnalités ── */}
                <div className="footer-col">
                    <h4 className="footer-col-title">Fonctionnalités</h4>
                    <ul className="footer-links">
                        <li>
                            <span className="footer-link">
                                <FontAwesomeIcon icon={faSearch} />
                                Recherche multi-sources
                            </span>
                        </li>
                        <li>
                            <span className="footer-link">
                                <FontAwesomeIcon icon={faFileExport} />
                                Export BibTeX / CSV / RIS
                            </span>
                        </li>
                        <li>
                            <span className="footer-link">
                                <FontAwesomeIcon icon={faChartBar} />
                                Dashboard bibliométrique
                            </span>
                        </li>
                        <li>
                            <span className="footer-link">
                                <FontAwesomeIcon icon={faFolder} />
                                Gestion de projets
                            </span>
                        </li>
                    </ul>
                </div>

                {/* ── Colonne 4 : Contact ── */}
                <div className="footer-col">
                    <h4 className="footer-col-title">Contact</h4>
                    <ul className="footer-links">
                        <li>
                            <span className="footer-link">
                                <FontAwesomeIcon icon={faEnvelope} />
                                biblioapp@gmail.com
                            </span>
                        </li>
                        <li>
                            <span className="footer-link">
                                <FontAwesomeIcon icon={faGraduationCap} />
                                Université — Faculté des Sciences
                            </span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* ── Logo Université ── */}
            <div className="footer-university">
                <img 
                    src="../../../public/image/logo FSBM.jpeg" 
                    alt="Logo Faculté des Sciences" 
                    className="university-logo"
                />
                <div className="university-text">
                    <p>Faculté des Sciences</p>
                </div>
            </div>

            {/* ── Bottom bar ── */}
            <div className="footer-bottom">
                <p className="footer-copy">
                    © {currentYear} BiblioApp — Tous droits réservés
                </p>
            </div>
        </footer>
    )
}

export default Footer