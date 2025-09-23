-- CREATE TABLE users (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     username VARCHAR(100) NOT NULL,
--     email VARCHAR(255) UNIQUE,
--     phone VARCHAR(20) NOT NULL,
--     password VARCHAR(255) NOT NULL,
--     otp VARCHAR(255),
--     otpExpires DATETIME,
--     createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );


CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) NOT NULL,        
    countryCode VARCHAR(5) NOT NULL,   
    dialCode VARCHAR(10) NOT NULL,     
    password VARCHAR(255) NOT NULL,
    otp VARCHAR(255),
    otpExpires DATETIME,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- templates table
CREATE TABLE IF NOT EXISTS templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    html TEXT,
    createdBy INT NOT NULL,         -- references users.id
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
);

-- email_logs table
CREATE TABLE IF NOT EXISTS email_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    toEmail VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    userId INT,                     -- references users.id
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);








