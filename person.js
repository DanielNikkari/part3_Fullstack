const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log(`Connecting to ${url}`)

mongoose.connect(url)
  .then(result => { // eslint-disable-line no-unused-vars
    console.log('Connected to MongoDB')
  })
  .catch(err => {
    console.log('Error connecting to MongoDB: ', err)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: (v) => {
        if (!v.includes('-')) {
          return false
        }
        const parts = v.split('-')
        if (!Number.isInteger(parseInt(parts[0])) || parts[0].length > 3 || parts[0].length < 2) {
          return false
        }
        if (!Number.isInteger(parseInt(parts[1]))) {
          return false
        }
        return true
      },
      message: (props) => { // eslint-disable-line no-unused-vars
        return 'The number has to be numbers in form XX-XXXXXX or XXX-XXXXXX'
      }
    }
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)