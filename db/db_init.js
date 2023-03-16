// (Re)Sets up the database, including a little bit of sample data
const db = require("./db_connection");

/**** Delete *CONTENTS OF* existing table (but not table itself) ****/

const delete_stuff_table_sql = "DELETE FROM stuff;"

db.execute(delete_stuff_table_sql);

/**** Create some sample items ****/

const insert_stuff_table_sql = `
    INSERT INTO stuff 
        (assignment_name, assignment_class, assignment_date, assignment_description, user_id) 
    VALUES 
        (?, ?, ?, ?, ?);
`
db.execute(insert_stuff_table_sql, ['Assignment 1', 'AP Comp Sci', '2023-01-31', 'idk1', 'dhyansankar007@gmail.com']);

db.execute(insert_stuff_table_sql, ['Assignment 2', 'AP Comp Sci', '2023-01-31', 'idk2', 'dhyansankar007@gmail.com']);

db.execute(insert_stuff_table_sql, ['Assignment 3', 'AP Comp Sci', '2023-01-31', 'idk3', 'dhyansankar007@gmail.com']);

db.execute(insert_stuff_table_sql, ['Assignment 4', 'AP Comp Sci', '2023-01-31', 'idk4', 'dhysan25@bergen.org']);


/**** Read the sample items inserted ****/

const read_stuff_table_sql = "SELECT * FROM stuff";

db.execute(read_stuff_table_sql, 
    (error, results) => {
        if (error) 
            throw error;

        console.log("Table 'stuff' initialized with:")
        console.log(results);
    }
);

db.end();