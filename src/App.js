import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";
import { FiAirplay } from "react-icons/fi";
import { CgHashtag } from "react-icons/cg";
import { GiStarsStack } from "react-icons/gi";
import { RiStarSFill } from "react-icons/ri";
import { IoHourglass } from "react-icons/io5";











const KEY = '62cc70e'

export default function App() {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null)


  const [watched, setWatched] = useLocalStorageState([], 'watched')

  const { movies, isLoading, error } = useMovies(query, handleCloseMovie)


  function handleSelectMovie(id) {
    setSelectedId(selectedId => id === selectedId ? null : id)
  }
  function handleCloseMovie() {
    setSelectedId(null)
  }

  function handleAddWatched(movie) {
    setWatched(watched => [...watched, movie])

  }


  function handleDeleteWatched(id) {
    setWatched(watched => watched.filter(movie => movie.imdbID !== id))
  }










  return (
    <>
      <NavBar>
        <Search
          query={query}
          setQuery={setQuery} />
        <NumResults
          movies={movies} />
      </NavBar>
      <Main>


        <Box>
          {/* {isLoading ? <Loader /> : } */}
          {isLoading && <Loader />}
          {!isLoading && !error && <MovieList movies={movies}
            onSelectMovie={handleSelectMovie} />}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ?
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            /> :
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList watched={watched}
                onDeleteWatched={handleDeleteWatched} />

            </>}
        </Box>

      </Main>


    </>
  );
}
function Loader() {
  return <p className="loader">
    Loading...

  </p>
}
function ErrorMessage({ message }) {
  return <p className="error">
    <span>⛔</span>{message}
  </p>

}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  )
}
function Logo() {
  return (
    <div className="logo">
      <FiAirplay size={24} />

      <h1>FlixPicks</h1>
    </div>
  )
}
function Search({ query, setQuery }) {
  const inputEl = useRef(null)

  useKey('Enter', function () {
    if (document.activeElement === inputEl.current) return
    inputEl.current.focus()
    setQuery('')
  })










  return (
    <input
      className="search"
      type="text"
      placeholder="Search..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />)
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  )
}

function Main({ children }) {
  return (
    <main className="main">
      {children}
    </main>
  )
}
function Box({ children }) {

  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  )
}




function MovieList({ movies, onSelectMovie }) {

  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  )
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  )
}
function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [userRating, setUserRating] = useState('')
  const isWatched = watched.map(movie => movie.imdbID).includes(selectedId)
  const watchedUserRating = watched.find(movie => movie.imdbID === selectedId)?.
    userRating;


  const countRef = useRef(0)

  useEffect(() => {

    if (userRating) countRef.current = countRef.current + 1
  }, [userRating])

  const { Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime, imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre } = movie;




  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(' ').at(0)),
      userRating,
      countRatingDecisions: countRef.current
    }
    onAddWatched(newWatchedMovie)
    onCloseMovie();


  }
  useKey('Escape', onCloseMovie)

  useEffect(function () {
    async function getMovieDetails() {
      setIsLoading(true)
      const res =
        await fetch(`https://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`)
      const data = await res.json()
      setMovie(data)
      setIsLoading(false)
    }
    getMovieDetails()
  }, [selectedId])


  useEffect(function () {
    if (!title) return
    document.title = `Movie | ${title}`;
    return function () {
      document.title = 'FlixPicks'

    }
  }, [title])


  return (<div className='details'>
    {isLoading ? <Loader /> :
      <>
        <header>

          <button className="btn-back" onClick={onCloseMovie}>
            &larr;
          </button>
          <img src={poster} alt={`Poster of ${movie}`} />
          <div className="details-overview">
            <h2>{title}</h2>
            <p>{released} &bull; {runtime}</p>
            <p>{genre}</p>
            <p><span><RiStarSFill /></span>{imdbRating} IMDB rating</p>
          </div>
        </header>


        <section>
          <div className="rating">
            {!isWatched ? (
              <>
                <StarRating maxRating={10} size={26} onSetRating={setUserRating} />
                {userRating > 0 && (
                  <button className="btn-add" onClick={handleAdd}>
                    + Add to list
                  </button>
                )}
              </>
            ) : (
              <div className="ratingInfo">
                <div>
                  <h3>You rated this movie {watchedUserRating}</h3>
                </div>
                <div><span><RiStarSFill size={16} color="#c2303d" /></span></div>
              </div>
            )}
          </div>
          <p><em>{plot}</em></p>
          <p>Starring: {actors}</p>
          <p>Directed by: {director}</p>
        </section>
      </>
    }


  </div>)
}

function WatchedSummary({ watched }) {

  const average = (arr) => arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span><CgHashtag size={16} />
          </span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span> <RiStarSFill size={16} /></span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span><GiStarsStack size={16} /></span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span><IoHourglass size={16} /></span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  )
}

function WatchedMovieList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} onDeleteWatched={onDeleteWatched} />
      ))}
    </ul>
  )
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span><RiStarSFill size={16} color="#c2303d" /></span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span><GiStarsStack size={16} color="#c2303d" /></span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span><IoHourglass size={16} color="#c2303d" /></span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}>X</button>
      </div>
    </li>
  )
}