import { useEffect, useState } from 'react';
import { getSources, testerSource, viderCache } from '../../services/adminService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faScrewdriverWrench,
    faServer,
    faDatabase,
    faCode,
    faCircleCheck,
    faWifi,
    faArrowsRotate,
    faPlay,
    faEraser,
    faCircleXmark,
    faTrash,
} from '@fortawesome/free-solid-svg-icons';
import './AdminPages.css';
import './MaintenancePage.css';

const COMPOSANTS = [
    {
        icon: faCode,
        label: 'Frontend',
        valeur: 'React.js',
        detail: 'Interface utilisateur — port 5173',
        color: '#3b82f6',
        bgColor: '#eff6ff',
        borderColor: '#bfdbfe',
    },
    {
        icon: faServer,
        label: 'Backend',
        valeur: 'Spring Boot 3.5',
        detail: 'API REST — port 9090',
        color: '#7c3aed',
        bgColor: '#f5f3ff',
        borderColor: '#ddd6fe',
    },
    {
        icon: faDatabase,
        label: 'Base de données',
        valeur: 'PostgreSQL 16.13',
        detail: 'Base : bibliodb',
        color: '#059669',
        bgColor: '#f0fdf4',
        borderColor: '#bbf7d0',
    },
];

export default function MaintenancePage() {
    const [sources,      setSources]      = useState([]);
    const [testResults,  setTestResults]  = useState({});
    const [testLoading,  setTestLoading]  = useState({});
    const [actionMsg,    setActionMsg]    = useState(null);
    const [cacheLoading, setCacheLoading] = useState(false);

    useEffect(() => {
        getSources().then(setSources).catch(() => {});
    }, []);

    /* ── Tester une source ── */
    async function handleTester(source) {
        setTestLoading((l) => ({ ...l, [source.id]: true }));
        try {
            const res = await testerSource(source.id);
            setTestResults((r) => ({ ...r, [source.id]: res }));
        } catch (e) {
            setTestResults((r) => ({
                ...r,
                [source.id]: { statut: 'ERREUR', latence: -1, message: e.message },
            }));
        } finally {
            setTestLoading((l) => ({ ...l, [source.id]: false }));
        }
    }

    /* ── Vider le cache ── */
    async function handleViderCache() {
        setCacheLoading(true);
        try {
            const res = await viderCache();
            setActionMsg({ text: res.message, type: 'ok' });
        } catch (e) {
            setActionMsg({ text: e.message, type: 'error' });
        } finally {
            setCacheLoading(false);
            setTimeout(() => setActionMsg(null), 4000);
        }
    }

    return (
        <div className="admin-page">

            {/* ── En-tête ── */}
            <div className="page-header">
                <h1 className="page-title">
                    <FontAwesomeIcon icon={faScrewdriverWrench} style={{ color: '#d97706' }} />
                    Maintenance
                </h1>
                <p className="page-sub">État et outils de l'application</p>
            </div>

            {/* ── Message action ── */}
            {actionMsg && (
                <div className={`maintenance-alert maintenance-alert--${actionMsg.type}`}>
                    <FontAwesomeIcon
                        icon={actionMsg.type === 'ok' ? faCircleCheck : faCircleXmark}
                    />
                    {actionMsg.text}
                </div>
            )}

            {/* ══ Section 1 : Outils cache ══ */}
            <section className="card">
                <h2 className="card-title">
                    <FontAwesomeIcon icon={faTrash} style={{ color: '#d97706' }} />
                    Outils de maintenance
                </h2>

                <div className="maintenance-tools-grid">
                    <div className="maintenance-tool-item">
                        <div className="maintenance-tool-info">
                            <p className="maintenance-tool-name">Cache applicatif</p>
                            <p className="maintenance-tool-desc">
                                Vider les données mises en cache pour forcer le rechargement depuis la base.
                            </p>
                        </div>
                        <button
                            className="btn btn--sm btn--amber"
                            disabled={cacheLoading}
                            onClick={handleViderCache}
                        >
                            <FontAwesomeIcon icon={cacheLoading ? faArrowsRotate : faEraser} spin={cacheLoading} />
                            {cacheLoading ? 'En cours…' : 'Vider'}
                        </button>
                    </div>
                </div>
            </section>

            {/* ══ Section 2 : État des composants ══ */}
            <section className="card">
                <h2 className="card-title">
                    <FontAwesomeIcon icon={faServer} style={{ color: '#7c3aed' }} />
                    État des composants
                </h2>

                <div className="composants-grid">
                    {COMPOSANTS.map((c) => (
                        <div
                            key={c.label}
                            className="composant-card"
                            style={{ borderColor: c.borderColor, background: c.bgColor }}
                        >
                            <div className="composant-icon" style={{ color: c.color }}>
                                <FontAwesomeIcon icon={c.icon} />
                            </div>
                            <div className="composant-card-body">
                                <p className="composant-label">{c.label}</p>
                                <p className="composant-valeur" style={{ color: c.color }}>{c.valeur}</p>
                                <p className="composant-detail">{c.detail}</p>
                                <span className="badge badge--green">
                                    <FontAwesomeIcon icon={faCircleCheck} style={{ marginRight: 4 }} />
                                    Opérationnel
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══ Section 3 : Test des sources ══ */}
            <section className="card">
                <h2 className="card-title">
                    <FontAwesomeIcon icon={faWifi} style={{ color: '#2563eb' }} />
                    Test des sources API
                </h2>
                <p className="maintenance-desc">
                    Vérifie la disponibilité de chaque source académique en temps réel.
                </p>

                {sources.length === 0 ? (
                    <p className="maintenance-empty">Aucune source configurée.</p>
                ) : (
                    <>
                        {/* ── Version desktop : tableau ── */}
                        <div className="sources-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Source</th>
                                        <th>URL</th>
                                        <th>Résultat</th>
                                        <th>Latence</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sources.map((s) => {
                                        const res     = testResults[s.id];
                                        const loading = testLoading[s.id];
                                        return (
                                            <tr key={s.id}>
                                                <td style={{ fontWeight: 600 }}>{s.nom}</td>
                                                <td className="sources-url-cell">{s.urlBase}</td>
                                                <td>{renderResultat(res, loading)}</td>
                                                <td>
                                                    {res?.latence != null && res.latence >= 0
                                                        ? `${res.latence} ms`
                                                        : '—'}
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn--sm btn--blue"
                                                        disabled={loading}
                                                        onClick={() => handleTester(s)}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={loading ? faArrowsRotate : faPlay}
                                                            spin={loading}
                                                        />
                                                        {loading ? 'Test…' : 'Tester'}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Version mobile : cartes ── */}
                        <div className="sources-cards">
                            {sources.map((s) => {
                                const res     = testResults[s.id];
                                const loading = testLoading[s.id];
                                return (
                                    <div key={s.id} className="source-mobile-card">
                                        <div className="source-mobile-header">
                                            <span className="source-mobile-name">{s.nom}</span>
                                            <button
                                                className="btn btn--sm btn--blue"
                                                disabled={loading}
                                                onClick={() => handleTester(s)}
                                            >
                                                <FontAwesomeIcon
                                                    icon={loading ? faArrowsRotate : faPlay}
                                                    spin={loading}
                                                />
                                                {loading ? 'Test…' : 'Tester'}
                                            </button>
                                        </div>
                                        <p className="source-mobile-url">{s.urlBase}</p>
                                        <div className="source-mobile-footer">
                                            <div>{renderResultat(res, loading)}</div>
                                            {res?.latence != null && res.latence >= 0 && (
                                                <span className="source-mobile-latence">
                                                    {res.latence} ms
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </section>

        </div>
    );
}

/* ── Helper résultat test ── */
function renderResultat(res, loading) {
    if (loading) return (
        <span style={{ color: '#2563eb', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
            <FontAwesomeIcon icon={faArrowsRotate} spin />
            Test en cours…
        </span>
    );
    if (!res) return <span style={{ color: '#9ca3af', fontSize: 13 }}>— non testé</span>;
    return (
        <span className={`badge badge--${res.statut === 'OK' ? 'green' : 'red'}`}>
            <FontAwesomeIcon
                icon={res.statut === 'OK' ? faCircleCheck : faCircleXmark}
                style={{ marginRight: 5 }}
            />
            {res.statut === 'OK' ? 'Accessible' : res.statut}
        </span>
    );
}