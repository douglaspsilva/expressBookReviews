const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
let authenticatedUser = require("./auth_users.js").authenticatedUser;

const public_users = express.Router();

/**
 * Route: POST /login
 * Description: Authenticates a user using username and password credentials.
 * Generates and saves a JWT access token in the user session upon successful authentication.
 */
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

/**
 * Route: POST /register
 * Description: Registers a new user with a unique username and password.
 */
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ username, password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

/**
 * Route: GET /
 * Description: Retrieves the complete list of available books using async/await and Promises (Task 10).
 * Logic: Resolves a Promise containing the books database object.
 */
public_users.get('/', async function (req, res) {
  try {
    const getBooks = () => {
      return new Promise((resolve, reject) => {
        if (books) {
          resolve(books);
        } else {
          reject(new Error("Unable to retrieve books list"));
        }
      });
    };

    const booksList = await getBooks();
    return res.status(200).json(booksList);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

/**
 * Route: GET /isbn/:isbn
 * Description: Retrieves book details based on ISBN using async/await and Promises (Task 11).
 * Logic: Looks up the book object using the ISBN as a key in the books database.
 */
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const getBookByISBN = (isbnKey) => {
      return new Promise((resolve, reject) => {
        if (books[isbnKey]) {
          resolve(books[isbnKey]);
        } else {
          reject(new Error("Book not found"));
        }
      });
    };

    const book = await getBookByISBN(isbn);
    return res.status(200).json(book);
  } catch (error) {
    return res.status(404).json({ message: error.message || "Book not found" });
  }
});

/**
 * Route: GET /author/:author
 * Description: Retrieves books matching a specific author using async/await and Promises (Task 12).
 * Logic: Uses Object.values(books) to directly filter books matching the given author parameter.
 */
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const getBooksByAuthor = (authorName) => {
      return new Promise((resolve, reject) => {
        const filteredBooks = Object.values(books).filter(
          (book) => book.author.toLowerCase() === authorName.toLowerCase()
        );

        if (filteredBooks.length > 0) {
          resolve(filteredBooks);
        } else {
          reject(new Error("Book not found"));
        }
      });
    };

    const filteredBooks = await getBooksByAuthor(author);
    return res.status(200).json(filteredBooks);
  } catch (error) {
    return res.status(404).json({ message: error.message || "Book not found" });
  }
});

/**
 * Route: GET /title/:title
 * Description: Retrieves books matching a specific title using async/await and Promises (Task 13).
 * Logic: Uses Object.values(books) to directly filter books matching the given title parameter.
 */
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const getBooksByTitle = (bookTitle) => {
      return new Promise((resolve, reject) => {
        const filteredBooks = Object.values(books).filter(
          (book) => book.title.toLowerCase() === bookTitle.toLowerCase()
        );

        if (filteredBooks.length > 0) {
          resolve(filteredBooks);
        } else {
          reject(new Error("Book not found"));
        }
      });
    };

    const filteredBooks = await getBooksByTitle(title);
    return res.status(200).json(filteredBooks);
  } catch (error) {
    return res.status(404).json({ message: error.message || "Book not found" });
  }
});

/**
 * Route: GET /review/:isbn
 * Description: Retrieves reviews for a specific book identified by its ISBN.
 * Logic: Checks if the book exists and returns its reviews dictionary.
 */
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  }
  return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;

