import express from "express";
import { getFullData } from "../handler/psql.js";

export const router = express.Router();

router.get('/data/:username', async (req, res) => {
  const username = req.params.username;
  const data = await getFullData(`dosen`, username);
  res.send(data);
});