export interface SearchResult {
  title: string
  link: string
  snippet: string
}

interface SearchViewProps {
  handleSearch: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  searchResults?: SearchResult[]
  setQuery : (query: string) => void
}

export const SearchView = ({handleSearch, searchResults, setQuery}: SearchViewProps) => (
  <div className="inner search">
    <div className="search-form">
      <input type="text" placeholder="Search" onChange={e => setQuery(e.target.value)}/>
      <button onClick={handleSearch}>Search</button>
    </div>
    {searchResults && searchResults.length > 0 && (
      <div className="result-feed">
        {searchResults.map((result, index) => (
          <div key={index}>

            <h3><a href={result.link}>{result.title}</a></h3>
            <p>{result.snippet}</p>
          </div>
        ))}
      </div>
    )}
  </div>
)
