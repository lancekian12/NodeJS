require("dotenv").config();
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const host = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
const encodedPassword = encodeURIComponent(password);
const MONGODB_URI = `mongodb+srv://${user}:${encodedPassword}@${host}/${dbName}?retryWrites=true&w=majority`;

const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const errorController = require("./controllers/error");
const database = require("./utils/database");
const User = require("./models/user");

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SECRETKEY,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(async (req, res, next) => {
  if (!req.session || !req.session.user) {
    return next();
  }

  try {
    const user = await User.findById(req.session.user._id);
    if (!user) {
      return next();
    }
    req.user = user; 
    next();
  } catch (err) {
    next(err);
  }
});
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

database()
  .then(() => {
    app.listen(3000, () => {
      console.log("🚀 Server running on http://localhost:3000");
    });
  })
  .catch((err) => {
    console.log(err);
  });
////////////////////////////////////////////// SEQUELIZE DATABASE
// const express = require("express");
// const bodyParser = require("body-parser");
// const path = require("path");
// const rootDir = require("./utils/path");

// const errorController = require("./controllers/error");
// const sequelize = require("./utils/database");
// const Product = require("./models/product");
// const User = require("./models/user");
// const Cart = require("./models/cart");
// const CartItem = require("./models/cart-item");
// const Order = require("./models/order");
// const OrderItem = require("./models/order-item");

// const app = express();

// app.set("view engine", "ejs");
// app.set("views", "views");

// const adminRoutes = require("./routes/admin");
// const shopRoutes = require("./routes/shop");

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, "public")));

// app.use((req, res, next) => {
//   User.findByPk(1)
//     .then((user) => {
//       req.user = user;
//       next();
//     })
//     .catch((err) => console.log(err));
// });

// app.use("/admin", adminRoutes);
// app.use(shopRoutes);

// app.use(errorController.get404);

// Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
// User.hasMany(Product);
// User.hasOne(Cart);
// Cart.belongsTo(User);
// Cart.belongsToMany(Product, { through: CartItem });
// Product.belongsToMany(Cart, { through: CartItem });
// Order.belongsTo(User);
// User.hasMany(Order);
// Order.belongsToMany(Product, { through: OrderItem });

// sequelize
//   // .sync({ force: true })
//   .sync()
//   .then((result) => {
//     return User.findByPk(1);
//   })
//   .then((user) => {
//     if (!user) {
//       return User.create({ name: "lance kian", email: "test@gmail.com" });
//     }
//     return user;
//   })
//   .then((user) => {
//     console.log(user);
//     return user.createCart();
//   })
//   .then((cart) => {
//     app.listen(3000);
//   })
//   .catch((err) => console.log(err));
