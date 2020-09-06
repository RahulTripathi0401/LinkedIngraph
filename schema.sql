CREATE TABLE IF NOT EXISTS users (
    profile_url varchar(100) PRIMARY KEY NOT NULL,
    first_name varchar(30),
    last_name varchar(30),
    connection_degree varchar(10),
    UNIQUE(profile_url)
);


CREATE TABLE IF NOT EXISTS connections (
    user_profile varchar(100), 
    mutual_connection varchar(100),
    FOREIGN KEY(user_profile) REFERENCES users(profile_url)
);