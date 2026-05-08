// Télécharge un fichier depuis une URL
const downloadFile = (url, filename) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

const BASE_URL = 'http://localhost:9090'

export const exportBibtex = (projectId) => {
    downloadFile(
        `${BASE_URL}/api/export/bibtex/${projectId}`,
        'references.bib'
    )
}

export const exportCsv = (projectId) => {
    downloadFile(
        `${BASE_URL}/api/export/csv/${projectId}`,
        'articles.csv'
    )
}

export const exportRis = (projectId) => {
    downloadFile(
        `${BASE_URL}/api/export/ris/${projectId}`,
        'references.ris'
    )
}