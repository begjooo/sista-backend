import fs from "fs";

export const admDirPath = `./public/administrasi`;
export const taDirPath = `./public/tugas-akhir/`;

export function initBerkas() {
  console.log(`initBerkas()`);

  if (!fs.existsSync(admDirPath)) {
    fs.mkdirSync(admDirPath);
  };

  if (!fs.existsSync(taDirPath)) {
    fs.mkdirSync(taDirPath);
  };
};