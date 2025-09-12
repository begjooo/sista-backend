import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;

export let mongoDosenCol = null;
export let mongoMhsCol = null;
export let mongoTaCol = null;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const mongoClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

export async function mongoConn() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await mongoClient.connect();
    const db = mongoClient.db('sista');

    await db.createCollection('dosen');
    await db.createCollection('mahasiswa');
    await db.createCollection('tugas_akhir');

    mongoDosenCol = db.collection('dosen');
    mongoMhsCol = db.collection('mahasiswa');
    mongoTaCol = db.collection('tugas_akhir');

    // Send a ping to confirm a successful connection
    await mongoClient.db("admin").command({ ping: 1 });
    console.log("mongodb: successfully connected to mongodb");
  } catch (error) {
    console.log(error);
  };
};

export async function mongodbInsertData(collection, data) {
  console.log(`mongodbInsertData()`);
  try {
    let result = null;
    if (collection === 'dosen') {
      result = await mongoDosenCol.insertOne(data);
    } else if (collection === 'mahasiswa') {
      result = await mongoMhsCol.insertOne(data);
    };

    return {
      status: true,
      message: `mongodb: insert data to ${collection} success!`,
    };
  } catch (error) {
    console.log(`mongodb: ${error.message}`);
    return {
      status: false,
      message: error.message,
    };
  };
};

export async function mongodbGetList(collection) {
  console.log(`mongodbGetList()`);
  try {
    let data = null;
    if (collection === 'dosen') {
      data = await mongoDosenCol.find().toArray();
    } else if (collection === 'mahasiswa') {
      data = await mongoMhsCol.find().toArray();
    } else if (collection === 'tugas_akhir') {
      data = await mongoTaCol.find().toArray();
    };

    return data;
  } catch (error) {
    console.log(error.message);
    return false;
  };
};

export async function mongodbGetData(collection, id) {
  console.log(`mongodbGetData()`);
  try {
    let data = null;
    if (collection === 'dosen') {
      data = await mongoDosenCol.findOne({ _id: id });
    } else if (collection === 'mahasiswa') {
      data = await mongoMhsCol.findOne({ _id: id });
    } else if (collection === 'tugas_akhir') {
      data = await mongoTaCol.findOne({ _id: id });
    };

    return data;
  } catch (error) {
    console.log(error.message);
    return false;
  };
};

export async function mongodbUpdateData(collection, username, newData) {
  console.log(`mongodbUpdateData()`);
  try {
    if (collection === 'dosen') {
      await mongoDosenCol.updateOne({ _id: username }, newData);
    } else if (collection === 'mahasiswa') {
      await mongoMhsCol.updateOne({ _id: username }, newData);
    };

    return {
      status: true,
      message: `mongodb: update data success!`,
    };
  } catch (error) {
    console.log(`mongodb: ${error.message}`);
    return {
      status: false,
      message: error.message,
    };
  };
};