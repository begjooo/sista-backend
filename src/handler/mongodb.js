// import { MongoClient } from "mongodb";
import { mongoDosenCol, mongoMhsCol } from "../db/mongo/conn.js";

export async function mongodbInsertData(collection, username) {
  console.log(`mongodbInsertData()`);
  let result = null;
  try {
    if (collection === 'dosen') {
      result = await mongoDosenCol.insertOne({ _id: username });
    } else if (collection === 'mhs') {
      result = await mongoMhsCol.insertOne({ _id: username });
    } else if (collection === 'tendik') {
      // result = await mongoMhsCol.insertOne({ _id: username });
    };

    return {
      status: true,
      message: `mongodb: insert data success!`,
    };
  } catch (error) {
    console.log(`mongpdb: ${error.message}`);
    return {
      status: false,
      message: error.message,
    };
  };
};

export async function mongodbUpdateData(collection, username, updatedData) {
  console.log(`psqlUpdateData()`);
  let result = null;
  try {
    if (collection === 'dosen') {
      result = await mongoDosenCol.updateOne({ _id: username }, { $set: updatedData });
    } else if (collection === 'mhs') {
      result = await mongoMhsCol.updateOne({ _id: username }, { $set: updatedData });
    } else if (collection === 'tendik') {
      // result = await mongoMhsCol.updateOne({ _id: username }, { $set: updatedData });
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