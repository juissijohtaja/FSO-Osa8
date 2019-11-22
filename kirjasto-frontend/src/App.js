import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import BornForm from './components/BornForm'


import { gql } from 'apollo-boost'
import { Query, ApolloConsumer, Mutation } from 'react-apollo'

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
    author
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

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>
      
      <Query query={ALL_AUTHORS}>
        {(result) => <Authors result={result} show={page === 'authors'} />}
      </Query>

      <Query query={ALL_BOOKS}>
        {(result) => <Books result={result} show={page === 'books'}  />}
      </Query>

      <Mutation mutation={CREATE_BOOK} refetchQueries={[{ query: ALL_BOOKS }, { query: ALL_AUTHORS }]}>
        {(addBook) =>
          <NewBook
            addBook={addBook} show={page === 'add'}
          />
        }
      </Mutation>

      <Mutation mutation={EDIT_AUTHOR} refetchQueries={[{ query: ALL_BOOKS }, { query: ALL_AUTHORS }]}>
        {(editAuthor) =>
          <BornForm editAuthor={editAuthor} show={page === 'authors'} />
        }
      </Mutation> 

      

    </div>
  )
}

export default App