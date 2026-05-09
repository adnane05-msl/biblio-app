import { useState } from 'react'
import './SearchBar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faMagnifyingGlass,
    faHourglass
} from '@fortawesome/free-solid-svg-icons'

function SearchBar({ onSearch, loading }) {
    const [query, setQuery] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!query.trim()) return
        onSearch(query)
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
                            ? <><FontAwesomeIcon icon={faHourglass} /> Recherche...</>
                            : <><FontAwesomeIcon icon={faMagnifyingGlass} /> Rechercher</>}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default SearchBar