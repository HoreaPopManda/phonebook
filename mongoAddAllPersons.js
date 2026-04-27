const persons = require('./index.js')
const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

// const url = `mongodb+srv://fullstack:${password}@cluster0.a5qfl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
const url = `mongodb+srv://horeapopmanda_db_user:${password}@cluster0.7jkvtae.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`
mongoose.set('strictQuery',false)

mongoose.connect(url, { family: 4 })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)


async function savePersons() {
  for (const p of persons) {
    console.log(`Adding person: ${p.name}`)
    const onePerson = new Person(p)

    // Wait for this save to finish before moving to the next item
    await onePerson.save()
    console.log('person saved!')
  }

  // Now that the loop is completely finished, close the connection
  mongoose.connection.close()
  console.log('All persons saved and connection closed.')
}

savePersons()


