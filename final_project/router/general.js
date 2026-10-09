const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
let authenticatedUser = require("./auth_users.js").authenticatedUser;

const public_users = express.Router();


public_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ data: password }, "access", { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    };

    return res.status(200).json({ message: "Login successful!" });
  } else {
    return res.status(401).json({ message: "Invalid Login. Check username and password" });
  }
});

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ username, password });
      console.log("users: ", users);
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

public_users.get('/', async function (req, res) {
  const getBooks = () => Promise.resolve(books);
  const booksList = await getBooks();
  return res.status(200).json(JSON.stringify(booksList));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  const getBookByISBN = () => Promise.resolve(books[isbn]);
  const book = await getBookByISBN();
  if (book) {
    return res.status(200).json(JSON.stringify(book));
  }
  return res.status(404).json({ message: "Book not found" });
});

public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  const getBooksByAuthor = () => {
    return new Promise((resolve) => {
      const keys = Object.keys(books);
      const filteredBooks = [];

      keys.forEach((key) => {
        if (books[key].author === author) {
          filteredBooks.push(books[key]);
        }
      });
      resolve(filteredBooks);
    });
  };

  const filteredBooks = await getBooksByAuthor();

  if (filteredBooks.length > 0) {
    return res.status(200).json(filteredBooks);
  }

  return res.status(404).json({ message: "Book not found" });
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  const getBooksByTitle = () => Promise.resolve(Object.values(books).filter((book) => book.title === title));
  const filteredBooks = await getBooksByTitle();
  if (filteredBooks.length > 0) {
    return res.status(200).json(JSON.stringify(filteredBooks));
  }
  return res.status(404).json({ message: "Book not found" });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  console.log("requested isbn: ", isbn);
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  }
  return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;
