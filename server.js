/********************************************************************************
* WEB322 – Assignment 5
* 
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* 
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
* Name: Yoojin Lee     Student ID: 188162218     Date: November, 19, 2023
*
* URL: 
********************************************************************************/
const legoData = require("./modules/legoSets");
const path = require("path");

const express = require('express');
const app = express();
// middleware for parsing URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render("home")
});

app.get('/about', (req, res) => {
  res.render("about");
});

app.get("/lego/sets", async (req,res)=>{

  let sets = [];

  try{    
    if(req.query.theme){
      sets = await legoData.getSetsByTheme(req.query.theme);
    }else{
      sets = await legoData.getAllSets();
    }

    res.render("sets", {sets})
  }catch(err){
    res.status(404).render("404", {message: err});
  }
  
});

app.get('/lego/sets/:set_num', (req, res) => {
  legoData.getSetByNum(req.params.set_num)
  .then(set => res.render("set", { set }))
  .catch(error => res.status(404).render('404', { message: "No Sets found for a specific set num" }));
});

// Add Lego Sets
// GET route for addSet
app.get("/lego/addSet", async (req, res) => {
  try {
    const themeData = await legoData.getAllThemes();
    res.render("addSet", { themes: themeData });
  } catch (err) {
    res.status(500).render("500", {
      message: `Error fetching themes: ${err.message}`,
    });
  }
});

// POST route for addSet
app.post("/lego/addSet", async (req, res) => {
  try {
    await legoData.addSet(req.body);
    res.redirect("/lego/sets");
  } catch (err) {
    res.render("500", {
      message: `I'm sorry, but we have encountered the following error: ${err.message}`,
    });
  }
});

// Edit Lego Sets
// GET "/lego/editSet/:num"
app.get('/lego/editSet/:num', async (req, res) => {
  try {
      const setNum = req.params.num;
      const set = await legoData.getSetByNum(setNum);
      const themes = await legoData.getAllThemes();
      res.render('editSet', { set: set, themes: themes });
  } catch (err) {
      res.status(404).render('404', { message: err.message });
  }
});

// POST "/lego/editSet"
app.post("/lego/editSet", (req, res) => {
  const set_num = req.body.set_num;
  const setData = req.body;

  legoData.editSet(set_num, setData)
    .then(() => res.redirect("/lego/sets"))
    .catch(err => 
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${err}`
      })
    );
});



// Delete Lego Sets
app.get('/lego/deleteSet/:num', async (req, res) => {
  legoData.deleteSet(req.params.num)
    .then(() => res.redirect("/lego/sets"))
    .catch((err) => res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` }));
});


app.use((req, res, next) => {
  res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
});

legoData.initialize().then(()=>{
  app.listen(HTTP_PORT, () => { console.log(`server listening on: ${HTTP_PORT}`) });
});