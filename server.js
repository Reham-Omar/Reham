'use strict';
require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT || 3000;
const pg = require('pg');
const app = express();
const superagent = require('superagent');
const methodOverride = require('method-override'); // delete / update 

app.use(express.static('./public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', (err) => {
    console.log(err);
})
// routs
app.get('/', renderHome);
app.get('/family', renderFamily);
app.get('/search', renderSearch);
app.post('/books', renderBooks);
app.post('/addToDB', addtoData);
app.delete('/delete/:id', deleteBook);
app.post('/view/:id', details);
app.put('/update/:id', update);
// app.post('/books', renderBooks);
// app.put('/books', renderBooks);
// app.delete('/books', renderBooks);



// functions
function renderHome(req, res) {
    const sql = 'SELECT * FROM books ;';
    client.query(sql)
        .then((result) => {
            // console.log('aaaaaaaaaaaaaaaa',refsult);
            res.render('index', { books: result.rows });

        })
}

function renderFamily(req, res) {
    let family = { key: ['omar', 'alia', 'reham', 'eman', 'osama', 'monther', 'ahmad', 'mohannad'] };
    res.render('familyPage', { familymem: family });
}
function renderSearch(req, res) {
    res.render('search');
}
function renderBooks(req, res) {
    let url = `https://www.googleapis.com/books/v1/volumes?q=${req.body.search}`;
    console.log('yyyyyyy', url);
    superagent.get(url)
        .then(data => {
            let results = data.body.items.map(val => {
                // console.log('lllllllllllll',books);
                return new Books(val);
            })
            res.render('animalBook', { book: results });

        })

}

function Books(value) {
    this.kind = value.kind;
    this.selfLink = value.selfLink;
    this.title = value.volumeInfo.title;
    this.authors = value.volumeInfo.authors;
    this.type = value.volumeInfo.industryIdentifiers[0].type;
}


function addtoData(req, res) {

    const sql1='SELECT * FROM books WHERE title=$1;';
    const val=[req.body.title];
    client.query(sql1,val)
    .then((data)=>{
        // console.log('wwwwwwwwwwwwww',data.rows);
        if(data.rows.length !==0){
            res.redirect('/');
        }
        else{
            let { kind, selfLink, title, authors, type } = req.body;
            const sql = 'INSERT INTO books (kind,selfLink,title,authors,type) VALUES ($1,$2,$3,$4,$5);';
            let saveValues = [kind, selfLink, title, authors, type];
            // console.log(saveValues)
            client.query(sql, saveValues)
                .then((result) => {
                    // console.log('reeeeeeeeeeeeeeeeeeeeeeeeeeee',result);
                    res.redirect('/');
                })
        }
    })
    // console.log(req.body);
   
}
function deleteBook(req, res) {
    const sql = 'DELETE FROM books WHERE id=$1';
    let value = [req.params.id];
    client.query(sql, value)
        .then(() => {
            res.redirect('/');
        })

}

function details(req, res) {
    const sql = 'SELECT * FROM books WHERE id=$1;';
    let val = [req.params.id];
    client.query(sql, val)
        .then(data => {
            // console.log('rrrrrrrrrrrrr',data);
            res.render('details', { details: data.rows })
        })
}

function update(req, res) {
    let {kind,selfLink,title,authors,type}=req.body;
    const sql = 'UPDATE books SET kind=$1,selfLink=$2,title=$3,authors=$4,type=$5 WHERE id=$6;';
    let saveValues=[kind,selfLink,title,authors,type,req.params.id];
    client.query(sql ,saveValues)
    .then(()=>{
        res.redirect('/')
    })

}

app.get('*', (req, res) => {
    res.status(404).send('this rout does not exist !!');
});

client.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`listening to port ${PORT}`);
        });

    });
