import express from "express";
import { psqlGetFullData } from "../handler/psql.js";

export const router = express.Router();

router.get('/data/:username', async (req, res) => {
  const username = req.params.username;
  const data = await psqlGetFullData(`dosen`, username);
  res.send(data);
});