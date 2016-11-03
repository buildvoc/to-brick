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

addTasks = (tasks) => {
  return createPromise(db.addTasks, tasks)
}


addCollection = (collection) => {
  return createPromise(db.addCollections, [collection])
}

addCollections = (collections) => {
  return createPromise(db.addCollections, collections)
}

addItems = (items) => {
  return createPromise(db.addItems, items)
}

addAll = (tasks, collections, items, log = false) => {
  return new Promise((resolve, reject) => {
    addTasks(tasks)
      .then(() => {
        if (log) {
          console.log(`Done adding ${tasks.length} ${tasks.length !== 1 ? 'tasks' : 'task'}`)
        }

        return addCollections(collections)
      })
      .then(() => {
        if (log) {
          console.log(`Done adding ${collections.length} ${collections.length !== 1 ? 'collections' : 'collection'}`)
        }
        return addItems(items)
      })
      .then(() => {
        if (log) {
          console.log(`Done adding ${items.length} ${items.length !== 1 ? 'items' : 'item'}`)
        }
        resolve()
      })
      .catch((err) => {
        if (log) {
          console.error(`Error: ${err.message}`)
        }
        reject(err)
      })
  })
}

module.exports = {
  addTasks,
  addCollection,
  addCollections,
  addItems,
  addAll
}