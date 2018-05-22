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




// UPDATE MODEL
app.post('/api/comments/get_all', (req,res) => {


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
                  let searchIndices = sortedQlikComments.map(commment => commment.indexInDb).join(',')

                db.query(`SELECT id,comment FROM testcomment WHERE id IN(${searchIndices})`, (queryErr,table) => {
                    if(queryErr) {
                        res.status(400).send(queryErr);
                    } else {
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


// ADDING / UPDATING COMMENTS
app.post('/api/comments/add_new_comment', (req,res) => {

    let pool = new pg.Pool({
        port: 5432,
        user: 'remo',
        password: 'test',
        database: 'remosDb',
       // max: 10,
        host: 'localhost'
    })

    let newComment = JSON.parse(req.body.newComment)

    try {
    pool.connect((connErr,db,done) => {
        if(connErr) {
            return console.log(connErr)
        } else {
            console.log('connected to pool')
         
                db.query("SELECT * FROM testcomment WHERE dimkey = $1", [newComment.dimkey] ,(queryErr, table) => {
                    if(queryErr) {
                        res.status(400).send(queryErr)

                    } else {

                        // CREATE A NEW COMMENT IF NO COMMEMNT WITH DIMKEY EXISTS IN DB
                        if(table.rows.length === 0) {
                            // comment does not alreay exist in db
                            console.log(`no comment with key ${newComment.dimkey} found `)
                            db.query('INSERT INTO testcomment(dimkey, comment) VALUES($1,$2)', [newComment.dimkey, newComment.text], (queryErr,table) => {
                                if(queryErr) {
                                    res.status(400).send(queryErr)
                                } else {
                                    res.status(200).send({message: 'comment successfully added to db'})
                                    db.end();
                                }
                            })
                        } else {
                        // UPDATE EXISTING COMMENT IF COMMENT ALREADY EXISTS IN DB
                        let commentId = table.rows[0].id
                        db.query('UPDATE testcomment SET comment = $1  WHERE id = $2', [newComment.text, commentId], (queryErr,table) => {
                            if(queryErr) {
                                res.status(400).send(queryErr)
                            } else {
                                res.status(200).send({message: 'comment successfully updated'})
                                db.end();
                            }
                        })
                    }
                };
            });
        }
    });
} catch(err) {
    console.log(err)
}
})

// DELETE SELECTED COMMENT
app.post('/api/comments/delete_comment', (req,res) => {

    let pool = new pg.Pool({
        port: 5432,
        user: 'remo',
        password: 'test',
        database: 'remosDb',
       // max: 10,
        host: 'localhost'
    })

    let parsedComment = JSON.parse(req.body.comment)
    let dimKey = parsedComment.dimKey
    try {
    pool.connect((connErr,db,done) => {
        if(connErr) {
            return console.log(connErr)
        } else {
            console.log('connected to pool')
         
                // check if comment really exists in db
                db.query("SELECT * FROM testcomment WHERE dimkey = $1", [dimKey] ,(queryErr, table) => {
                    if(queryErr) {
                        res.status(400).send(queryErr)
                    } else {
                        if(table.rows.length === 0) {
                            console.log('no comments found, cannot delete a comment that does not exist')
                        } else {
                            console.log('comment found, deleting comment')
                            let dbId = table.rows[0].id
                            console.log(dbId)
                            db.query("DELETE FROM testcomment WHERE id = $1",[dbId],(queryErr, table) => {
                                if(queryErr) {
                                    res.status(400).send(queryErr)
                                } else {
                                    console.log('comment deleted')
                                    res.status(200).send({message: `Comment ${dimKey} sucessfully deleted`})
                            }
                        })
                    }
                }
            });
        }
    });
    } catch(err) {
    console.log(err)
    }
})






app.listen(PORT, () => console.log(`Server running on port ${PORT}`))