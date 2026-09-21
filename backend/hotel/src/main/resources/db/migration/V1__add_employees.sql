CREATE TABLE employees (
    employee_id    BIGSERIAL     PRIMARY KEY,
    full_name      VARCHAR (100) NOT NULL,
    date_of_birth  DATE          NOT NULL,
    address        VARCHAR (255) NOT NULL,
    cccd           VARCHAR (12)  NOT NULL UNIQUE,
    email          VARCHAR (255) NOT NULL UNIQUE,
    portrait_image TEXT         
);