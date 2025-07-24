import express from "express";
import { getFullData, getFullDb } from "../handler/psql.js";

export const router = express.Router();

router.get('/data/:username', async (req, res) => {
  const username = req.params.username;
  const data = await getFullData(`dosen`, username);
  res.send(data);
});

router.get('/dosen-list', async (req, res) => {
  const list = await getFullDb(`dosen`, `dosen`);
  res.send(list);
});

router.post('/dosen/create', async (req, res) => {
  res.send(`done`);
});