// import { getMhsData } from "../mhs/data.js";
// import { getDosenData } from "./data.js";

async function ajukanBimbingan(mhsUsername, dosenUsername) {
  // const mhs = await getMhsData(mhsUsername);
  // console.log(mhs);

  const mhsData = {
    name: mhs.name,
    username: mhs.username,
    kbk: mhs.ta.pengajuan.kbk,
    judul: mhs.ta.pengajuan.judul,
    deskripsi: mhs.ta.pengajuan.deskripsi,
  };

  // const dosen = await getDosenData(dosenUsername);
  const isMhsRequested = await dosen.permintaanBimbingan.find((item) => item.username === mhsUsername);
  const isMhsBimbingan = await dosen.bimbingan.find((item) => item.username === mhsUsername);
  // console.log('isMhsRequested', isMhsRequested);
  if (!isMhsRequested && !isMhsBimbingan) {
    console.log(`mhs is not in permintaan bimbingan nor bimbingan`);
    dosen.permintaanBimbingan.push(mhsData);
  } else {
    console.log(`mhs already in permintaan bimbingan nor bimbingan`);
  };
};

export async function permintaanBimbingan(mhsUsername, pbb) {
  console.log(`permintaanBimbingan()`);

  const dosen1 = pbb.dosen1;
  console.log(dosen1);
  await ajukanBimbingan(mhsUsername, dosen1.username);

  const dosen2 = pbb.dosen2;
  if (dosen2) {
    console.log(dosen2);
  };
};