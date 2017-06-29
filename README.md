# to-brick

Writes data to [brick-by-brick](https://github.com/nypl-spacetime/brick-by-brick) database.

## Installation & Usage

Installation:

    npm install --save nypl-spacetime/to-brick

Usage:

```js
const toBrick = require('to-brick')

const tasks = require('./tasks.json')
const collections = require('./collections.json')
const items = require('./items.json')

toBrick.addAll(tasks, collections, items)
  .then(() => {
    console.log('Done!')
  })
  .catch((err) => {
    console.error(err)
  })
```

By default, to-brick uses the following connection string to connect to PostgreSQL:

    postgres://postgres:postgres@localhost:5432/brick-by-brick

To connect to a different database, use the `-d` command line argument when running the module in which you include to-brick:

    node index.js -d "postgres://user:password@host:port/database"

## API

### `addTasks (tasks)`

Adds an array of tasks to brick-by-brick. Returns a promise.

### `addCollection (collection)`

Adds a single collection to brick-by-brick. Returns a promise.

### `addCollections (collections)`

Adds an array of collections to brick-by-brick. Returns a promise.

### `addItems (items)`

Adds an array of items to brick-by-brick. Returns a promise.

### `addAll (tasks, collections, items, logging = false)`

Adds an array of tasks, collections and items to brick-by-brick, and optionally logs its progress. Returns a promise.

## Tasks, Collections and Items

### Task

Example array of tasks:

```js
[
  {
    // Task ID can be any string
    id: 'geotag-photo'
  }, {
    id: 'select-toponym'
  }
]
```

### Collection

Example collection:

```js
{
  organization_id: 'nypl',
  tasks: [
    {
      // Task IDs must exist in array of tasks
      id: 'geotag-photo',
      submissionsNeeded: 10
    }, {
      id: 'select-toponym',
      submissionsNeeded: 5
    }
  ],
  id: 'a1f0cf50-c5f3-012f-5ec8-58d385a7bc34',
  title: 'Dinanda Nooney Brooklyn photograph collection',
  url: 'http://digitalcollections.nypl.org/collections/dinanda-nooney-brooklyn-photograph-collection#/?tab=about'
}
```

### Item

Example item:

```js
{
  // Organization ID must exist in brick-by-brick database. Currently, you must do this manually...
  organization_id: 'nypl',
  id: '510d47e2-cbbc-a3d9-e040-e00a18064a99',
  // Collection ID must exist in array of collections
  collection_id: 'a1f0cf50-c5f3-012f-5ec8-58d385a7bc34',
  data: {
    // An item's data object may be any JSON object
    title: 'Jackson Court & Ft. Hamilton Parkway from Verrazano Bridge. Bay Ridge. January 21, 1978.',
    url: 'http://digitalcollections.nypl.org/items/510d47e2-cbbc-a3d9-e040-e00a18064a99',
    image_id: '1563431',
    location: 'Brooklyn (New York, N.Y.)',
    date: '1978'
  }
}
```

## Examples:

See:

- https://github.com/nypl-spacetime/dc-to-brick
- https://github.com/nypl-spacetime/oral-history-to-brick
- https://github.com/nypl-spacetime/crf-to-brick
