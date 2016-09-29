var argv = require('minimist')(process.argv.slice(2), {
  alias: {
    d: 'database'
  }
})

const DATABASE_URL = argv.d || 'postgres://postgres:postgres@localhost:5432/surveyor'
const db = require('./db')(DATABASE_URL)

module.exports.addCollection = (collection, callback) => {
  db.replaceRows('collections', collection.provider, collection.id, [collection], callback)
}

module.exports.addCollections = (collections, callback) => {
  if (collections && collections.length) {
    const provider = collections[0].provider
    const collectionId = collections[0].id
    db.replaceRows('collections', provider, collectionId, collections, callback)
  } else {
    callback()
  }
}

module.exports.addItems = (items, callback) => {
  if (items && items.length) {
    const provider = items[0].provider
    const collectionId = items[0].collectionId
    db.replaceRows('items', provider, collectionId, items, callback)
  } else {
    callback()
  }
}
