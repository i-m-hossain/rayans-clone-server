const express = require('express')
const { MongoClient } = require('mongodb');
var cors = require('cors')
require('dotenv').config()
const app = express()
const port = 5000

/** 
 * middleware
*/
app.use(cors())
app.use(express.json())

/**  
* mongodb credentials
*/
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.krune.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    const database = client.db("ryans_clone");
    const productsCollection = database.collection("products");
    // create a document to insert

    /**
    * Post api
    */
    const post_api = (uri, collection) => {
      app.post(`${uri}`, async (req, res) => {
        const document = req.body
        const result = await collection.insertOne(document)
        res.json(result)
        console.log('success')
      })
    }

    post_api('/products', productsCollection)


  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

/** 
* Get api
*/
const get_api = (url) => {
  app.get(`/${url}`, (req, res) => {
    res.send('Hello World!')
  })
}

/**
* Test Connection
*/
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})