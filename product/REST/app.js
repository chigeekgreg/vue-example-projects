const express = require('express');
var cors = require('cors');
const axios = require('axios');
const mysql = require('mysql');
const config = require('./config.json');
var connLeg;
var connDB;

(function protectLeg() {
    connLeg = mysql.createConnection(config.legacy)
    connLeg.on('error', err => {
        if (err.code === 'PROTOCOL_CONNECTION_LOST' ||
            err.code === 'ECONNRESET') {
            console.log('Legacy connection lost, reopen connection')
            protectLeg()
        } else {
            throw err
        }
    })
})();

(function protectDB() {
    connDB = mysql.createConnection(config.db)
    connDB.on('error', err => {
        if (err.code === 'PROTOCOL_CONNECTION_LOST' ||
            err.code === 'ECONNRESET') {
            console.log('DB connection lost, reopen connection')
            protectDB()
        } else {
            throw err
        }
    })
})();

const app = express();
app.use(cors());
var port = process.env.PORT || 3000;

// process JSON data in request body
app.use(express.json());

app.get('/', (req, res) => {
    res.send(
        `<h2>REST backend for Product system</h2>
        <ul>
            <li> /getParts to get all parts from legacy DB</li>
            <li> /processCC to process a credit card transaction</li>
        </ul>`
    );
})

app.get('/getParts', (req, res) => {
    let stmt = 'SELECT * FROM parts'
    if (req.query.number !== undefined) {
        stmt += ` WHERE number = '${req.query.number}';`
    }
    // console.log(stmt)
    connLeg.query(stmt, function(err, rows){
        if (err) throw err;       
        connDB.query(`SELECT * FROM inventory;`, function(err, invs){
            if (err) throw err; 
            // console.log(invs)  
            for (part of rows) {
                let found = false
                for (inv of invs) {
                    if (inv["id"] == part.number) {
                        part.quantity = inv["quantity"]
                        found = true
                    }
                }
                if (!found) {
                    part.quantity = 0
                }
            }
            // console.log('rows: ', rows);
            res.send(rows);
            // connLeg.close();
        });    
        
    });
})

app.post('/processCC', (req, res) => {
    console.log(req.body);
    axios.post('http://blitz.cs.niu.edu/creditcard', req.body).then((response) => {
        res.send(response.data);
    }).catch(err => {
        throw err;
    });
})

app.get('/getOrders', (req, res) => {
    let stmt = 'SELECT * FROM orders'
    if (req.query.status !== undefined) {
        stmt += ` WHERE status = '${req.query.status}';`
    }
    // console.log(stmt)
    connDB.query(stmt, function(err, rows){
        if (err) throw err;
        // console.log('rows: ', rows);
        res.send(rows);
    });
})

app.get('/getOrder', (req, res) => {
    // console.log(req.query);
    connDB.query(`SELECT * FROM orders WHERE id = ${req.query.id};`, function(err, rows){
        if (err) throw err;       
        connDB.query(`SELECT * FROM orderitems WHERE orderid = ${req.query.id};`, function(err, items){
            if (err) throw err;
            // console.log('items: ', items);
            rows[0].items = items;
            // console.log('rows: ', rows);
            res.send(rows);
        });
    });
})

app.get('/closeOrder', (req, res) => {
    // console.log(req.query);
    connDB.query(`UPDATE orders SET status='filled' WHERE id = ${req.query.id};`, function(err, result){
        if (err) throw err;       
        res.send(result);
    });
})

app.post('/createOrder', (req, res) => {
    // console.log(req.body);
    connDB.query(
        `INSERT INTO orders (name, email, date, amount, weight, shipping, address) 
        VALUES ( '${req.body.name}','${req.body.email}','${req.body.date}',${req.body.amount},${req.body.weight},${req.body.shipping},'${req.body.address}');`,
        // SELECT LAST_INSERT_ID();`,
        function(err, result){
            if (err) throw err;
            // console.log("order created: " + result.insertId);
            for (part of req.body.items) {
                // console.log(part)
                connDB.query(
                    `INSERT INTO orderitems (orderid, partnumber, quantity)
                    VALUES (${result.insertId}, ${part.number}, ${part.quantity});`
                ),
                function(err, result) {
                    if (err) throw err;
                    // console.log("orderitem created: " + result.insertId);
                }
            }
            res.send({msg: `Order ${result.insertId} created`});
        }
    );
})

app.get('/setInventory', (req, res) => {
    // console.log(req.query);
    connDB.query(`UPDATE inventory SET quantity=${req.query.quantity} WHERE id = ${req.query.id};`, function(err, result){
        if (err) throw err; 
        // console.log(result) 
        if (result.affectedRows == 0) {
            connDB.query(`INSERT INTO inventory (id, quantity) VALUES (${req.query.id}, ${req.query.quantity});`, function(err, result){
                if (err) throw err; 
                // console.log(result)
                res.send(result); 
            });
        } else {   
            res.send(result); 
        }
    });
})

app.get('/getBrackets', (req, res) => {
    connDB.query('SELECT * FROM brackets', function(err, rows){
        if (err) throw err;
        // console.log('rows: ', rows);
        res.send(rows);
    });
})

app.post('/setBrackets', (req, res) => {
    // console.log(req.body);
    connDB.query('DELETE FROM brackets', function(err, rows) {
        if (err) throw err;
        // console.log(rows);
        if (req.body.length === 0) {
            res.send(rows);
            return;
        }
        var stmt = 'INSERT INTO brackets (weight, cost) VALUES'
        for (var row of req.body) {
            stmt += `(${row.weight}, ${row.cost}),`
        }
        stmt = stmt.replace(/,$/,';')
        // console.log(stmt);
        connDB.query(stmt, function(err, rows){
            if (err) throw err;
            // console.log('rows: ', rows);
            res.send(rows);
        });
    });
})

app.listen(port, () => {
    console.log(`Express server listening at ${port}`)
})