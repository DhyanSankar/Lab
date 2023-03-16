//set up the server
const express = require("express");
const logger = require("morgan");
const db = require('./db/db_pool');
const helmet = require("helmet");
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');
const app = express();
const port = process.env.PORT || 8080;
const dotenv = require('dotenv');
dotenv.config();

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL
};
  
// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

//Configure Express to use certain HTTP headers for security
//Explicitly set the CSP to allow certain sources
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "cdnjs.cloudflare.com"]
        }
    }
}));

// Configure Express to use EJS
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
// // Configure Express to parse incoming JSON data
// app.use( express.json() );
// Configure Express to parse URL-encoded POST request bodies (traditional forms)
app.use(express.urlencoded({ extended: false }));

// define middleware that logs all incoming requests
app.use(logger("dev"));

// define middleware that serves static resources in the public directory
app.use(express.static(__dirname + '/public'));

app.use((req, res, next) => {
    res.locals.isLoggedIn = req.oidc.isAuthenticated();
    res.locals.user = req.oidc.user;
    next();
})

// req.isAuthenticated is provided from the auth router
app.get('/authtest', (req, res) => {
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});


// define a route for the default home page
app.get("/", (req, res) => {
    res.render('index');
});

app.get('/profile', requiresAuth(), (req, res) => {
    res.send(JSON.stringify(req.oidc.user));
});

// define a route for the stuff inventory page
const read_stuff_all_sql = `
    SELECT 
        assignment_id, assignment_name, assignment_class, assignment_date
    FROM
        stuff
    WHERE 
        user_id = ?
`
app.get( "/stuff", requiresAuth(), ( req, res ) => {
    db.execute(read_stuff_all_sql, [req.oidc.user.email], (error, results) => {
        if (error)
            res.status(500).send(error); //Internal Server Error
        else {
            res.render('stuff', { inventory: results });
        }
    });
});

// define a route for the item detail page
const read_stuff_item_sql = `
    SELECT 
        assignment_id, assignment_name, assignment_class, assignment_date, assignment_description 
    FROM
        stuff
    WHERE
        assignment_id = ?
    AND
        user_id = ?
`
app.get( "/stuff/item/:assignment_id", requiresAuth(), ( req, res ) => {
    db.execute(read_stuff_item_sql, [req.params.assignment_id, req.oidc.user.email], (error, results) => {
        if (error)
            res.status(500).send(error); //Internal Server Error
        else if (results.length == 0)
            res.status(404).send(`No item found with assignment_id = "${req.params.assignment_id}"`); // NOT FOUND
        else {
            let data = results[0]; // results is still an array
            // data's object structure: 
            //  { assignment_id: ____, assignment_name: ___ , assignment_class:___ , assignment_description: ____ }
            res.render('item', data);
        }
    });
});

// define a route for item DELETE
const delete_item_sql = `
    DELETE 
    FROM
        stuff
    WHERE
        assignment_id = ?
    AND
        user_id = ?
`
app.get("/stuff/item/:assignment_id/delete", requiresAuth(), ( req, res ) => {
    db.execute(delete_item_sql, [req.params.assignment_id, req.oidc.user.email], (error, results) => {
        if (error)
            res.status(500).send(error); //Internal Server Error
        else {
            res.redirect("/stuff");
        }
    });
})

// define a route for item UPDATE
const update_item_sql = `
    UPDATE
        stuff
    SET
        assignment_name = ?,
        assignment_class = ?,
        assignment_date = ?,
        assignment_description = ?
    WHERE
        assignment_id = ? 
    AND
        user_id = ?
`
app.post("/stuff/item/:assignment_id", requiresAuth(), (req, res) => {
    db.execute(update_item_sql, [req.body.assignment_name, req.body.assignment_class, req.body.assignment_date, req.body.assignment_description, req.params.assignment_id, req.oidc.user.email], (error, results) => {
        if (error)
            res.status(500).send(error); //Internal Server Error
        else {
            res.redirect(`/stuff/item/${req.params.assignment_id}`);
        }
    });
})

// define a route for item CREATE
const create_item_sql = `
    INSERT INTO stuff
        (assignment_name, assignment_class, assignment_date, assignment_description, user_id)
    VALUES
        (?, ?, ?, ?, ?)
`
app.post("/stuff", requiresAuth(), (req, res) => {
    db.execute(create_item_sql, [req.body.assignment_name, req.body.assignment_class, req.body.assignment_date, req.body.assignment_description, req.oidc.user.email], (error, results) => {
        if (error)
            res.status(500).send(error); //Internal Server Error
        else {
            //results.insertId has the primary key (id) of the newly inserted element.
            res.redirect(`/stuff/item/${results.insertId}`);
        }
    });
})

// start the server
app.listen(port, () => {
    console.log(`App server listening on ${port}. (Go to http://localhost:${port})`);
});