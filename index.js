var argv = require('minimist')(process.argv.slice(2), {
  alias: {
    d: 'database'
  }
})

const DATABASE_URL = argv.d || 'postgres://postgres:postgres@localhost:5432/brick-by-brick'
const db = require('./db')(DATABASE_URL)

const createPromise = (fun, ...args) => {
  return new Promise((resolve, reject) => {
    const callback = (err) => {
      if (!err) {
        resolve()
      } else {
        reject(err)
      }
    }

    fun.apply(this, [...args, callback])
  })
}

module.exports.addTasks = (tasks) => {
  return createPromise(db.addTasks, tasks)
}


module.exports.addCollection = (collection) => {
  return createPromise(db.addCollections, [collection])
}

module.exports.addCollections = (collections) => {
  return createPromise(db.addCollections, collections)
}

module.exports.addItems = (items) => {
  return createPromise(db.addItems, items)
}
