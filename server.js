const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
var cors = require("cors");
const info = require("./database");

app.use(cors());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/app.html"));
});

app.get("/connections/{keyword}", async (req, res) => {
  try {
    const data = await info.edges;
    res.json(JSON.stringify(data));
  } catch (e) {
    res.send(e);
  }
});

app.get("/nodes{keyword}", async (req, res) => {
  try {
    console.log(req.query);
    const data = await info.nodes;
    res.json(JSON.stringify(data));
  } catch (e) {
    res.send(e);
  }
});

app.post("/launch", async (req, res) => {});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
