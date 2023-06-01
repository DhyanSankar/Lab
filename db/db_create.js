const db = require("./db_connection");

/**** Drop existing tables, if any ****/

const drop_assignments_table_sql = "DROP TABLE IF EXISTS assignments;"

db.execute(drop_assignments_table_sql);

const drop_subjects_table_sql = "DROP TABLE IF EXISTS subjects;"

db.execute(drop_subjects_table_sql);

/**** Create tables ****/

const create_subjects_table_sql = `
    CREATE TABLE subjects (
        subject_id INT NOT NULL AUTO_INCREMENT,
        subject_name VARCHAR(45) NOT NULL,
        user_id VARCHAR(255) NULL,
        PRIMARY KEY (subject_id));
`
db.execute(create_subjects_table_sql);

const create_assignments_table_sql = `
    CREATE TABLE assignments (
        assignment_id INT NOT NULL AUTO_INCREMENT,
        assignment_name VARCHAR(45) NOT NULL,
        subject_id INT NOT NULL,
        assignment_date DATE NULL,
        assignment_description VARCHAR(150) NULL,
        user_id VARCHAR(255) NULL,
        PRIMARY KEY (assignment_id),
        INDEX assignmentSubject_idx (subject_id ASC),
        CONSTRAINT assignmentSubject
            FOREIGN KEY (subject_id)
            REFERENCES subjects (subject_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE);
`

db.execute(create_assignments_table_sql);

db.end();