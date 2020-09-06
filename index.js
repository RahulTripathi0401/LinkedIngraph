const sqlite3 = require("sqlite3").verbose();

let db = new sqlite3.Database("./test.db", (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connected to the in-memory SQlite database.");
});

async function node() {
  let nodes = [];
  return new Promise((resolve, reject) => {
    db.all(`select profile_url from users`, [], (err, rows) => {
      if (err) {
        throw err;
      }
      rows.forEach((row) => {
        nodes.push({ id: row.profile_url, size: 150, label: row.profile_url });
      });
      resolve(nodes);
    });
  });
}

async function connections() {
  let connections = [];
  return new Promise((resolve, reject) => {
    db.all(
      `select user_profile, mutual_connection from connections`,
      [],
      (err, rows) => {
        if (err) {
          throw err;
        }
        rows.forEach((row) => {
          connections.push({
            from: row.user_profile,
            to: row.mutual_connection,
            physics: false,
            smooth: { type: "cubicBezier" },
          });
          console.log();
        });
        resolve(connections);
      }
    );
  });
}



async function main() {
  let test = await node();
  let another = await connections();
  nodes = test;
}

main();
