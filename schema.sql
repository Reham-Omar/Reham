DROP TABLE IF EXISTS books;

CREATE TABLE books(
    id SERIAL PRIMARY KEY ,
    kind VARCHAR(255),
    selfLink text,
    title VARCHAR (255),
    authors VARCHAR(255),
    type VARCHAR(255)


);

-- INSERT INTO books (kind,selfLink,title,authors,type) VALUES ('books#volume','https://www.googleapis.com/books/v1/volumes/yRllAAAAMAAJ','The Cat,Past and Present',' Champfleury','OTHER');