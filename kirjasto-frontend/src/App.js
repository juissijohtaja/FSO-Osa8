import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import BornForm from './components/BornForm'
import LoginForm from './components/LoginForm'
import Recommended from './components/Recommended'

import { gql } from 'apollo-boost'
//import { Query, ApolloConsumer, Mutation } from 'react-apollo'
import { useQuery, useMutation, useSubscription ,useApolloClient } from '@apollo/react-hooks'

const AUTHOR_DETAILS = gql`
fragment AuthorDetails on Author {
  id
  name
  born
  bookCount
}
`

const ALL_AUTHORS = gql`
{
  allAuthors {
    ...AuthorDetails
  }
}
${AUTHOR_DETAILS}  
`

const BOOK_DETAILS = gql`
fragment BookDetails on Book {
  id
  title
  published
  author { name }
  genres
}
` 

const ALL_BOOKS = gql`
{
  allBooks {
    ...BookDetails
  }
}
${BOOK_DETAILS}  
`

const ME = gql`
{
  me {
    username
    favoriteGenre
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
    id
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

const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  
${BOOK_DETAILS}
`

const App = () => {
  const [token, setToken] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [page, setPage] = useState('authors')
  
  console.log('page', page)

  const client = useApolloClient()
  const authors = useQuery(ALL_AUTHORS)
  const books = useQuery(ALL_BOOKS)
  const loggedUser = useQuery(ME)

  //console.log('loggedUser', loggedUser)

  const handleError = (error) => {
    setErrorMessage(error.graphQLErrors[0].message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 3000)
  }

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  /* useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      console.log(subscriptionData)
    }
  }) */



  const updateCacheWith = (addedBook) => {

    const includedIn = (set, object) => {
      console.log('updateCacheWith object', object)
      return set.map(book => book.id).includes(object.id)
    }

    const dataInStore = client.readQuery({ query: ALL_BOOKS })
    console.log('vertaus', !includedIn(dataInStore.allBooks, addedBook))
    if (!includedIn(dataInStore.allBooks, addedBook)) {
      client.writeQuery({
        query: ALL_BOOKS,
        data: { allBooks : dataInStore.allBooks.concat(addedBook) }
      })
    }
  }

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded
      console.log(subscriptionData)
      updateCacheWith(addedBook)
      window.alert(`Book added: ${addedBook.title}`)
    }
  })

  const [addBook] = useMutation(CREATE_BOOK, {
    onError: handleError,
    //refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS }]
    update: (store, response) => {
      updateCacheWith(response.data.addBook)
    }
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

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        

        {token
          ? <span>
            <button onClick={() => setPage('recommended')}>recommended</button>
            <button onClick={() => setPage('add')}>add book</button> 
            <button onClick={logout}>logout</button>
          </span>
          : <button onClick={() => setPage('login')}>login</button>
        }

      </div>
      
      <Authors result={authors} show={page === 'authors'} />
      <Books result={books} show={page === 'books'}  />
      <Recommended result={books} loggedUser={loggedUser} show={page === 'recommended'}  />
      <NewBook addBook={addBook} show={page === 'add'} />
      {token ? <BornForm editAuthor={editAuthor} result={authors} show={page === 'authors'} /> : <div></div> }
      <LoginForm setPage={setPage} errorMessage={errorMessage} login={login} setToken={(token) => setToken(token)} show={page === 'login'} />

    </div>
  )
}

export default App