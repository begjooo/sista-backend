import express from "express";
import { router as routerIndex } from "./routers/index.js";

const app = express();
const port = process.env.PORT || 3000;

app.use('/', routerIndex);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});