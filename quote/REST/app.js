const express = require('express');
var cors = require('cors');
const axios = require('axios');
const mysql = require('mysql')
const config = require('./config.json');
var connLeg;
var connAWS;

setInterval(() => {
    console.log('refreshing DB connections')
    connLeg.query("SELECT 1")
    connAWS.query("SELECT 1")
}, 60*60*1000);

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

(function protectAWS() {
    connAWS = mysql.createConnection(config.amazon)
    connAWS.on('error', err => {
        if (err.code === 'PROTOCOL_CONNECTION_LOST' ||
            err.code === 'ECONNRESET') {
            console.log('AWS connection lost, reopen connection')
            protectAWS()
        } else {
            throw err
        }
    })
})();

const app = express();
app.use(cors());
var port = process.env.PORT || 3001;

// process JSON data in request body
app.use(express.json());

app.get('/', (req, res) => {
    res.send(
        `<h2>REST backend for Quote system</h2>
        <ul>
            <li> /getCustomers to get all customers from legacy DB</li>
            <li> /processPO to process a purchase order</li>
        </ul>`
    );
})

app.get('/getCustomers', (req, res) => {
    let stmt = 'SELECT * FROM customers'
    if (req.query.id !== undefined) {
        stmt += ` WHERE id = '${req.query.id}';`
    }
    connLeg.query(stmt, function(err, rows){
        if (err) throw err;
        // console.log('rows: ', rows);
        res.send(rows);
    });
})

app.post('/processPO', (req, res) => {
    console.log(req.body);
    axios.post('http://blitz.cs.niu.edu/purchaseorder', req.body).then((response) => {
        res.send(response.data);
    }).catch(err => {
        throw err;
    });
})

app.post('/createAssociate', (req, res) => {
    // console.log(req.body);
    connAWS.query(
        `INSERT INTO associates (name, password) 
        VALUES ( '${req.body.name}','${req.body.password}');`,
        function(err, result){
            if (err) throw err;
            // console.log("associate created: " + result.insertId);
            res.send({msg: `Associate ${result.insertId} created`});
        })
})

app.post('/updateAssociate', (req, res) => {
    // console.log(req.body);
    connAWS.query(
        `UPDATE associates
        SET name = '${req.body.name}', password = '${req.body.password}', commission = '${req.body.commission}'
        WHERE id = ${req.body.id};`,
        function(err, result){
            if (err) throw err;
            // console.log("associate updated: " + result);
            res.send({msg: `Associate updated`});
        })
})

app.post('/deleteAssociate', (req, res) => {
    // console.log(req.body);
    connAWS.query(
        `DELETE FROM associates WHERE id=${req.body.id};`,
        function(err, result){
            if (err) throw err;
            // console.log(result);
            res.send({msg: `Associate deleted`});
        })
})

app.get('/getAssociates', (req, res) => {
    let stmt = 'SELECT * FROM associates'
    if (req.query.id !== undefined) {
        stmt += ` WHERE id = '${req.query.id}';`
    }
    if (req.query.name !== undefined) {
        stmt += ` WHERE name = '${req.query.name}';`
    }
    // console.log(stmt)
    connAWS.query(stmt, function(err, rows){
        if (err) throw err;
        // console.log('rows: ', rows);
        res.send(rows);
    });
})

app.get('/getQuotes', (req, res) => {
    let stmt = 'SELECT * FROM quotes'
    var where = ''
    if (req.query.id !== undefined) {
        where += `id = '${req.query.id}'`
    }
    if (req.query.status !== undefined) {
        where += ((where?' AND ':'') + `status = '${req.query.status}'`)
    }
    if (req.query.associateid !== undefined) {
        where += ((where?' AND ':'') + `associateid = '${req.query.associateid}'`)
    }
    if (where.length) {
        stmt += ` WHERE ${where};`
    }
    // console.log(stmt)
    connAWS.query(stmt, function(err, rows){
        if (err) throw err;
        // console.log('rows: ', rows);      
        res.send(rows);
    });
})

app.get('/getNotes', (req, res) => {
    let stmt = 'SELECT * FROM quotenotes'
    if (req.query.quoteid !== undefined) {
        stmt += ` WHERE quoteid = '${req.query.quoteid}';`
    }
    // console.log(stmt)
    connAWS.query(stmt, function(err, rows){
        if (err) throw err;
        // console.log('notes: ', rows);      
        res.send(rows);
    });
})

app.get('/getItems', (req, res) => {
    let stmt = 'SELECT * FROM quoteitems'
    if (req.query.quoteid !== undefined) {
        stmt += ` WHERE quoteid = '${req.query.quoteid}';`
    }
    // console.log(stmt)
    connAWS.query(stmt, function(err, rows){
        if (err) throw err;
        // console.log('items: ', rows);      
        res.send(rows);
    });
})

app.post('/createQuote', (req, res) => {
    // console.log(req.body);
    var quote = req.body;
    connAWS.query(
        `INSERT INTO quotes (date, associateid, custid, email, amount) 
        VALUES ( '${quote.date}','${quote.associateid}','${quote.custid}','${quote.email}','${quote.amount}');`,
        function(err, result){
            if (err) throw err;
            quote.id = result.insertId;
            // console.log("quote created: " + quote.id);
            res.send({msg: `Quote ${quote.id} created`});
            // insert items and notes
            for (item of quote.items) {
                connAWS.query(
                    `INSERT INTO quoteitems (quoteid, text, price)
                    VALUES(${quote.id}, '${item.text}', '${item.price}')`, (err, result) => {
                        if (err) throw err;
                        // console.log(result)
                    })
            }
            for (note of quote.notes) {
                connAWS.query(
                    `INSERT INTO quotenotes (quoteid, text)
                    VALUES(${quote.id}, '${note.text}')`, (err, result) => {
                        if (err) throw err;
                        // console.log(result)
                    })
            }
        })
})

app.post('/updateQuote', (req, res) => {
    // console.log(req.body);
    var quote = req.body;
    connAWS.query(
        `UPDATE quotes SET email = '${quote.email}', amount = '${quote.amount}', commission = '${quote.commission}', status = '${quote.status}'
         WHERE id=${quote.id};`, (err, result) => {
        if (err) throw err;  
        // console.log(result);
        res.send({msg: `Quote ${quote.id} updated`});
        connAWS.query(
            `DELETE FROM quoteitems WHERE quoteid=${quote.id};
             DELETE FROM quotenotes WHERE quoteid=${quote.id}`, (err, result) => {
            if (err) throw err;
            // console.log(result)
            // insert items and notes
            for (item of quote.items) {
                connAWS.query(
                    `INSERT INTO quoteitems (quoteid, text, price)
                    VALUES(${quote.id}, '${item.text}', '${item.price}')`, (err, result) => {
                        if (err) throw err;
                        // console.log(result)
                    })
            }
            for (note of quote.notes) {
                connAWS.query(
                    `INSERT INTO quotenotes (quoteid, text)
                    VALUES(${quote.id}, '${note.text}')`, (err, result) => {
                        if (err) throw err;
                        // console.log(result)
                    })
            }
        })
    })   
})

app.listen(port, () => {
    console.log(`Express server listening at ${port}`)
})
