'use strict';

import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';

/* --- Middlewares --- */

const __port = 3900;
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Views

app.set('views', join(__dirname, 'public/views'));
app.set('view engine', 'ejstrings');

// Routes

app.get('/', (req,res) => { res.status(200).render('index.ejs') } )

// Public

app.use(express.static(join(__dirname, 'public')));
app.use(express.static(join(__dirname, 'lib')));
app.use(express.static(join(__dirname, 'vendor')));
app.use(express.static(join(__dirname, 'dist')));


/* --- Server & DataBase connection --- */
app.listen(__port, '0.0.0.0', () => {
    console.log('The server is listening on port', __port);
});
app.on('error', (err) => {
    console.error(err);
});
