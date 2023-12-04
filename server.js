/********************************************************************************
* WEB322 – Assignment 6
* 
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* 
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
* Name: Yoojin Lee     Student ID: 188162218     Date: December, 3, 2023
*
* URL: https://confused-blue-sweatshirt.cyclic.app/
********************************************************************************/
const legoData = require("./modules/legoSets");
const path = require("path");
const clientSessions = require('client-sessions');
const authData = require('./modules/auth-service');
const express = require('express');
const app = express();
const HTTP_PORT = process.env.PORT || 8080;
// middleware for parsing URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  clientSessions({
    cookieName: 'session',
    secret: 'o6LjQ5EVNC28ZgK64hDELM18ScpFQr',
    duration: 24 * 60 * 60 * 1000, // Session duration - 1 day
    activeDuration: 1000 * 60 * 5, // Active session extension - 5 minutes
  })
);

// Middleware to ensure user is logged in
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
}
// Middleware to make session available in all views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render("home")
});

app.get('/about', (req, res) => {
  res.render("about");
});
// Login page
app.get('/login', (req, res) => {
  res.render('login', { errorMessage: null });
});
// POST /login
app.post('/login', (req, res) => {
  req.body.userAgent = req.get('User-Agent');
  authData.checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory
      };
      res.redirect('/lego/sets');
    })
    .catch(err => {
      res.render('login', { errorMessage: err, userName: req.body.userName });
    });
});

// Registration page
app.get('/register', (req, res) => {
  res.render('register', { errorMessage: null });
});
// POST /register
app.post('/register', (req, res) => {
  authData.registerUser(req.body)
    .then(() => {
      res.render('register', { successMessage: "User created" });
    })
    .catch(err => {
      res.render('register', { errorMessage: err, userName: req.body.userName });
    });
});

// GET /logout
app.get('/logout', (req, res) => {
  req.session.reset();
  res.redirect('/');
});

// GET /userHistory
app.get('/userHistory', ensureLogin, (req, res) => {
  res.render('userHistory');
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
// Route for adding a new LEGO set (protected)
app.get('/lego/addSet', ensureLogin, (req, res) => {
  legoData
    .getAllThemes()
    .then((themes) => res.render('addSet', { themes }))
    .catch((err) => res.status(500).render('500', { message: err.message }));
});

// Submitting a new LEGO set (protected)
app.post('/lego/addSet', ensureLogin, (req, res) => {
  legoData
    .addSet(req.body)
    .then(() => res.redirect('/lego/sets'))
    .catch((err) => res.status(500).render('500', { message: err.message }));
});
// Editing an existing LEGO set (protected)
app.get('/lego/editSet/:num', ensureLogin, async (req, res) => {
  try {
    const setData = await legoData.getSetByNum(req.params.num);
    const themes = await legoData.getAllThemes();
    res.render('editSet', { themes, set: setData });
  } catch (err) {
    res.status(404).render('404', { message: err.message });
  }
});
// Submitting an edited LEGO set (protected)
app.post('/lego/editSet', ensureLogin, async (req, res) => {
  try {
    await legoData.editSet(req.body.set_num, req.body);
    res.redirect('/lego/sets');
  } catch (err) {
    res.render('500', {
      message: `I'm sorry, but we have encountered the following error: ${err}`,
    });
  }
});
// Deleting a LEGO set (protected)
app.get('/lego/deleteSet/:num', ensureLogin, (req, res) => {
  legoData
    .deleteSet(req.params.num)
    .then(() => res.redirect('/lego/sets'))
    .catch((err) =>
      res.render('500', {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
      })
    );
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

// Initialize data modules
legoData.initialize()
  .then(authData.initialize) // Initialize authData
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`Server is running at http://localhost:${HTTP_PORT}`);
    });
  })
  .catch((error) => {
    console.error('Initialization failed:', error);
  });