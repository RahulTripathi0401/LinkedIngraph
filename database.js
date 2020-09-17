const sqlite3 = require("sqlite3").verbose();


const edges =  new Promise(async (resolve, reject) => {
  let db = new sqlite3.Database("./test.db");
  db.all(`select user_profile, mutual_connection from connections`, [], (err, rows) => {
    if (err) {
      throw err;
    }
    let temp = [];
    rows.forEach((row) => {
      temp.push({
        from: row.user_profile,
        to: row.mutual_connection,
        physics: true,
        smooth: { type: "cubicBezier" },
      });
    });
    resolve(temp);
  });
});

const nodes = new Promise(async (resolve, reject) => {
  let db = new sqlite3.Database("./test.db");
  db.all(`select profile_url from users`, [], (err, rows) => {
    if (err) {
      throw err;
    }
    let temp = [];
    rows.forEach((row) => {
      temp.push({
        id: row.profile_url,
        size: 500,
        label: row.profile_url,
      });
    });
    resolve(temp);
  });
});

exports.edges = edges;
exports.nodes = nodes;
