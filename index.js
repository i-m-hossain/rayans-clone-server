const express = require('express')
const { MongoClient } = require('mongodb');
const fileUpload = require('express-fileupload');
var cors = require('cors')
require('dotenv').config()
const app = express()
const port = 5000

/** 
 * middleware
*/
app.use(cors())
app.use(express.json())
app.use(fileUpload());

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
    * Get api
    */
    const get_api = (uri, collection) => {
      app.get(`${uri}`, async (req, res) => {
        const cursor = collection.find({});
        const result = await cursor.toArray()
        res.json(result)
      })
    }

    /**
    * Post api
    */
    const post_api = (uri, collection) => {
      app.post(`${uri}`, async (req, res) => {
        let document = req.body
        if (req?.files?.image) {
          const imageData = req.files.image.data
          const encoded = imageData.toString('base64');
          const image = Buffer.from(encoded, 'base64')
          document = {
            ...document, image
          }
        }
        const result = await collection.insertOne(document)
        res.json(result)
      })
    }
    get_api('/products', productsCollection)
    post_api('/products', productsCollection)



  } finally {
    // await client.close();
  }
}
run().catch(console.dir);



/**
* Test Connection
*/
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})