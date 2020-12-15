import express from "express";
import path from "path";
import cors from "cors";
import { edges, nodes, existing_graphs } from "./database.js";
import { data } from "./query.js";
import dotenv from "dotenv";

const app = express();
const __dirname = path.resolve();

app.use(cors());
app.use(express.json());
app.use(express.static("html"));
dotenv.config();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/html/index.html"));
});

app.use(
  "/scripts",
  express.static(__dirname + "/node_modules/vis-network/dist/")
);

app.get("/existing_graphs", async (req, res) => {

  try {
    let keywords = await existing_graphs();
    console.log(keywords);
    res.json({keywords : keywords});
  } catch (e) {
    // res.status(400);
    res.send(e);
  }
});

app.post("/connections", async (req, res) => {
  try {
    let url = req.body.url;
    console.log(url);
    let info = await edges(url);
    res.json({ data: info });
  } catch (e) {
    res.status(400);
    res.send(e);
  }
});

app.post("/nodes", async (req, res) => {
  try {
    let url = req.body.url;
    const info = await nodes(url);
    res.json({ data: info });
  } catch (e) {
    res.status(400);
    res.send(e);
  }
});

app.post("/launch", async (request, response) => {
  try {
    const cookies = request.body.cookie;
    const url = request.body.url;
    console.log(cookies);
    console.log(url);
    await data(url, cookies);
    response.json({ test: "Scrape Finished" });
  } catch (e) {
    console.log(e);
    response.status(400);
    response.json({ error: e });
  }
});

app.listen(process.env.port, () => {
  console.log(`Example app listening at http://localhost:${process.env.port}`);
});
