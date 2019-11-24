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



const typeDefs = gql`
  type Book {
    title: String!
    published: Int
    author: Author
    genres: [String!]
    id: ID!
  }
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int
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
      published: Int
      author: String
      genres: [String]
    ): Book
    addAuthor(
        name: String!
        born: Int
      ): Author
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
    bookCount: async (root) => {
      const books = await Book.find({}).populate('author', { name: 1, })
      const counter = books.filter(i => i.author.name.match(root.name))
      return counter.length
    }
  },
  Mutation: {
    addBook: async (root, args) => {
      try {
        let authorObj = await Author.findOne({ name: args.author })
        console.log('authorObj', authorObj)
        console.log('args.author', args.author)
        if (!authorObj) {
          console.log('Uusi author')
          const author = new Author({
            name: args.author,
            born: null
          })
          authorObj = await author.save()
        }
        console.log('authorObj after', authorObj)
        const books = await Book.find({})
        if (books.find(b => b.title === args.title)) {
          throw new UserInputError('Title must be unique', {
            invalidArgs: args.title,
          })
        }

        const book = new Book({ ...args, author: authorObj._id })
        console.log('book', book)
        const savedBook = await book.save()
        console.log('savedBook', savedBook)
        const modBook = await Book.findOne({ title: args.title }).populate('author', { name: 1, })
        console.log('modBook', modBook)
        return modBook

      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }      
    },
    addAuthor: async (root, args) => {
      console.log('addAuthor args', args)
      const authorObj = await Author.findOne({ name: args.name })
      console.log('authorObj', authorObj)
      if (authorObj) {
        throw new UserInputError('Name must be unique', {
          invalidArgs: args.name,
        })
      }
      const author = new Author({
        name: args.name,
        born: null
      })
      const newAuthor = await author.save()
      return newAuthor
    },
    editAuthor: async (root, args) => {
      console.log('editAuthor args', args)
      const author = await Author.findOne({ name: args.name })
      console.log('author', author)
      if (!author) {
        return null
      }
      author.born = args.setBornTo
      console.log('author', author)
      return author.save()
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