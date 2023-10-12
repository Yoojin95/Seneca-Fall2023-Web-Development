/********************************************************************************
* WEB322 – Assignment 03
* 
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* 
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
* Name: Yoojin Lee     Student ID: 188162218     Date: October 12, 2023
*
********************************************************************************/
const express = require('express');
const legoData = require('./modules/legoSets');

const app = express();
const port = 3000;
app.use(express.static('public'));

legoData.initialize().then(() => {
    
    // Home Route
    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/views/home.html');
    });

    // About Route
    app.get('/about', (req, res) => {
        res.sendFile(__dirname + '/views/about.html');
    });

    // Lego Sets with optional Theme Parameter
    app.get('/lego/sets', (req, res) => {
        if (req.query.theme) {
            legoData.getSetsByTheme(req.query.theme)
                .then(sets => res.send(sets))
                .catch(error => res.status(404).sendFile(__dirname + '/views/404.html'));
        } else {
            legoData.getAllSets()
                .then(data => res.send(data))
                .catch(error => res.status(404).sendFile(__dirname + '/views/404.html'));
        }
    });

    // Lego Sets by Set Number
    app.get('/lego/sets/:set_num', (req, res) => {
        legoData.getSetByNum(req.params.set_num)
            .then(set => res.send(set))
            .catch(error => res.status(404).sendFile(__dirname + '/views/404.html'));
    });

    // Custom 404 Error
    app.use((req, res) => {
        res.status(404).sendFile(__dirname + '/views/404.html');
    });

    // Start the server
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });

}).catch(error => console.error('Initialization failed:', error));