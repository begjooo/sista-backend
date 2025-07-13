import express from "express";
import cors from "cors";
import { router as routerIndex } from "./src/routers/index.js";
import { router as routerDosen } from "./src/routers/dosen.js";
import { router as routerMhs } from "./src/routers/mhs.js";
import cookieParser from "cookie-parser";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: ['http://localhost:3000', 'http://localhost:5173'],
}));

app.use('/', routerIndex);
app.use('/dosen', routerDosen);
app.use('/mhs', routerMhs);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});