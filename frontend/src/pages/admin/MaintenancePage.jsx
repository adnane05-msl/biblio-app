import { useEffect, useState } from 'react';
import { getSources, testerSource, viderHistorique, viderCache } from '../../services/adminService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faScrewdriverWrench,
    faServer,
    faDatabase,
    faCode,
    faCircleCheck,
    faWifi,
    faGaugeHigh,
    faArrowsRotate,
    faPlay,
    faTrashCan,
    faEraser,
    faTriangleExclamation,
    faCircleXmark,
} from '@fortawesome/free-solid-svg-icons';
import './AdminPages.css';

const COMPOSANTS = [
    {
        icon: faCode,
        label: 'Frontend',
        valeur: 'React.js',
        detail: 'Interface utilisateur — port 5173',
        color: '#3b82f6',
    },
    {
        icon: faServer,
        label: 'Backend',
        valeur: 'Spring Boot 3.5',
        detail: 'API REST — port 9090',
        color: '#7c3aed',
    },
    {
        icon: faDatabase,
        label: 'Base de données',
        valeur: 'PostgreSQL 16.13',
        detail: 'Base : bibliodb',
        color: '#059669',
    },
    ];

    export default function MaintenancePage() {
    const [sources,       setSources]       = useState([]);
    const [testResults,   setTestResults]   = useState({});
    const [testLoading,   setTestLoading]   = useState({});
    const [actionMsg,     setActionMsg]     = useState(null); // ✅ utilisé pour TOUT (cache + historique)
    const [actionLoading, setActionLoading] = useState(false);
    const [cacheLoading,  setCacheLoading]  = useState(false);

    useEffect(() => {
        getSources().then(setSources).catch(() => {});
    }, []);

    // ── Tester une source ──────────────────────────────────────
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

  // ── Vider le cache ─────────────────────────────────────────
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

    // ── Vider l'historique ─────────────────────────────────────
    async function handleViderHistorique() {
        if (!window.confirm("Vider tout l'historique des recherches ?")) return;
        setActionLoading(true);
        try {
        const res = await viderHistorique();
        setActionMsg({ text: res.message, type: 'ok' });
        } catch (e) {
        setActionMsg({ text: e.message, type: 'error' });
        } finally {
        setActionLoading(false);
        setTimeout(() => setActionMsg(null), 4000);
        }
    }

    return (
        <div className="admin-page">

        {/* ── En-tête ──────────────────────────────────────────── */}
        <div className="page-header">
            <h1 className="page-title">
            <FontAwesomeIcon icon={faScrewdriverWrench}
                style={{ marginRight: 10, color: '#d97706' }} />
            Maintenance
            </h1>
            <p className="page-sub">État et outils de l'application</p>
        </div>

        

        {/* ── Section 2 : Test des sources ─────────────────────── */}
        <section className="card" style={{ marginBottom: 24 }}>
            <h2 className="card-title">
            <FontAwesomeIcon icon={faWifi}
                style={{ color: '#2563eb', marginRight: 8 }} />
            Test des sources API
            </h2>
            <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>
            Vérifie la disponibilité de chaque source académique en temps réel.
            </p>

            {sources.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: 13 }}>Aucune source configurée.</p>
            ) : (
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
                        <td style={{ fontSize: 12, color: '#6b7280' }}>{s.urlBase}</td>
                        <td>
                        {!res && !loading && (
                            <span style={{ color: '#9ca3af', fontSize: 13 }}>— non testé</span>
                        )}
                        {loading && (
                            <span style={{ color: '#2563eb', fontSize: 13 }}>
                            <FontAwesomeIcon icon={faArrowsRotate} spin
                                style={{ marginRight: 5 }} />
                            Test en cours…
                            </span>
                        )}
                        {res && !loading && (
                            <span className={`badge badge--${res.statut === 'OK' ? 'green' : 'red'}`}>
                            <FontAwesomeIcon
                                icon={res.statut === 'OK' ? faCircleCheck : faCircleXmark}
                                style={{ marginRight: 5 }} />
                            {res.statut === 'OK' ? 'Accessible' : 'Inaccessible'}
                            </span>
                        )}
                        </td>
                        <td>
                        {res && !loading && res.latence > 0 ? (
                            <span style={{
                            fontWeight: 600,
                            color: res.latence > 2000 ? '#dc2626'
                                : res.latence > 1000 ? '#d97706'
                                : '#059669',
                            }}>
                            <FontAwesomeIcon icon={faGaugeHigh} style={{ marginRight: 5 }} />
                            {res.latence} ms
                            </span>
                        ) : '—'}
                        </td>
                        <td>
                        <button
                            className="btn btn--sm btn--primary"
                            disabled={loading}
                            onClick={() => handleTester(s)}
                        >
                            <FontAwesomeIcon icon={faPlay} style={{ marginRight: 5 }} />
                            {loading ? 'Test…' : 'Tester'}
                        </button>
                        </td>
                    </tr>
                    );
                })}
                </tbody>
            </table>
            )}
        </section>

        {/* ── Section 4 : Actions rapides ──────────────────────── */}
        <section className="card">
            <h2 className="card-title">
            <FontAwesomeIcon icon={faScrewdriverWrench}
                style={{ color: '#d97706', marginRight: 8 }} />
            Actions rapides
            </h2>

            {/* ✅ Un seul message pour les deux actions */}
            {actionMsg && (
            <div className={`alert alert--${actionMsg.type}`} style={{ marginBottom: 16 }}>
                <FontAwesomeIcon
                icon={actionMsg.type === 'ok' ? faCircleCheck : faTriangleExclamation}
                style={{ marginRight: 8 }} />
                {actionMsg.text}
            </div>
            )}

            <div className="action-list">

            {/* ── Vider le cache ────────────────────────────────── */}
            <div className="action-item">
                <div>
                <p className="action-label">
                    <FontAwesomeIcon icon={faEraser}
                    style={{ marginRight: 6, color: '#d97706' }} />
                    Vider le cache applicatif
                </p>
                <p className="action-desc">
                    Purge le cache Spring Boot — libère la mémoire et force le rechargement des données.
                </p>
                </div>
                <button
                className="btn btn--sm btn--amber"
                disabled={cacheLoading}
                onClick={handleViderCache}
                >
                <FontAwesomeIcon icon={faEraser} />
                {cacheLoading ? ' …' : ' Vider'}
                </button>
            </div>

            {/* ── Vider l'historique ────────────────────────────── */}
            <div className="action-item">
                <div>
                <p className="action-label">
                    <FontAwesomeIcon icon={faTrashCan}
                    style={{ marginRight: 6, color: '#dc2626' }} />
                    Vider l'historique des recherches
                </p>
                <p className="action-desc">
                    Supprime définitivement toutes les recherches sauvegardées par les utilisateurs.
                </p>
                </div>
                <button
                className="btn btn--sm btn--red"
                disabled={actionLoading}
                onClick={handleViderHistorique}
                >
                <FontAwesomeIcon icon={faTrashCan} />
                {actionLoading ? ' …' : ' Vider'}
                </button>
            </div>

            </div>
        </section>


        {/* ── Section 1 : État des composants ──────────────────── */}
        <section className="card" style={{ marginBottom: 24 }}>
            <h2 className="card-title">
            <FontAwesomeIcon icon={faServer}
                style={{ color: '#7c3aed', marginRight: 8 }} />
            État des composants
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {COMPOSANTS.map((c) => (
                <div key={c.label} style={{
                border: '1px solid #e5e7eb', borderRadius: 10,
                padding: '20px 16px', textAlign: 'center',
                }}>
                <FontAwesomeIcon icon={c.icon}
                    style={{ fontSize: 28, color: c.color, marginBottom: 10 }} />
                <p style={{ fontWeight: 700, marginBottom: 2 }}>{c.label}</p>
                <p style={{ color: c.color, fontWeight: 600, marginBottom: 6 }}>{c.valeur}</p>
                <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 10 }}>{c.detail}</p>
                <span className="badge badge--green">
                    <FontAwesomeIcon icon={faCircleCheck} style={{ marginRight: 4 }} />
                    Opérationnel
                </span>
                </div>
            ))}
            </div>
        </section>

        </div>
    );
    }