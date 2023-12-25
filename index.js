const express = require('express')
const app = express();
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000;

//middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
    ],
    credentials: true
}));
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vgt34f5.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const taskCollection = client.db("taskmanagement").collection("alltasks")
        const usersCollection = client.db("taskmanagement").collection("users")

        app.post('/alltasks', async (req, res) => {
            const tasks = req.body;
            const result = await taskCollection.insertOne(tasks);
            res.send(result)
        })
        app.get('/alltasks/:uid', async (req, res) => {
            const uid = req.params.uid;
            const result = await taskCollection.find({ "uid": uid }).toArray();
            res.send(result)
            
          });

          app.patch('/alltasks/:id', async (req, res) => {
            const todoId = req.params.id;
            const { status } = req.body;
      
            try {
              const result = await taskCollection.findOneAndUpdate(
                { _id: new ObjectId(todoId) },
                { $set: { status: status } },
                { returnDocument: "after" }
              );
      
              res.send(result)
            } catch (error) {
              console.error("Error updating todo:", error);
            }
          });

          app.get('/alltasks/todo/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await taskCollection.findOne(query);
            res.send(result);
          })


          app.put('/alltasks/v2/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedTask = req.body;
      
            const product = {
              $set: {
                tasktitle: updatedTask.tasktitle,
                description: updatedTask.description,
                deadline: updatedTask.deadline,
               
              }
            }
      
            const result = await taskCollection.updateOne(filter, product, options);
            res.send(result);
          })


          app.delete('/alltasks/:id', async (req, res) => {
            const { id } = req.params;
            const query = { _id: new ObjectId(id) };
            const result = await taskCollection.deleteOne(query);
            res.send(result);
          });

        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })



        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //   await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('taskmanagement is running')
})
app.listen(port, () => {
    console.log(`taskmanagement is sitting on port ${port}`);
})