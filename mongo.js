const mongoose = require("mongoose")

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://Daniel:${password}@cluster0.iop0eh1.mongodb.net/test`

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length > 3) {
  mongoose.connect(url).then((result) => {
    const person = new Person({
      name: process.argv[3],
      number: process.argv[4]
    })
    return person.save()
  }).then(() => {
    console.log(`added ${process.argv[3]} number ${process.argv[4]} to phonebook`)
    return mongoose.connection.close()
  })
  .catch((err) => {console.log(err)})
} else {
  mongoose.connect(url).then((result) => {
    Person.find({}).then((persons) => {
      console.log("phonebook:")
      result.forEach(person => {
        console.log(`${person.name} ${person.number}`)
      })
      mongoose.connection.close()
    })})
    .catch((err) => {console.log(err)})
}