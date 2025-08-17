import { mongoDosenCol, mongoMhsCol, mongoTaCol } from "../db/mongo/conn.js";

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