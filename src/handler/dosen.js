import { dosenDb } from "../db/dummyDosen.js";

export async function getDosenDb() {
  console.log(`getDosenDb()`);
  return dosenDb;
};

export async function getDosenList() {
  console.log(`getDosenList()`);
  const dosenDb = await getDosenDb();
  const dosenList = dosenDb.filter((item) => {
    // delete item.password;
    return item.job === 'dosen';
  });

  return dosenList;
};

export async function getDosenData(username) {
  const list = await getDosenDb();
  const data = list.find((item) => {
    // delete item.password;
    return item.username === username;
  });
  console.log(data)

  if (!data) {
    return 0;
  } else {
    return data;
  };
};