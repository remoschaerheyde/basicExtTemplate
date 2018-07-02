const express = require('express');
const router = express.Router();
const pg = require('pg');
const poolConfig = require('./dbConfig').poolConfig;
const dbTable = require('./dbConfig').dbTable;

// UPDATE MODEL
router.post('/comments/get_all', (req,res) => {
    let pool = new pg.Pool(poolConfig)

    let commentsInQlikTable = JSON.parse(req.body.comments)
    try {
    pool.connect((connErr,db) => {
        if(connErr) {
            return console.log(connErr)
        } else {
            console.log('connected to pool')
            let commentsFound = [];
                db.query(`SELECT dimkey,comment from ${dbTable}`, (queryErr, table) => {
                    if(queryErr) {
                        res.status(400).send(queryErr)
                    } else {
                        let dbRows = table.rows   
                        commentsInQlikTable.forEach(tableRow => {
                            dbRows.forEach(dbRow => {
                                if(dbRow.dimkey === tableRow.tableRowKey) {
                                    commentsFound.push({tableRowIndex: tableRow.tableRowIndex, comment: dbRow.comment}
                                    )
                                };
                            });
                        });            
                        res.setHeader('Content-Type', 'application/json');
                        res.status(200).send(JSON.stringify(commentsFound))
                         db.end();
                    };
            })
        }
    })
    } catch(err) {
        console.log(err)
    }
})

// ADDING / UPDATING COMMENTS
router.post('/comments/add_new_comment', (req,res) => {

    let pool = new pg.Pool(poolConfig);
    let newComment = JSON.parse(req.body.newComment);

    try {
    pool.connect((connErr,db,done) => {
        if(connErr) {
            return console.log(connErr)
        } else {
            console.log('connected to pool')
                db.query(`SELECT * FROM ${dbTable} WHERE dimkey = $1`, [newComment.dimKey] ,(queryErr, table) => {
                    if(queryErr) {
                        res.status(400).send(queryErr)
                    } else {
                        // CREATE A NEW COMMENT IF NO COMMEMNT WITH DIMKEY EXISTS IN DB
                        if(table.rows.length === 0) {
                            // comment does not alreay exist in db
                            console.log(`no comment with key ${newComment.dimKey} found `)

                            db.query(`INSERT INTO ${dbTable}(dimkey, comment, last_author, last_update, extension_id, used_dimensions) VALUES($1,$2,$3,$4,$5,$6)`, [newComment.dimKey, newComment.comment, newComment.author, newComment.dateTime, newComment.extensionId, newComment.usedDimensions], (queryErr,table) => {
                                if(queryErr) {
                                    res.status(400).send(queryErr)
                                } else {
                                    res.status(200).send({message: 'comment successfully added to db'})
                                    db.end();
                                }
                            })
                        } else {
                            db.query(`UPDATE ${dbTable} SET comment=$1, last_author=$2, last_update=$3 WHERE dimkey=$4`, [newComment.comment, newComment.author, newComment.dateTime, newComment.dimKey],(queryErr,table) => {
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
router.post('/comments/delete_comment', (req,res) => {

    let pool = new pg.Pool(poolConfig)
    let dimKey = JSON.parse(req.body.dimKey)

    try {
    pool.connect((connErr,db,done) => {
        if(connErr) {
            return console.log(connErr)
        } else {
            console.log('connected to pool')
         
                // check if comment really exists in db
                db.query(`SELECT * FROM ${dbTable} WHERE dimkey = $1`, [dimKey] ,(queryErr, table) => {
                    if(queryErr) {
                        res.status(400).send(queryErr)
                    } else {
                        if(table.rows.length === 0) {
                            console.log('no comments found, cannot delete a comment that does not exist')
                        } else {
                            console.log('comment found, deleting comment')
                            db.query(`DELETE FROM ${dbTable} WHERE dimkey = $1`,[dimKey],(queryErr, table) => {
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


module.exports = router;