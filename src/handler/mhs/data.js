// import { mahasiswaDb } from "../../db/dummyMhs.js";

// export async function getMhsDb() {
//   console.log(`getMhsDb()`);
//   return mahasiswaDb;
// };

// export async function getMhsList() {
//   console.log(`getMhsList()`);
//   const mhsDb = await getMhsDb();

//   let list = mhsDb.map((item) => {
//     return item;
//   });

//   return list;
// };

// export async function getMhsData(username) {
//   console.log(`getMhsData()`);
//   const list = await getMhsDb();
//   const data = list.find((item) => {
//     return item.username === username;
//   });

//   if (!data) {
//     return 0;
//   } else {
//     return data;
//   };
// };