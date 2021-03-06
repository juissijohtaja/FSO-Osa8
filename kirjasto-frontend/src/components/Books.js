import React, { useState } from 'react'

const Books = ({ result, show }) => {
  const [genreFilter, setGenreFilter] = useState('')

  if (!show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }

  let books = result.data.allBooks
  //const books = []
  console.log('books', books)

  const allGenres = []
  books.map(book => book.genres.map(genre => allGenres.push(genre)))
  //console.log('allGenres', allGenres)
  const uniqueGenres = allGenres.filter((item, index, genre) => genre.indexOf(item) === index)
  console.log('uniqueGenres', uniqueGenres)
  console.log('genreFilter', genreFilter)
  const filteredBooks = books.filter(book => book.genres.includes(genreFilter))
  console.log('filteredBooks', filteredBooks.length)
  if (genreFilter) {
    books = filteredBooks
  }
  

  return (
    <div>
      <h2>Books</h2>
      <h4>Filter by genre: {genreFilter}</h4>
      <div><button onClick={() => setGenreFilter('')} key='reset'>Show all </button> {uniqueGenres.map(genre => <button onClick={() => setGenreFilter(genre)} key={genre}>{genre} </button> )}</div>
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

export default Books