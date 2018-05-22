const express = require('express');
const bodyParser = require('body-parser');
const pg = require('pg')
const cors = require('cors')
const app = express();
const PORT = 5000;



// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// cors middleware
app.use(cors())

app.post('/', (req,res) => {

    let pool = new pg.Pool({
        port: 5432,
        user: 'remo',
        password: 'test',
        database: 'remosDb',
       // max: 10,
        host: 'localhost'
    })

    let commentsInQlikTable = JSON.parse(req.body.comments)

    try {
    pool.connect((connErr,db,done) => {
        if(connErr) {
            return console.log(connErr)
        } else {
            console.log('connected to pool')
            let commentsFound = [];

            new Promise((resolve,reject) => {
                db.query('SELECT id,dimkey from testcomment', (queryErr, table) => {
                    if(queryErr) {
                        res.status(400).send(queryErr)
                    } else {
                        let dbRows = table.rows
                
                        commentsInQlikTable.forEach(tableRow => {
                            dbRows.forEach(dbRow => {
                                if(dbRow.dimkey === tableRow.tableRowKey) {
                                    commentsFound.push({indexInDb: dbRow.id, tableRowIndex: tableRow.tableRowIndex})
                                    
                                };
                            });
                        });
                        resolve(commentsFound)
                        };
                });
            }).then(commentsFound => {
                
                function compare(a,b) {

                    let comparison = 0;
                    if (a.indexInDb > b.indexInDb) {
                      comparison = 1;
                    } else if (a.indexInDb < b.indexInDb) {
                      comparison = -1;
                    }
                    return comparison;
                  }
                  let sortedQlikComments = commentsFound.sort(compare);
                  console.log(sortedQlikComments)
                  let searchIndices = sortedQlikComments.map(commment => commment.indexInDb).join(',')

                
                db.query(`SELECT id,comment FROM testcomment WHERE id IN(${searchIndices})`, (queryErr,table) => {
                    if(queryErr) {
                        res.status(400).send(queryErr);
                    } else {
                        console.log('--------------')

                        let dbComments = table.rows
                         dbComments.forEach((comment, index) => {
                                 comment.tableRowIndex = sortedQlikComments[index].tableRowIndex
                        })
                        res.setHeader('Content-Type', 'application/json');
                        res.status(200).send(JSON.stringify(dbComments))
                         db.end();
                    }
                })
            }).catch(err => {
                console.log(err)
            })
        }
    })
} catch(err) {
    console.log(err)
}
    

})




app.listen(PORT, () => console.log(`Server running on port ${PORT}`))