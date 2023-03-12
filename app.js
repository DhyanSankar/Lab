//set up the server
const express = require( "express" );
const logger = require("morgan");
const db = require('./db/db_pool');
const helmet = require("helmet"); //add this
const app = express();
const port = process.env.PORT || 8080;

//Configure Express to use certain HTTP headers for security
//Explicitly set the CSP to allow certain sources
app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'cdnjs.cloudflare.com']
      }
    }
  })); 

// Configure Express to use EJS
app.set( "views",  __dirname + "/views");
app.set( "view engine", "ejs" );
// // Configure Express to parse incoming JSON data
// app.use( express.json() );
// Configure Express to parse URL-encoded POST request bodies (traditional forms)
app.use( express.urlencoded({ extended: false }) );

// define middleware that logs all incoming requests
app.use(logger("dev"));

// define middleware that serves static resources in the public directory
app.use(express.static(__dirname + '/public'));

// define a route for the default home page
app.get( "/", ( req, res ) => {
    res.render('index');
} );

// define a route for the stuff inventory page
const read_stuff_all_sql = `
    SELECT 
        assignment_id, assignment_name, assignment_class, assignment_date
    FROM
        stuff
`
app.get( "/stuff", ( req, res ) => {
    db.execute(read_stuff_all_sql, (error, results) => {
        if (error)
            res.status(500).send(error); //Internal Server Error
        else {
            res.render('stuff', { inventory : results });
        }
    });
} );

// define a route for the item detail page
const read_stuff_item_sql = `
    SELECT 
        assignment_id, assignment_name, assignment_class, assignment_date, assignment_description 
    FROM
        stuff
    WHERE
        assignment_id = ?
`
app.get( "/stuff/item/:assignment_id", ( req, res ) => {
    db.execute(read_stuff_item_sql, [req.params.assignment_id], (error, results) => {
        if (error)
            res.status(500).send(error); //Internal Server Error
        else if (results.length == 0)
            res.status(404).send(`No item found with assignment_id = "${req.params.assignment_id}"` ); // NOT FOUND
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
`
app.get("/stuff/item/:assignment_id/delete", ( req, res ) => {
    db.execute(delete_item_sql, [req.params.assignment_id], (error, results) => {
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
        assignment_date = ?
        assignment_description = ?
    WHERE
        assignment_id = ?
`
app.post("/stuff/item/:assignment_id", ( req, res ) => {
    db.execute(update_item_sql, [req.body.assignment_name, req.body.assignment_class, req.body.assignment_date, req.body.assignment_description, req.params.assignment_id], (error, results) => {
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
        (assignment_name, assignment_class, assignment_date, assignment_description)
    VALUES
        (?, ?, ?, ?)
`
app.post("/stuff", ( req, res ) => {
    db.execute(create_item_sql, [req.body.assignment_name, req.body.assignment_class, req.body.assignment_date, req.body.assignment_description], (error, results) => {
        if (error)
            res.status(500).send(error); //Internal Server Error
        else {
            //results.insertId has the primary key (id) of the newly inserted element.
            res.redirect(`/stuff/item/${results.insertId}`);
        }
    });
})

// start the server
app.listen( port, () => {
    console.log(`App server listening on ${ port }. (Go to http://localhost:${ port })` );
} );