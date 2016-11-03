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

  function executeObjectQuery(parameterizedQuery, object, callback) {
    const columns = R.keys(object).join(', ')
    const values = R.keys(object).map((key, i) => `$${i + 1}`).join(', ')
    const params = R.values(object)
    const query = parameterizedQuery.replace('$COLUMNS', columns).replace('$VALUES', values)

    executeQuery(query, params, callback)
  }

  function executeObjectQueries(query, objects, callback) {
    H(objects)
      .map(H.curry(executeObjectQuery, query))
      .nfcall([])
      .series()
      .errors(callback)
      .done(callback)
  }

  function addTasks(tasks, callback) {
    var query = `
      INSERT INTO
        tasks ($COLUMNS)
      VALUES ($VALUES)
      ON CONFLICT (id) DO UPDATE SET
        description = EXCLUDED.description;`

    executeObjectQueries(query, tasks, callback)
  }

  function addCollections (collections, callback) {
    const collectionsQuery = `
      INSERT INTO
        collections ($COLUMNS)
      VALUES ($VALUES)
      ON CONFLICT (organization_id, id) DO UPDATE SET
        title = EXCLUDED.title,
        url = EXCLUDED.url;`

    const collectionsTasksQuery = `
      INSERT INTO
        collections_tasks ($COLUMNS)
      VALUES ($VALUES)
      ON CONFLICT (organization_id, collection_id, task_id) DO UPDATE SET
        submissions_needed = EXCLUDED.submissions_needed;`

    const collectionRows = collections
      .map(R.omit(['tasks']))

    const collectionsTasks = R.flatten(collections
      .map((collection) => collection.tasks
        .map((collectionTask) => ({
          organization_id: collection.organization_id,
          collection_id: collection.id,
          task_id: collectionTask.id,
          submissions_needed: collectionTask.submissionsNeeded
        }))
      ))

    executeObjectQueries(collectionsQuery, collectionRows, (err) => {
      if (err) {
        callback(err)
      } else {
        executeObjectQueries(collectionsTasksQuery, collectionsTasks, callback)
      }
    })
  }

  function addItems (items, callback) {
    const query = `
      INSERT INTO
        items ($COLUMNS)
      VALUES ($VALUES)
      ON CONFLICT (organization_id, id) DO UPDATE SET
        collection_id = EXCLUDED.collection_id,
        data = EXCLUDED.data;`

    executeObjectQueries(query, items, callback)
  }

  return {
    executeQuery,
    addTasks,
    addCollections,
    addItems
  }
}
