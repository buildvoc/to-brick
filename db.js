var H = require('highland')
var R = require('ramda')
var pg = require('pg')

module.exports = function (databaseUrl) {
  function executeQuery (query, params, callback) {
    pg.connect(databaseUrl, (err, client, done) => {
      var handleError = (err) => {
        if (!err) {
          return false
        }

        if (client) {
          done(client)
        }

        callback(err)
        return true
      }

      if (handleError(err)) {
        return
      }

      client.query(query, params, (err, results) => {
        if (handleError(err)) {
          return
        }
        done()
        callback(null, results.rows)
      })
    })
  }

  function executeQueries(query, rows, callback) {
    H(rows)
      .map(H.curry(executeQuery, query))
      .nfcall([])
      .series()
      .errors(callback)
      .done(callback)
  }

  function addTasks(tasks, callback) {
    var query = `
      INSERT INTO
        tasks (id, description)
      VALUES ($1, $2)
      ON CONFLICT (id) DO UPDATE SET
        description = EXCLUDED.description;`

    executeQueries(query, tasks, callback)
  }

  function addCollections (collections, callback) {
    const collectionsQuery = `
      INSERT INTO
        collections (organization_id, id, title, url)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (organization_id, id) DO UPDATE SET
        title = EXCLUDED.title,
        url = EXCLUDED.url;`

    const collectionsTasksQuery = `
      INSERT INTO
        collections_tasks (organization_id, collection_id, task_id, submissions_needed)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (organization_id, collection_id, task_id) DO UPDATE SET
        submissions_needed = EXCLUDED.submissions_needed;`

    const collectionRows = collections
      .map(R.omit(['tasks']))
      .map(R.values)

    const collectionsTasks = R.flatten(collections
      .map((collection) => collection.tasks
        .map((collectionTask) => ({
          organization_id: collection.organization_id,
          collection_id: collection.id,
          task_id: collectionTask.task,
          submissions_needed: collectionTask.submissionsNeeded
        }))
      ))
      .map(R.values)

    executeQueries(collectionsQuery, collectionRows, (err) => {
      if (err) {
        callback(err)
      } else {
        executeQueries(collectionsTasksQuery, collectionsTasks, callback)
      }
    })
  }

  function addItems (items, callback) {
    const query = `
      INSERT INTO
        items (organization_id, id, collection_id, data)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (organization_id, id) DO UPDATE SET
        collection_id = EXCLUDED.collection_id,
        data = EXCLUDED.data;`

    executeQueries(query, items.map(R.values), callback)
  }

  return {
    executeQuery,
    addTasks,
    addCollections,
    addItems
  }
}
