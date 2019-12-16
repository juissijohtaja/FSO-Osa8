import React from 'react'

const Recommended = ({ result, loggedUser, show }) => {
  //const [genreFilter, setGenreFilter] = useState('')

  if (!show) {
    return null
  }
  if (result.loading || loggedUser.loading) {
    return <div>loading...</div>
  }

  let books = result.data.allBooks
  //const books = []
  console.log('books', books)
  
  const favoriteGenre = loggedUser.data.me.favoriteGenre
  console.log('favoriteGenre', favoriteGenre)
  const currentUser = loggedUser.data.me.username
  console.log('loggedUser loading', loggedUser.loading)


  const allGenres = []
  books.map(book => book.genres.map(genre => allGenres.push(genre)))
  //console.log('allGenres', allGenres)
  const uniqueGenres = allGenres.filter((item, index, genre) => genre.indexOf(item) === index)
  console.log('uniqueGenres', uniqueGenres)
  //console.log('genreFilter', genreFilter)
  const filteredBooks = books.filter(book => book.genres.includes(favoriteGenre))
  console.log('filteredBooks', filteredBooks.length)
  if (favoriteGenre) {
    books = filteredBooks
  }
  

  return (
    <div>
      <h2>Recommended Books</h2>
      <h4>Filter by {currentUser}'s favorite genre: {favoriteGenre}</h4>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
            <th>
              genres
            </th>
          </tr>
          {books.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
              <td>{a.genres.map(genre => <span key={genre}>{genre} </span> )}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Recommended