// import { getMhsData } from "./data.js";

const statusPengajuan = {
  0: 'Belum',
  1: 'Proses',
  2: 'Diterima',
  3: 'Ditolak',
};

async function pengajuanJudul(username, kbk, judul, deskripsi, status, pbb) {
  console.log(`pengajuanJudul()`);
  // const ajuanMhs = await getMhsData(username);
  ajuanMhs.ta.pengajuan = { judul, deskripsi, kbk, status, pbb };
  console.log(ajuanMhs);
  return ajuanMhs;
};

export async function pengajuanTa(request) {
  console.log(`pengajuanTa()`);
  console.log(request);

  const ajuanJudul = await pengajuanJudul(request.username, request.kbk, request.judul, request.deskripsi, request.status, request.pbb);
  return ajuanJudul;
  // const pbb1 = await getDosenData(request.pbb.dosen1.username);
  // console.log(pbb1);

  // pbb1.sempro = {
  //   pemohon: [],
  //   bimbingan: [],
  // };

  // const mhs = await getMhsData(request.username)

  // pbb1.sempro.pemohon.push(mhs);
  // console.log(pbb1);
  // console.log(pbb1.sempro)

  // return;
};