import { useState } from 'react'
import './SearchBar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faHourglass } from '@fortawesome/free-solid-svg-icons'


function SearchBar({ onSearch, loading }) {
    const [query, setQuery] = useState('')
    const [sources, setSources] = useState({
        crossref: true,
        openalex: true,
        arxiv: false,
    })

    const handleToggle = (source) => {
        setSources(prev => ({ ...prev, [source]: !prev[source] }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!query.trim()) return
        onSearch(query, sources)
    }

    return (
        <div className="searchbar-container">
            <form onSubmit={handleSubmit} className="searchbar-form">
                <div className="searchbar-input-row">
                    <input
                        className="searchbar-input"
                        type="text"
                        placeholder="Ex: artificial intelligence, machine learning..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        required
                    />
                    <button
                        className="searchbar-btn"
                        type="submit"
                        disabled={loading}
                    >
                        {loading 
                        ?<><FontAwesomeIcon icon={faHourglass} /> Recherche... </>
                        :<><FontAwesomeIcon icon={faMagnifyingGlass} /> Rechercher</>}
                    </button>
                </div>

                <div className="searchbar-sources">
                    <span className="sources-label">Sources :</span>

                    <label className={`source-toggle ${sources.crossref ? 'active' : ''}`}>
                        <input
                            type="checkbox"
                            checked={sources.crossref}
                            onChange={() => handleToggle('crossref')}
                        />
                        Crossref
                    </label>

                    <label className={`source-toggle ${sources.openalex ? 'active' : ''}`}>
                        <input
                            type="checkbox"
                            checked={sources.openalex}
                            onChange={() => handleToggle('openalex')}
                        />
                        OpenAlex
                    </label>

                    <label className={`source-toggle ${sources.arxiv ? 'active' : ''}`}>
                        <input
                            type="checkbox"
                            checked={sources.arxiv}
                            onChange={() => handleToggle('arxiv')}
                        />
                        arXiv
                    </label>
                </div>
            </form>
        </div>
    )
}

export default SearchBar