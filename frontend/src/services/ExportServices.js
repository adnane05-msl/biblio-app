const downloadFile = async (url, filename) => {
    const token = localStorage.getItem('token');

    const response = await fetch(url, {
        method: 'GET',
        headers: {
        'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Erreur export: ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
};

const buildFilename = (base, statut, extension) => {
    if (!statut || statut === 'TOUS') return `${base}.${extension}`
    return `${base}_${statut.toLowerCase()}.${extension}`
}

export const exportBibtex = async (projectId, statut = 'TOUS') => {
    const params = statut && statut !== 'TOUS' ? `?statut=${encodeURIComponent(statut)}` : '';
    const url = `/api/export/bibtex/${projectId}${params}`;
    await downloadFile(url, buildFilename('references', statut, 'bib'));
    };

    export const exportCsv = async (projectId, statut = 'TOUS') => {
    const params = statut && statut !== 'TOUS' ? `?statut=${encodeURIComponent(statut)}` : '';
    const url = `/api/export/csv/${projectId}${params}`;
    await downloadFile(url, buildFilename('articles', statut, 'csv'));
    };

    export const exportRis = async (projectId, statut = 'TOUS') => {
    const params = statut && statut !== 'TOUS' ? `?statut=${encodeURIComponent(statut)}` : '';
    const url = `/api/export/ris/${projectId}${params}`;
    await downloadFile(url, buildFilename('references', statut, 'ris'));
};
