import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import BornForm from './components/BornForm'
import LoginForm from './components/LoginForm'


import { gql } from 'apollo-boost'
//import { Query, ApolloConsumer, Mutation } from 'react-apollo'
import { useQuery, useMutation, useApolloClient } from '@apollo/react-hooks'


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
    genres
  }
}
`

const CREATE_BOOK = gql`
mutation createBook($title: String!, $published: Int, $author: String, $genres: [String]) {
  addBook(
    title: $title,
    published: $published,
    author: $author,
    genres: $genres
  ) {
    title
    published
    author { name }
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

const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`

/* client.query({ ALL_AUTHORS })
  .then((response) => {
    console.log(response.data)
  }) */


const App = () => {
  const [token, setToken] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [page, setPage] = useState('authors')
  
  console.log('page', page)

  const client = useApolloClient()
  const authors = useQuery(ALL_AUTHORS)
  const books = useQuery(ALL_BOOKS)
  //console.log('books', books)

  const handleError = (error) => {
    setErrorMessage(error.graphQLErrors[0].message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 3000)
  }

  const [addBook] = useMutation(CREATE_BOOK, {
    onError: handleError,
    refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS }]

    /* update: (store, response) => {
      const dataInStoreBooks = store.readQuery({ query: ALL_BOOKS })
      const dataInStoreAuthors = store.readQuery({ query: ALL_AUTHORS })
      console.log('dataInStore', dataInStoreBooks)
      console.log('dataInStore2', dataInStoreAuthors)
      console.log('response.data.addBook', response.data.addBook)
      dataInStoreBooks.allBooks.push(response.data.addBook)
      dataInStoreAuthors.allAuthors.push(response.data.addBook.author)
      store.writeQuery({
        query: ALL_BOOKS,
        data: dataInStoreBooks
      })
      store.writeQuery({
        query: ALL_AUTHORS,
        data: dataInStoreAuthors
      })
    } */

  })

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    onError: handleError,
    refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS }]
  })

  

  const [login] = useMutation(LOGIN, {
    onError: handleError
  })

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    alert("Logout successful")
    setPage('authors')
  }


  /* if (!token) {
    return (
      <div>
        {errorNotification()}
        <h2>Login</h2>
        <LoginForm
          login={login}
          setToken={(token) => setToken(token)}
        />
      </div>
    )
  }
 */
  

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        

        {token
                  ? <span><button onClick={() => setPage('add')}>add book</button> <button onClick={logout}>logout</button></span>
                  : <button onClick={() => setPage('login')}>login</button>
                }

      </div>
      
      <Authors result={authors} show={page === 'authors'} />
      <Books result={books} show={page === 'books'}  />
      <NewBook addBook={addBook} show={page === 'add'} />
      {token ? <BornForm editAuthor={editAuthor} result={authors} show={page === 'authors'} /> : <div></div> }
      
      <LoginForm setPage={setPage} errorMessage={errorMessage} login={login} setToken={(token) => setToken(token)} show={page === 'login'} />

    </div>
  )
}

export default App