const downloadFile = (url, filename) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

const buildFilename = (base, statut, extension) => {
    if (!statut || statut === 'TOUS') return `${base}.${extension}`
    return `${base}_${statut.toLowerCase()}.${extension}`
}

export const exportBibtex = (projectId, statut = 'TOUS') => {
    const params = statut && statut !== 'TOUS' ? `?statut=${encodeURIComponent(statut)}` : ''
    const url = `/api/export/bibtex/${projectId}${params}`
    console.log('[Export] BibTeX URL:', url, '| statut:', statut)
    downloadFile(url, buildFilename('references', statut, 'bib'))
}

export const exportCsv = (projectId, statut = 'TOUS') => {
    const params = statut && statut !== 'TOUS' ? `?statut=${encodeURIComponent(statut)}` : ''
    const url = `/api/export/csv/${projectId}${params}`
    console.log('[Export] CSV URL:', url, '| statut:', statut)
    downloadFile(url, buildFilename('articles', statut, 'csv'))
}

export const exportRis = (projectId, statut = 'TOUS') => {
    const params = statut && statut !== 'TOUS' ? `?statut=${encodeURIComponent(statut)}` : ''
    const url = `/api/export/ris/${projectId}${params}`
    console.log('[Export] RIS URL:', url, '| statut:', statut)
    downloadFile(url, buildFilename('references', statut, 'ris'))
}