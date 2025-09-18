import express from "express";
import fs from "fs";

export const router = express.Router();
const dirPath = `./public/administrasi`;

router.get('/list', (req, res) => {
  console.log(`get /adm/list`);
  const docName = fs.readdirSync(dirPath);
  console.log(docName);
  const docList = docName.filter((item) => item.includes('.doc'));
  console.log(docList);
  const list = docName.map((item) => {
    return {
      name: item,
      path: `/administrasi/${item}`
    };
  })
  res.send(list);
});