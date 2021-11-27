const express = require('express')
const { MongoClient } = require('mongodb');
const fileUpload = require('express-fileupload');
const ObjectId = require('mongodb').ObjectId;
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
    const usersCollection = database.collection("users");

    /** 
    * Get api
    */
    const get_api = (uri, collection) => {
      app.get(`${uri}`, async (req, res) => {
        let query = {}
        const cursor = collection.find(query);
        const result = await cursor.toArray()
        res.json(result)

      })
    }
    /** 
    * Get api query
    */
    const get_api_query = (uri, collection) => {
      app.get(`${uri}`, async (req, res) => {
        const email = req?.query?.email
        let query = { email, email }
        const result = await collection.findOne(query);
        res.json({ role: result.role })
      })
    }
    /** 
    * Get api single
    */
    const get_api_single = (uri, collection) => {
      app.get(`${uri}`, async (req, res) => {
        const documentId = req?.params?.id
        const query = { _id: ObjectId(documentId) }
        const result = await collection.findOne(query);
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
    /* *
    * Delete API
    */
    const delete_api = (uri, collection) => {
      app.delete(`${uri}`, async (req, res) => {
        const documentId = req?.params?.id
        const query = { _id: ObjectId(documentId) }
        const result = await collection.deleteOne(query);
        res.json(result)
      })
    }
    /**
    * Put api
    */
    // const put_api = (uri, collection) => {
    //   app.post(`${uri}`, async (req, res) => {
    //     let document = req.body
    //     if (req?.files?.image) {
    //       const imageData = req.files.image.data
    //       const encoded = imageData.toString('base64');
    //       const image = Buffer.from(encoded, 'base64')
    //       document = {
    //         ...document, image
    //       }
    //     }
    //     const result = await collection.insertOne(document)
    //     res.json(result)
    //   })
    // }

    // products api
    get_api('/products', productsCollection)
    get_api_single('/products/:id', productsCollection)
    post_api('/products', productsCollection)
    delete_api('/products/:id', productsCollection)

    // users api
    post_api('/users', usersCollection)
    get_api_query('/users/role', usersCollection)
    // put_api('/products', productsCollection)



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