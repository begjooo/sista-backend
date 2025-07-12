import express from "express";
import cors from "cors";
import { router as routerIndex } from "./routers/index.js";
import { router as routerDosen } from "./routers/dosen.js";
import { router as routerMhs } from "./routers/mhs.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/', routerIndex);
app.use('/dosen', routerDosen);
app.use('/mhs', routerMhs);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});