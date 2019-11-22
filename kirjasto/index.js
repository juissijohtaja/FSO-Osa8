const config = require('./utils/config')
const logger = require('./utils/logger')

const { ApolloServer, UserInputError, gql } = require('apollo-server')
const mongoose = require('mongoose')
const Author = require('./models/author')
const Book = require('./models/book')

mongoose.set('useFindAndModify', false)

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })

/*
 * It would be more sensible to assosiate book and the author by saving 
 * the author id instead of the name to the book.
 * For simplicity we however save the author name.
*/

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },  
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'The Demon',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]

const typeDefs = gql`
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int!
  }
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book]!
    allAuthors: [Author]!
  }
  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String]
    ): Book
    addAuthor(
        name: String!
        born: Int
      ): Book
    editAuthor(
        name: String!
        setBornTo: Int!
      ): Author
  }
`

const resolvers = {
  Query: {
    allBooks: async (root, args) => {
        console.log('args', args)
        const books = await Book.find({}).populate('author', { name: 1, })

        if (args.author && args.genre) {
            return books.filter(book => book.author.name === args.author).filter(book => book.genres.includes(args.genre))
        } else if (args.author) {
            return books.filter(book => book.author.name === args.author)
        } else if (args.genre) {
            return books.filter(book => book.genres.includes(args.genre))
        }
        return books
    },
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allAuthors: () => Author.find({})
  },
  Author: {
    bookCount: (root) => {
        const counter = books.filter(i => i.author.match(root.name))
        //console.log('book counter', counter.length)
        return counter.length
    }
  },
  Mutation: {
    addBook: (root, args) => {
      if (books.find(b => b.title === args.title)) {
        throw new UserInputError('Title must be unique', {
          invalidArgs: args.title,
        })
      }
      const book = { ...args, id: uuid() }
      books = books.concat(book)
      const authorCheck = authors.filter(author => author.name.match(args.author))
      console.log('authorCheck', authorCheck)
      if (authorCheck.length === 1) {
        console.log('Name exists')
      } else {
          console.log('New Author')
          const author = { name: args.author, id: uuid(), born: null }
          authors = authors.concat(author)
      }
      return book
    },
    addAuthor: (root, args) => {
        if (authors.find(a => a.name === args.name)) {
          throw new UserInputError('Name must be unique', {
            invalidArgs: args.name,
          })
        }
        const author = { ...args, id: uuid(), born: null }
        authors = authors.concat(author)
        return author
      },
    editAuthor: (root, args) => {
        const author = authors.find(a => a.name === args.name)
        if (!author) {
          return null
        }
        const updatedAuthor = { ...author, born: args.setBornTo }
        authors = authors.map(a => a.name === args.name ? updatedAuthor : a)
        return updatedAuthor
      },  
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})