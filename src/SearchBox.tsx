import { Data, Effect, Match, pipe } from "effect"
import * as React from "react"
import "./SearchBox.css"

export default SearchBox

interface Suggestion {
  value: string
}

interface SuggestionsResponse {
  suggestions: Suggestion[]
}

class FetchError extends Data.TaggedError("FetchError")<{
  cause: unknown
}> {}

class ParseError extends Data.TaggedError("ParseError")<{
  cause: unknown
}> {}

const fetchSuggestionsEffect = (query: string) =>
  pipe(
    Effect.tryPromise({
      try: () =>
        fetch(
          `https://completion.amazon.com/api/2017/suggestions?mid=ATVPDKIKX0DER&alias=aps&prefix=${encodeURIComponent(query)}`
        ),
      catch: (cause) => new FetchError({ cause }),
    }),
    Effect.flatMap((response) =>
      Effect.tryPromise({
        try: () => response.json() as Promise<SuggestionsResponse>,
        catch: (cause) => new ParseError({ cause }),
      })
    ),
    Effect.map((data) => data.suggestions?.map((s) => s.value) || [])
  )

function SearchBox() {
  const [query, setQuery] = React.useState("")
  const [suggestions, setSuggestions] = React.useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = React.useState(-1)
  const [isLoading, setIsLoading] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Fetch autocomplete suggestions from Amazon using Effect
  React.useEffect(() => {
    // Clear suggestions when query is empty
    if (!query.trim()) {
      setSuggestions([])
      setIsLoading(false)
      return
    }

    // Debounce the API call (300ms)
    // Note: We use setTimeout here as it's the idiomatic way to debounce in React
    // Effect's Stream.debounce would require more complex setup with subscriptions
    const timeoutId = setTimeout(() => {
      setIsLoading(true)

      const program = pipe(
        fetchSuggestionsEffect(query),
        Effect.match({
          onFailure: (error) => {
            console.error("Failed to fetch suggestions:", error)
            setSuggestions([])
            setIsLoading(false)
          },
          onSuccess: (results) => {
            setSuggestions(results)
            setIsLoading(false)
          },
        })
      )

      Effect.runPromise(program)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  // Handle search submission
  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return

    const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}`
    chrome.tabs.create({ url: amazonUrl })
  }

  // Handle keyboard navigation using pattern matching
  const handleKeyDown = (e: React.KeyboardEvent) => {
    pipe(
      e.key,
      Match.value,
      Match.when("ArrowDown", () => {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
      }),
      Match.when("ArrowUp", () => {
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
      }),
      Match.when("Enter", () => {
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSearch(suggestions[selectedIndex])
        } else {
          handleSearch(query)
        }
      }),
      Match.when("Escape", () => {
        setSuggestions([])
        setSelectedIndex(-1)
      }),
      Match.orElse(() => {
        // Do nothing for other keys
      })
    )
  }

  // Focus input on mount
  React.useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div className="search-box">
      <input
        ref={inputRef}
        type="text"
        className="search-input"
        placeholder="Search Amazon..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setSelectedIndex(-1)
        }}
        onKeyDown={handleKeyDown}
      />

      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className={`suggestion-item ${index === selectedIndex ? "selected" : ""}`}
              onClick={() => handleSearch(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}

      {isLoading && <div className="loading">Loading...</div>}
    </div>
  )
}
