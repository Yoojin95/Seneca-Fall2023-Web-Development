/********************************************************************************
* WEB322 – Assignment 04
* 
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* 
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
* Name: Yoojin Lee     Student ID: 188162218     Date: November, 3, 2023
*
********************************************************************************/
const express = require('express');
const path = require("path");

const legoData = require('./modules/legoSets');

const app = express();

const PORT = process.env.PORT || 8080;

// set EJS engine
app.set('view engine', 'ejs');
app.use(express.static('public'));

    
// Home Route
app.get('/', (req, res) => {
    res.render("home");
});

// About Route
app.get('/about', (req, res) => {
    res.render("about");
});


app.get('/lego/sets', (req, res) => {
    if (req.query.theme) {
        legoData.getSetsByTheme(req.query.theme)
            .then(sets => res.render("sets", { sets }))
            .catch(error => res.status(404).render('404', { message: "No Sets found for a matching theme" }));
    } else {
        legoData.getAllSets()
            .then(sets => res.render("sets", { sets }))
            .catch(error => res.status(404).render('404', { message: "I'm sorry, we're unable to find what you're looking for" }));
    }
});


app.get('/lego/sets/:set_num', (req, res) => {
    legoData.getSetByNum(req.params.set_num)
    .then(set => res.render("set", { set }))
    .catch(error => res.status(404).render('404', { message: "No Sets found for a specific set num" }));
});


app.use((req, res) => {
    res.status(404).render('404', { message: "No view matched for a specific route" });
});


legoData
  .initialize()
  .then(() => app.listen(PORT, () => console.log(`listening on port ${PORT}`)))
  .catch((error) => console.log(`Failed to listen on port ${PORT}`));