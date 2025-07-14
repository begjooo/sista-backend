import express from "express";
import { getDosenData, getDosenList } from "../handler/dosen.js";

export const router = express.Router();

router.get('/list', async (req, res) => {
  const list = await getDosenList();
  res.send(list);
});

router.get('/data/:username', async (req, res) => {
  const username = req.params.username;
  const data = await getDosenData(username);
  res.send(data);
});