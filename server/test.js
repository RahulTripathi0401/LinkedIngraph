import sqlite3 from "sqlite3";

// let db = new sqlite3.Database("../database/test.db");
// const sql = `select a.user_profile, a.mutual_connection from connections a join keywords k on k.profile_url = a.user_profile where k.keyword = 'test'`;
// db.all(sql, [], (err, rows) => {
//   if (err) {
//     throw err;
//   }
//   let temp = [];
//   rows.forEach((row) => {
//     temp.push({
//       from: row.user_profile,
//       to: row.mutual_connection,
//       physics: true,
//       smooth: { type: "cubicBezier" },
//     });
//   });
//   console.log(temp);
// });
