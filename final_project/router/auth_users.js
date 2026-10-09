const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
  return users.filter((user) => user.username === username && user.password === password).length > 0;
}

regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" })
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, "access", { expiresIn: 60 * 60 })

    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  }
  else {
    return res.status(401).json({ message: "Invalid username or password." });
  }
});

regd_users.put("/auth/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username;

  if (!isbn || !review || !username) {
    return res.status(404).json({ message: "Error adding review" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  books[isbn].reviews[String(username)] = review;
  return res.status(200).json({ message: "Review added successfully" });
});

regd_users.delete("/auth/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!isbn || !username) {
    return res.status(404).json({ message: "Error deleting review" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found" });
  }
  else {
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
