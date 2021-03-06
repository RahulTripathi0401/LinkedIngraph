CREATE TABLE IF NOT EXISTS users (
    profile_url varchar(100) PRIMARY KEY NOT NULL,
    name varchar(60),
    commonConnections VARCHAR(300),
    location VARCHAR(200),
    companyID VARCHAR(20),
    degree VARCHAR(35),
    UNIQUE(profile_url)
);

CREATE TABLE IF NOT EXISTS connections (
    user_profile varchar(100), 
    mutual_connection varchar(100),
    degree varchar(35),
    FOREIGN KEY(user_profile) REFERENCES users(profile_url),
    UNIQUE(user_profile, mutual_connection)
);

CREATE TABLE IF NOT EXISTS keywords (
    keyword varchar(100) NOT NULL,
    profile_url varchar(100) NOT NULL,
    FOREIGN KEY (profile_url) REFERENCES users(profile_url),
    UNIQUE(keyword, profile_url)
);
