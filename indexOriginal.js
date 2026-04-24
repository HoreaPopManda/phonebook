const express = require('express')
const morgan = require('morgan')

const app = express()


morgan.token('newPerson', function getNewPerson (req) {
  return req.body ? JSON.stringify(req.body) : ''
})

app.use(express.json())
app.use(express.static('dist'))
//app.use(morgan('tiny'))
//app.use(morgan('combined'))
app.use (morgan(':method :url :status :res[content-length] - :response-time ms :newPerson'))


let persons = [
    {
      "name": "Arto Hellas",
      "number": "040-123456",
      "id": "1"
    },
    {
      "name": "Ada Lovelace",
      "number": "39-44-5323523",
      "id": "2"
    },
    {
      "name": "Dan Abramov",
      "number": "12-43-234345",
      "id": "3"
    },
    {
      "name": "Mary Poppendieck",
      "number": "39-23-6423122",
      "id": "4"
    },
    {
      "name": "Iliuta Curmezan",
      "number": "61-23-6423122",
      "id": "5"
    },
    {
      "name": "John Henry",
      "number": "33-66-77",
      "id": "Mwym72n0n6M"
    },
    {
      "name": "Tod Rodd",
      "number": "55-33-11",
      "id": "-sQoIg5vIdg"
    },
    {
      "name": "pm dawn",
      "number": "33-77-88",
      "id": "0khsv2Xi9AY"
    }
  ]

const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => Number(n.id)))
    : 0
  return String(maxId + 1)
}

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// app.use(unknownEndpoint)

// create a new person
app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({ 
      error: 'name is missing' 
    })
  }

  if (!body.number) {
    return response.status(400).json({ 
      error: 'number is missing' 
    })
  }

  if (persons.find(person => person.name === body.name)) {
    return response.status(400).json({ 
      error: 'name must be unique' 
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: getRandomInt(1000000).toString(),
  }

  persons = persons.concat(person)

  response.json(person)
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    const person = persons.find(person => person.id === id);
    if (person) {
        response.json(person);
    } else {
        response.status(404).end();
    }
})

app.get('/info', (request, response) => {
  response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    persons = persons.filter(person => person.id !== id);
    response.status(204).end();
});


// update a person's number (and it's name)
app.put('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    const body = request.body;

    persons = persons.map(person =>
        person.id === id ? { ...person, number: body.number } : person
    );

    response.json(persons.find(person => person.id === id));
});

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Phonebook server running on port ${PORT}`)
})

// You must explicitly export what you want to share. 
// we export the persons to the mongoAddAllPersons.js file, which will add them to the database
module.exports = persons;