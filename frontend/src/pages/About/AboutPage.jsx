// frontend/src/pages/AboutPage.jsx
import './AboutPage.css'
import Navbar from '../../components/Navbar/Navbar'

function AboutPage() {
    return (
        <div className="aboutpage">
            <Navbar />

            <div className="about-container">
                <h1 className="about-title">ℹ️ À propos</h1>
                
                {/* Présentation */}
                <section className="about-section">
                    <h2>📖 Le projet</h2>
                    <p>
                        <strong>Bibliographic Assistant</strong> est une application web 
                        développée dans le cadre d'un Projet de Fin d'Études (PFE) de Licence.
                    </p>
                    <p>
                        L'objectif est d'aider les chercheurs et étudiants à rechercher,
                        organiser et exporter des références scientifiques.
                    </p>
                </section>

                {/* Problématique */}
                <section className="about-section">
                    <h2>🎯 Problématique</h2>
                    <p>
                        La recherche et la gestion des références scientifiques est une tâche 
                        répétitive, chronophage et sujette à des erreurs. Ce projet propose 
                        une solution centralisée et automatisée.
                    </p>
                </section>

                {/* Technologies */}
                <section className="about-section">
                    <h2>🛠️ Technologies utilisées</h2>
                    <div className="tech-grid">
                        <div className="tech-card">
                            <span className="tech-icon">☕</span>
                            <span>Spring Boot</span>
                        </div>
                        <div className="tech-card">
                            <span className="tech-icon">⚛️</span>
                            <span>React.js</span>
                        </div>
                        <div className="tech-card">
                            <span className="tech-icon">🐘</span>
                            <span>PostgreSQL</span>
                        </div>
                        <div className="tech-card">
                            <span className="tech-icon">🔐</span>
                            <span>JWT / BCrypt</span>
                        </div>
                    </div>
                </section>

                {/* Sources API */}
                <section className="about-section">
                    <h2>🔗 Sources scientifiques</h2>
                    <ul className="sources-list">
                        <li>
                            <a href="https://www.crossref.org/" target="_blank" rel="noreferrer">
                                Crossref API
                            </a> - Métadonnées académiques
                        </li>
                        <li>
                            <a href="https://openalex.org/" target="_blank" rel="noreferrer">
                                OpenAlex API
                            </a> - Base de données gratuite
                        </li>
                        <li>
                            <a href="https://arxiv.org/" target="_blank" rel="noreferrer">
                                arXiv API
                            </a> - Preprints scientifiques
                        </li>
                    </ul>
                </section>

                {/* Équipe */}
                <section className="about-section">
                    <h2>👥 Équipe</h2>
                    <div className="team-grid">
                        <div className="team-card">
                            <p className="team-name">[Ton Nom]</p>
                            <p className="team-role">Développeur Full Stack</p>
                        </div>
                        {/* Ajoute les membres de ton équipe ici */}
                    </div>
                </section>

                {/* Contact */}
                <section className="about-section">
                    <h2>📧 Contact</h2>
                    <p>
                        Pour toute question ou suggestion :<br />
                        <a href="mailto:ton.email@example.com" className="contact-email">
                            ton.email@example.com
                        </a>
                    </p>
                    <p>
                        GitHub : <a href="https://github.com/" target="_blank" rel="noreferrer">
                            github.com/ton-projet
                        </a>
                    </p>
                </section>

                {/* Licence */}
                <section className="about-section">
                    <h2>📄 Licence</h2>
                    <p>
                        Projet réalisé dans le cadre académique - Année universitaire 2025/2026
                    </p>
                </section>
            </div>
        </div>
    )
}

export default AboutPage