const sqlite3 = require("sqlite3").verbose();

const edges = async function (searchParamter) {
  return new Promise(async (resolve, reject) => {
    let db = new sqlite3.Database("./test.db");
    const sql = `select a.user_profile, a.mutual_connection from connections a join keywords k on k.profile_url = a.user_profile where k.keyword = '${searchParamter}'`;
    db.all(sql, [], (err, rows) => {
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
};

const nodes = async function (searchParamter) {
  return new Promise(async (resolve, reject) => {
    let db = new sqlite3.Database("./test.db");
    const sql = `select u.profile_url from users u join keywords k on k.profile_url = u.profile_url where k.keyword = '${searchParamter}'`;
    db.all(sql, [], (err, rows) => {
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
};

exports.edges = edges;
exports.nodes = nodes;
