require('dotenv').config()
console.log(process.env.MONGODB_URI)
const express = require("express")
const morgan = require('morgan')
const Person = require('./person')

const app = express()

app.use(express.json())

morgan.token('data', function (req, res) { return JSON.stringify(req.body) })
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

let phonebook = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.get("/api/persons", (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
  // response.json(phonebook)
})

app.get("/info", (request, response) => {
  // const phonebookSize = phonebook.length
  Person.find({}).then(persons => {
    const phonebookSize = persons.length
    response.end(
      `Phonebook has info for ${phonebookSize} people\n${Date()}`
    )
  })
})

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id)
  const person = phonebook.find(person => person.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.post("/api/persons", (request, response) => {
  if (!request.body.name) {
    return response.status(400).json({
      error: "name missing"
    })
  } else if (!request.body.number) {
    return response.status(400).json({
      error: "number missing"
    })
  }
  if ((phonebook.filter(person => person.name === request.body.name)).length > 0) {
    return response.status(400).json({ error: 'name must be unique' })
  }
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
  
})

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id)
  phonebook = phonebook.filter(person => person.id !== id)
  console.log(phonebook)
  response.status(204).end()
})

const PORT = process.env.PORT || 8080

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})