// (Re)Sets up the database, including a little bit of sample data
const db = require("./db_connection");

/**** Delete *CONTENTS OF* existing table (but not table itself) ****/

const delete_assignments_table_sql = "DELETE FROM assignments;"

db.execute(delete_assignments_table_sql);

const delete_subjects_table_sql = "DELETE FROM subjects;"

db.execute(delete_subjects_table_sql);

/**** Create some sample items ****/

const insert_subject_sql = `
    INSERT INTO subjects 
        (subject_id, subject_name, user_id) 
    VALUES 
        (?, ?, ?);
`

db.execute(insert_subject_sql, [1, 'Comp Sci', 'dhyansankar007@gmail.com']);

db.execute(insert_subject_sql, [2, 'American Lit', 'dhyansankar007@gmail.com']);

db.execute(insert_subject_sql, [3, 'Chemistry', 'dhysan35@bergen.org']);

const insert_assignment_table_sql = `
    INSERT INTO assignments 
        (assignment_name, subject_id, assignment_date, assignment_description, user_id) 
    VALUES 
        (?, ?, ?, ?, ?);
`
db.execute(insert_assignment_table_sql, ['Assignment 1', 1, '2023-01-31', 'idk1', 'dhyansankar007@gmail.com']);

db.execute(insert_assignment_table_sql, ['Assignment 2', 1, '2023-01-31', 'idk2', 'dhyansankar007@gmail.com']);

db.execute(insert_assignment_table_sql, ['Assignment 3', 2, '2023-01-31', 'idk3', 'dhyansankar007@gmail.com']);

db.execute(insert_assignment_table_sql, ['Assignment 4', 2, '2023-01-31', 'idk4', 'dhysan25@bergen.org']);

db.end();