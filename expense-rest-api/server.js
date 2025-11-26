var express = require("express")
var cors = require('cors')
var db = require("./sqlitedb.js")
const multer = require('multer');

var app = express()
app.use(cors());

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var HTTP_PORT = 8000 
app.listen(HTTP_PORT, () => {
   console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});

app.get("/", (req, res, next) => {
    res.json({"message":"Ok"})
});

app.get("/api/expense", (req, res, next) => {
   var sql = "select * from expense"
   var params = []
   db.all(sql, params, (err, rows) => {
      if (err) {
         res.json({"sts_code": 302, "sts_message": "Error", "detailed_message": err.message, "data": null});
         return;
      }
      res.json({"sts_code": 200, "sts_message": "OK", "detailed_message": "get multi successful", "data":rows});
   });
});

/* Now, don't use function -app.get("/api/expense/:id", (req, res, next)- 
app.get("/api/expense/:id", (req, res, next) => {
   var sql = "select * from expense where id = ?"
   var params = [req.params.id]
   db.get(sql, params, (err, row) => {
      if (err) {
         //res.status(400).json({"error":err.message});
         res.json({"sts_code": 301, "sts_message": "Error", "detailed_message": err.message, "data": null});
         return;
      }
      res.json({"sts_code": 200, "sts_message": "OK", "detailed_message": "get successful", "data":row});
   });
});
*/

app.post("/api/expense-multi/", (req, res, next) => {
   var errors=[]
   var params=[]
   var inputQuery = ''
   
   if (req.body.length==0){
      errors.push("No item specified");
   }
   var data = req.body;
   var itemData = {};
   for (let i = 0; i < data.length; i++) {
      if(i==0){
         inputQuery += '(?,?,?,?,?,?)';
      }else{
         inputQuery += ', (?,?,?,?,?,?)';
      }
      
      params.push(data[i].item, data[i].amount, data[i].category, data[i].location, data[i].spendOn, data[i].createdOn);
   }

   var sql = 'INSERT INTO expense (item, amount, category, location, spendOn, createdOn) VALUES ' + inputQuery
   db.run(sql, params, function (err, result) {
      if (err){
         errorFlg = true
         res.json({"sts_code": 304, "sts_message": "Error", "detailed_message": err.message, "data": null});
         return;
      }
      itemData.id = this.lastID;
      res.json({"sts_code": 200, "sts_message": "OK", "detailed_message": "post multi successful", "data":data});
   });   
})

app.put("/api/expense/:id", (req, res, next) => {
   if (!req.body){
      errors.push("No item specified");
   }

   var data = {
      item : req.body.item,
      amount: req.body.amount,
      category: req.body.category,
      location : req.body.location,
      spendOn: req.body.spendOn
   }
   db.run(
      `UPDATE expense SET
         item = ?, 
         amount = ?,
         category = ?, 
         location = ?, 
         spendOn = ? 
         WHERE id = ?`,
            [data.item, data.amount, data.category, data.location,data.spendOn, req.params.id],
      function (err, result) {
         if (err){
            console.log(err);
            res.json({"sts_code": 305, "sts_message": "Error", "detailed_message": err.message, "data": null});
            return;
         }
         res.json({"sts_code": 200, "sts_message": "OK", "detailed_message": "update successful", "data":data});
   });
})

app.delete("/api/expense/:id", (req, res, next) => {
   db.run(
      'DELETE FROM expense WHERE id = ?',
      req.params.id,
      function (err, result) {
         if (err){
            res.json({"sts_code": 307, "sts_message": "Error", "detailed_message": err.message, "data": null});
            return;
         }
         res.json({"sts_code": 200, "sts_message": "OK", "detailed_message": "delete successful", "data":req.params.id});
   });
})

//upload files
const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, "uploads/")
   },
   filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname)
   },
})

const upload = multer({ storage: storage });
app.post('/api/upload', upload.single('photo'), (req, res) => {
   console.log(req.file)
   res.json({ message: 'File uploaded successfully!' });
});

app.use(function(req, res){
   res.status(404);
});