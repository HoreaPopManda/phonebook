const mongoose = require('mongoose')

mongoose.set('strictQuery', false)


const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url, { family: 4 })

  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name:  {
    type: String,
    minlength: 3,
    required: true
  },
  number: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v) {
        // 1. Check if total length is 8 or more
        if (v.length < 8) return false

        // 2. Regex check:
        // ^\d{2,3}  -> Starts with 2 or 3 digits
        // -         -> Contains one hyphen
        // \d+$      -> Ends with digits
        const regex = /^\d{2,3}-\d+$/
        return regex.test(v)
      },
      message: props => `${props.value} is not a valid phone number. It must be at least 8 characters, formatted as "XX-..." or "XXX-..."`
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
