require('dotenv').config()
console.log(process.env.MONGODB_URI)
const express = require('express')
const morgan = require('morgan')
const Person = require('./person')

const app = express()

app.use(express.json())

morgan.token('data', function (req, res) { return JSON.stringify(req.body) }) // eslint-disable-line no-unused-vars
morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens['response-time'](req, res), 'ms',
    tokens.data(req, res)
  ].join(' ')
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

app.use(express.static('build'))

let phonebook = [ // eslint-disable-line no-unused-vars
  { 
    'id': 1,
    'name': 'Arto Hellas', 
    'number': '040-123456'
  },
  { 
    'id': 2,
    'name': 'Ada Lovelace', 
    'number': '39-44-5323523'
  },
  { 
    'id': 3,
    'name': 'Dan Abramov', 
    'number': '12-43-234345'
  },
  { 
    'id': 4,
    'name': 'Mary Poppendieck', 
    'number': '39-23-6423122'
  }
]

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
  // response.json(phonebook)
})

app.get('/info', (request, response) => {
  // const phonebookSize = phonebook.length
  Person.find({}).then(persons => {
    const phonebookSize = persons.length
    response.end(
      `Phonebook has info for ${phonebookSize} people\n${Date()}`
    )
  })
})

app.get('/api/persons/:id', (request, response, next) => {

  Person.findById(request.params.id).then(persons => {
    response.json(persons)
  })
    .catch(error => next(error))

  // const id = Number(request.params.id)
  // const person = phonebook.find(person => person.id === id)

  // if (person) {
  //   response.json(person)
  // } else {
  //   response.status(404).end()
  // }
})

app.post('/api/persons', (request, response, next) => {
  if (!request.body.name) {
    return response.status(400).json({
      error: 'name missing'
    })
  } else if (!request.body.number) {
    return response.status(400).json({
      error: 'number missing'
    })
  }
  // const checkDuplicate = phonebook.filter(person => person.name === request.body.name)
  // if (checkDuplicate.length > 0) {
  //   console.log("checkDuplicate:", checkDuplicate)
  //   const id = checkDuplicate.id
  //   axios.put(`api/persons/${id}`, request.body)
  //   // return response.status(400).json({ error: 'name must be unique' })
  // }
  // const new_id = Math.floor((Math.random() * 1000000) + 1)
  const personToAdd = request.body
  // person.id = new_id

  const person = new Person({
    name: personToAdd.name,
    number: personToAdd.number,
  })
  // phonebook = phonebook.concat(person)
  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
    .catch(error => {
      next(error)
    })
  
})

app.delete('/api/persons/:id', (request, response, next) => {

  Person.findByIdAndRemove(request.params.id).then(result => { // eslint-disable-line no-unused-vars
    response.status(204).end()
  })
    .catch(error => {
      next(error)
    })

  // const id = Number(request.params.id)
  // phonebook = phonebook.filter(person => person.id !== id)
  // console.log(phonebook)
  // response.status(204).end()
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatePerson => {
      response.json(updatePerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else {
    response.status(500).send({ error: `Something went wrong: ${error}}` })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 8080

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})