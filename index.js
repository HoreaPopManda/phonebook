require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()

morgan.token('newPerson', function getNewPerson (req) {
  return req.body ? JSON.stringify(req.body) : ''
})

app.use(express.json())
app.use(express.static('dist'))
//app.use(morgan('tiny'))
//app.use(morgan('combined'))
app.use (morgan(':method :url :status :res[content-length] - :response-time ms :newPerson'))


const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => Number(n.id)))
    : 0
  return String(maxId + 1)
}

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
}


//////// create a new person (update number if exists) - working
app.post('/api/persons', (request, response) => {

  if (!request.body.name) {
    return response.status(400).json({ 
      error: 'name is missing' 
    })
  }

  if (!request.body.number) {
    return response.status(400).json({ 
      error: 'number is missing' 
    })
  }

  Person.findOne({ name: request.body.name }).then(existingPerson => {
    if (existingPerson) {
      console.log(`Person with name ${existingPerson.name} already exists, updating number...`)

      existingPerson.number = request.body.number

      return existingPerson.save().then(savedPerson => {
        response.status(201).json(savedPerson)
      })
    }
    else {
        console.log(`Creating new person with name ${request.body.name}`)
        const newPerson = new Person({
          name: request.body.name,  
          number: request.body.number,
          id: getRandomInt(1000000).toString()
        })

        newPerson.save().then(savedPerson => {
          response.json(savedPerson)
        })
    }
  })
})

//////// get the persons - working
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next  ) => {

  Person.findById(request.params.id).then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
  }).catch(error => next(error) )

})

/////// get info about the phonebook
app.get('/info', (request, response) => {
  //response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`)
  Person.countDocuments({}).then(count => {
    response.send(`<p>Phonebook has info for ${count} people stored in a MongoDB database</p><p>${new Date()}</p>`)
  })
})


//////// delete a person
app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id;
    Person.findByIdAndDelete(id).then(() => {
        response.status(204).end();
    })
    .catch(error => next(error) );
});


////////// update a person details - working
app.put('/api/persons/:id', (request, response, next) => {

  const { name,  number } = request.body;

    Person.findById(request.params.id)
    .then(person => {
      if (!person) {
        return response.status(404).end()
      }

      person.name = name
      person.number = number

      return person.save().then((updatedPerson) => {
        response.json(updatedPerson)
      })
    })
    .catch(error => next(error))
});


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown phonebook API endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted phonebook id' })
  } 

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)


const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Phonebook server running on port ${PORT}`)
})

