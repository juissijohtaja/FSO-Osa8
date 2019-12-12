const config = require('./utils/config')
const logger = require('./utils/logger')

const { ApolloServer, UserInputError, AuthenticationError, gql } = require('apollo-server')
const mongoose = require('mongoose')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')

const jwt = require('jsonwebtoken')
const JWT_SECRET = config.JWT_SECRET
console.log('JWT_SECRET', JWT_SECRET)

mongoose.set('useFindAndModify', false)

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })

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
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  type Token {
    value: String!
  }
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book]!
    allAuthors: [Author]!
    me: User
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
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
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
    allAuthors: () => Author.find({}),
    me: (root, args, context) => {
      console.log('query me', context.currentUser)
      return context.currentUser
    }
  },
  Author: {
    bookCount: async (root) => {
      const books = await Book.find({}).populate('author', { name: 1, })
      const counter = books.filter(i => i.author.name.match(root.name))
      return counter.length
    }
  },
  Mutation: {
    addBook: async (root, args, context) => {
      try {
        const currentUser = context.currentUser
        console.log('addBook currentUser', currentUser)

        if (!currentUser) {
          throw new AuthenticationError("not authenticated")
        }

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
    editAuthor: async (root, args, context) => {
      try {
        console.log('editAuthor args', args)
        const currentUser = context.currentUser
        console.log('editAuthor currentUser', currentUser)

        if (!currentUser) {
          throw new AuthenticationError("not authenticated")
        }
      
        const author = await Author.findOne({ name: args.name })
        console.log('author before', author)
        if (!author) {
          return null
        }
        author.born = args.setBornTo
        console.log('author after', author)
        return author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
    createUser: (root, args) => {
      const user = new User({ username: args.username })
  
      return user.save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      console.log('user', user)
  
      if ( !user || args.password !== 'secred' ) {
        throw new UserInputError("wrong credentials")
      }
  
      const userForToken = {
        username: user.username,
        id: user._id,
      }

      console.log('JWT_SECRET', JWT_SECRET)
  
      return { value: jwt.sign(userForToken, JWT_SECRET) }
    },
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})