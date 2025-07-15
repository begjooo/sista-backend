import { mahasiswaDb } from "../db/dummyMhs.js";

export async function getMhsDb() {
  console.log(`getMhsDb()`);
  return mahasiswaDb;
};

export async function getMhsList() {
  console.log(`getMhsList()`);
  const mhsDb = await getMhsDb();

  let list = mhsDb.map((item) => {
    // delete item.password;
    return item;
  });

  return list;
};

export async function getMhsData(username) {
  const list = await getMhsDb();
  const data = list.find((item) => {
    // delete item.password;
    return item.username === username;
  });

  if (!data) {
    return 0;
  } else {
    return data;
  };
};

const statusSemproEnum = {
  0: 'Belum Mengajukan',
  1: 'Pengajuan Judul',
  2: 'Pengajuan Pembimbing',
  3: 'Sudah Mengajukan',
};

async function pengajuanJudulSempro(username, judul, kbk) {
  console.log(`pengajuanJudulSempro()`);
  const mhs = await getMhsData(username);
  mhs.sempro = { judul, kbk, status: statusSemproEnum[1] }
  console.log(mhs);
};

export async function pengajuanSempro(request) {
  console.log(`pengajuanSempro()`);
  console.log(request);

  await pengajuanJudulSempro(request.username, request.judulSempro, request.kbk);

  const pbb1 = await getDosenData(request.pbb.dosen1.username);
  console.log(pbb1);

  pbb1.sempro = {
    pemohon: [],
    bimbingan: [],
  };

  const mhs = await getMhsData(request.username)

  pbb1.sempro.pemohon.push(mhs);
  console.log(pbb1);
  console.log(pbb1.sempro)

  return;
};