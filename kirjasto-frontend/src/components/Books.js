import React from 'react'

const Books = ({ result, show }) => {
  if (!show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }

  const books = result.data.allBooks
  //const books = []
  console.log('books', books)

  const allGenres = []
  books.map(book => book.genres.map(genre => allGenres.push(genre)))
  console.log('allGenres', allGenres)
  const uniqueGenres = allGenres.filter((item, index, genre) => genre.indexOf(item) === index)
  console.log('uniqueGenres', uniqueGenres)
  

  return (
    <div>
      <h2>Books</h2>
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