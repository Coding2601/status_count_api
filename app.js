// Input uid itself in URL, format --> http://localhost:8080/status_count/<YOUR_UID>

const express = require("express");
const app = express();
const sql = require("mysql");

const con = sql.createConnection({host: "localhost", user: "root", password: "<YOUR_PASSWORD>", database: "<YOUR_DATABASE_ NAME>"});

con.connect((err)=>{
	if(err) throw err;
	console.log("connected");
});

app.listen(8080, ()=>{
	console.log("Listening to port 8080...");
});

app.post("/status_count/:uid", async (req, res) =>{
	const x = req.param("uid");                     
	const check = new Promise((resolve, reject)=>{          // Checking wheather enter "UID" is present in database or not
		con.query(`SELECT * FROM users WHERE uid = ${x}`, (err, data)=>{
			if(err){
				reject(err);
				return;
			}
			resolve(data);
		});
	});
	check.then((flag)=>{
		if(flag.length !== 0){
			const promise = new Promise((resolve, reject) => {
				con.query(`SELECT COUNT(candidates.uid) AS TotalCandidates,
						COUNT(IF(candidate_status.status = 'joined', 1, NULL)) AS Joined,
		  				COUNT(IF(candidate_status.status = 'interview', 1, NULL)) AS Interview FROM users
						JOIN candidates ON users.uid = candidates.uid
						LEFT JOIN candidate_status ON candidates.cid = candidate_status.cid WHERE users.uid = ${x};`,
						(err, data) => {
					if (err){
						reject(err);
						return;
					}
					resolve(data);
				});
			});
			promise.then((data) => {
		  		const obj = {
					Uid: parseInt(x),
					TotalCandidates: data[0].TotalCandidates,
					Joined: data[0].Joined,
					Interview: data[0].Interview
				}
				console.log(obj);
				res.send(obj);
		  	});
		}else{
			res.send(`A Primary User with this UID ${x} is not present in your DATABASE`);
		}
	});
});