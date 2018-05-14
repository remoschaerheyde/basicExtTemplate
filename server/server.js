const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg')
const cors = require('cors')
const app = express();
const util = require('util');

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// cors middleware
app.use(cors())

app.get('/', (req,res) => {
    res.send('test')
})


app.get('/comments/retrieveAll', (req,res) => {

   
    const client = new Client({
        user: 'remo',
        host: 'localhost',
        database: 'remosDb',
        password: 'test',
        port: 5432,
    })
    
    client.connect().then(() => {
        console.log('db Connected');
    client.query("SELECT * FROM qscomments", (dbErr, dbRes) => {
        console.log('rows ------------>')
        res.send(dbRes.rows)
        client.end()
        });
    });
    
});



app.post('/comments/add', (req,res) => {

    let dimKey = req.body.comment.dimKey;
    let author = req.body.comment.author;
    let comment = req.body.comment.comment;
    let dateTime = req.body.comment._dateTime;
    let dimensions = req.body.comment.dimensions;

    const client = new Client({
        user: 'remo',
        host: 'localhost',
        database: 'remosDb',
        password: 'test',
        port: 5432,
    })
    
    client.connect().then(() => {
        console.log('db Connected')
        client.query('INSERT INTO qscomments(dimkey, author, comment, datetime, dimensions) VALUES($1,$2, $3, $4, $5)', [dimKey, author, comment, dateTime, dimensions], (dbErr, dbRes, dimensions) => {
        console.log('Comment Added')
        client.end()
        res.sendStatus(200)
        })
    })

})


// clear db

app.get('/comments/clearDb', (req,res) => {

    const client = new Client({
        user: 'remo',
        host: 'localhost',
        database: 'remosDb',
        password: 'test',
        port: 5432,
    })
    
    client.connect().then(() => {
        console.log('db Connected');
    client.query("truncate qscomments", (dbErr, dbRes) => {
        console.log('rows ------------>')
        console.log(dbRes)
        client.end()
        res.sendStatus(200)
        });
    });

});


app.post('/comments/addCommentsToCube', (req,res) => {

    let matrix = req.body.matrix
    let commentSeparator = req.body.commentSeparator
    lookupArr = [];
    compArr = [];

    matrix.forEach((row, matrixIndex) => {
        let keyArray = []
        row.forEach(cell => {
            keyArray.push(cell.qText)
        })
        compArr.push({matrixIndex: matrixIndex, dimKey: keyArray.join(commentSeparator)})
        lookupArr.push(`\'${keyArray.join(commentSeparator)}\'`)
    });
    
    let clientFieldList =  lookupArr.join(',')
    

    const client = new Client({
        user: 'remo',
        host: 'localhost',
        database: 'remosDb',
        password: 'test',
        port: 5432,
    })

    client.connect().then(() => {
    client.query(`SELECT dimkey, comment FROM qscomments WHERE dimkey in(${clientFieldList})`, (dbErr, dbRes) => {
        
        compArr.forEach(row => {

            dbRes.rows.forEach(dbRow => {
              //  console.log(row.dimKey + ' | ' + dbRow.dimkey)
                

                if(row.dimKey.trim() == dbRow.dimkey.trim()) {
                    console.log(row.matrixIndex + ' ' + dbRow.comment) 

                    matrix[row.matrixIndex].push({qText: dbRow.comment})


                } else {
                    matrix[row.matrixIndex].push({qText: ''})
                }
              
            })
        })
        res.send(matrix)

        client.end()
        });
    }); 
});






app.listen(3000, () => {
    console.log('server running on port 3000')
})