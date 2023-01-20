//set up the server
const express = require( "express" );
const app = express();
const port = 8080;

// define a route for the default home page
app.get( "/", ( req, res ) => {
    res.send( "<h1>Hello world!</h1>" );
} );

// define a route for the stuff inventory page
app.get( "/stuff", ( req, res ) => {
    res.send( "<h1>This is the stuff inventory page.</h1>" );
} );

// define a route for the item detail page
app.get( "/stuff/item", ( req, res ) => {
    res.send( "<h1>This is the item detail page.</h1>" );
} );

// start the server
app.listen( port, () => {
    console.log(`App server listening on ${ port }. (Go to http://localhost:${ port })` );
} );