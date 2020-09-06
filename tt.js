// const sqlite3 = require("sqlite3").verbose();

// let db = new sqlite3.Database("./test.db", (err) => {
//   if (err) {
//     return console.error(err.message);
//   }
//   console.log("Connected to the in-memory SQlite database.");
// });

// async function node() {
//   let nodes = [];
//   return new Promise((resolve, reject) => {
//     db.all(`select profile_url from users`, [], (err, rows) => {
//       if (err) {
//         throw err;
//       }
//       rows.forEach((row) => {
//         nodes.push({ 'id': row.profile_url, 'size': 150, 'label': row.profile_url });
//       });
//       resolve(nodes);
//     });
//   });
// }

// async function connections() {
//   let connections = [];
//   return new Promise((resolve, reject) => {
//     db.all(
//       `select user_profile, mutual_connection from connections`,
//       [],
//       (err, rows) => {
//         if (err) {
//           throw err;
//         }
//         rows.forEach((row) => {
//           connections.push({
//             from: row.user_profile,
//             to: row.mutual_connection,
//             physics: false,
//             smooth: { type: "cubicBezier" },
//           });
//           console.log();
//         });
//         resolve(connections);
//       }
//     );
//   });
// }

// async function main() {
//   const nodes = await node();
//   const edges = await connections();
//   console.log(edges);
// }

// main();

const options = {
  manipulation: false,
  height: "90%",
  layout: {
    hierarchical: {
      enabled: true,
      levelSeparation: 300,
    },
  },
  physics: {
    hierarchicalRepulsion: {
      nodeDistance: 300,
    },
  },
};

const nodes = [
  {
    'id': "https://www.linkedin.com/in/alexandraschiller/",
    'size': 150,
    'label': "https://www.linkedin.com/in/alexandraschiller/",
  },
  {
    'id': "https://www.linkedin.com/in/amanda-jenkins1459/",
    'size': 150,
    'label': "https://www.linkedin.com/in/amanda-jenkins1459/",
  },
  {
    'id': "https://www.linkedin.com/in/brenda-dalheim-4175b957/",
    'size': 150,
    'label': "https://www.linkedin.com/in/brenda-dalheim-4175b957/",
  },
  {
    'id': "https://www.linkedin.com/in/hannah-lynar-97662b9b/",
    'size': 150,
    'label': "https://www.linkedin.com/in/hannah-lynar-97662b9b/",
  },
  {
    'id': "https://www.linkedin.com/in/robyn-mckenzie-85956848/",
    'size': 150,
    'label': "https://www.linkedin.com/in/robyn-mckenzie-85956848/",
  },
  {
    'id': "https://www.linkedin.com/in/shonapoulten/",
    'size': 150,
    'label': "https://www.linkedin.com/in/shonapoulten/",
  },
  {
    'id' : 'https://www.linkedin.com/in/anshuljain32/',    
    'size': 150,
    'label': "https://www.linkedin.com/in/anshuljain32/",
  }
];

const edges = [
  {
    from: "https://www.linkedin.com/in/shonapoulten/",
    to: "https://www.linkedin.com/in/anshuljain32/",
    physics: false,
    smooth: { type: "cubicBezier" },
  },
];
