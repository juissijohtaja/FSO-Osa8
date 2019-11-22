import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import BornForm from './components/BornForm'


import { gql } from 'apollo-boost'
//import { Query, ApolloConsumer, Mutation } from 'react-apollo'
import { useQuery, useMutation } from '@apollo/react-hooks'


const ALL_AUTHORS = gql`
{
  allAuthors {
    name
    born
    bookCount
  }
}
`

const ALL_BOOKS = gql`
{
  allBooks {
    title
    published
    author { name }
  }
}
`

const CREATE_BOOK = gql`
mutation createBook($title: String!, $published: Int!, $author: String!, $genres: [String]) {
  addBook(
    title: $title,
    published: $published,
    author: $author,
    genres: $genres
  ) {
    title
    published
    author
    genres
  }
}
`

const EDIT_AUTHOR = gql`
mutation editAuthor($name: String!, $setBornTo: Int!) {
  editAuthor(name: $name, setBornTo: $setBornTo)  {
    name
    born
    id
  }
}
`

/* client.query({ ALL_AUTHORS })
  .then((response) => {
    console.log(response.data)
  }) */


const App = () => {
  const [page, setPage] = useState('authors')
  console.log('page', page)

  const authors = useQuery(ALL_AUTHORS)
  const books = useQuery(ALL_BOOKS)
  console.log('books', books)

  const [addBook] = useMutation(CREATE_BOOK, {
    //onError: handleError,
    refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS }]
  })

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    //onError: handleError,
    refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS }]
  })

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>
      
      <Authors result={authors} show={page === 'authors'} />
      <Books result={books} show={page === 'books'}  />
      <NewBook addBook={addBook} show={page === 'add'} />
      <BornForm editAuthor={editAuthor} result={authors} show={page === 'authors'} />     

    </div>
  )
}

export default App