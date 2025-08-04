import { mongoDosenCol, mongoMhsCol } from "../db/mongo/conn.js";

export async function mongodbInsertData(collection, username) {
  console.log(`mongodbInsertData()`);
  try {
    let result = null;
    if (collection === 'dosen') {
      result = await mongoDosenCol.insertOne({ _id: username });
    } else if (collection === 'mahasiswa') {
      result = await mongoMhsCol.insertOne({ _id: username });
    };

    return {
      status: true,
      message: `mongodb: insert data success!`,
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
    };

    return data;
  } catch (error) {
    console.log(error.message)
    return false;
  };
};

export async function mongodbGetData(collection, username) {
  console.log(`mongodbGetData()`);
  try {
    let data = null;
    if (collection === 'dosen') {
      data = await mongoDosenCol.findOne({ _id: username });
    } else if (collection === 'mahasiswa') {
      data = await mongoMhsCol.findOne({ _id: username });
    };

    return data;
  } catch (error) {
    console.log(error.message)
    return false;
  };
};

export async function mongodbUpdateData(collection, username, updatedData) {
  console.log(`mongodbUpdateData()`);
  try {
    if (collection === 'dosen') {
      await mongoDosenCol.updateOne({ _id: username }, updatedData);
    } else if (collection === 'mahasiswa') {
      await mongoMhsCol.updateOne({ _id: username }, updatedData);
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