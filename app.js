const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const rootDir = require("./utils/path");

const app = express();

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use("/admin", adminRoutes);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(shopRoutes);

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(rootDir, "views", "404.html"));
});

app.listen(3000);
