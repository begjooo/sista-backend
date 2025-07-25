import { MongoClient, ServerApiVersion } from "mongodb";

const uri = "mongodb+srv://begjooo:UgZh0pzYA02unVyU@cluster.8gmzy5j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const mongoClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

export let mongoDosenCol = null;
export let mongoMhsCol = null;

export async function mongoConn() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await mongoClient.connect();
    const db = mongoClient.db('sista');
    mongoDosenCol = db.collection('dosen');
    mongoMhsCol = db.collection('mahasiswa');
    // Send a ping to confirm a successful connection
    await mongoClient.db("admin").command({ ping: 1 });
    console.log("mongodb: successfully connected to mongodb");
  } catch (error) {
    console.log(error);
  };
};