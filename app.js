const http = require("http");

const express = require("express");

const app = express();

app.use("/", (req, res, next) => {
  console.log("middlware number 1");
  next();
});

app.use("/add-product", (req, res, next) => {
  res.send("<h1>Hello from Product!</h1>");
});

app.use("/", (req, res, next) => {
  res.send("<h1>Hello from Express!</h1>");
});

app.listen(3000);
