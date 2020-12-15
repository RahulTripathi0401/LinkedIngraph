import sqlite3 from "sqlite3";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const edges = async function (searchParamter) {
  return new Promise(async (resolve, reject) => {
    let __dirname = path.resolve();
    let db = new sqlite3.Database(`${__dirname}/database/test.db`);
    console.log(searchParamter);
    const sql = `select a.user_profile, a.mutual_connection, a.degree from connections a join keywords k on k.profile_url = a.user_profile where k.keyword = '${searchParamter}'`;
    db.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }
      let temp = [];
      rows.forEach(async (row) => {
        let colour = await getDegree(row.degree);
        temp.push({
          from: row.user_profile,
          to: row.mutual_connection,
          physics: false,
          smooth: { type: "cubicBezier" },
          color : colour ,
        });
      });
      resolve(temp);
    });
  });
};

const nodes = async function (searchParamter) {
  return new Promise(async (resolve, reject) => {
    let __dirname = path.resolve();
    let db = new sqlite3.Database(`${__dirname}/database/test.db`);
    const sql = `select u.profile_url, u.degree, u.name, u.location from users u join keywords k on k.profile_url = u.profile_url where k.keyword = '${searchParamter}'`;
    db.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }
      let temp = [];
      rows.forEach(async (row) => {
        let colour = await getDegree(row.degree);
        temp.push({
          id: row.profile_url,
          font : {
            size : 30,
          },          
          label: `${row.profile_url}\n ${row.name} ${row.location}`,
          color : colour ,
        });
      });
      resolve(temp);
    });
  });
};

const existing_graphs = async function () {
  return new Promise(async (resolve, reject) => {
    let __dirname = path.resolve();
    let db = new sqlite3.Database(`${__dirname}/database/test.db`);
    const sql = `select distinct keyword from keywords`;
    db.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }
      resolve(rows);
    });
  });
};

async function getDegree(degree) {
  switch(degree) {
    case "1st":
      return "#6495ED"
    case "2nd":
      return "#FF4500";
    case "3rd":
      return "#90EE90";
    case "4th":
      return "#663399";
  }
  return "#FA8072";
}

export { nodes, edges, existing_graphs };
