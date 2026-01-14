const { validationResult } = require("express-validator");
const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = async (req, res, next) => {
  const { title, price, description } = req.body;
  const imageUrl = req.file;
  console.log(imageUrl);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/edit-product",
      editing: false,
      hasError: true,
      product: { title, imageUrl, price, description },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  const product = new Product({
    title,
    price,
    description,
    imageUrl,
    userId: req.user,
  });

  try {
    await product.save();
    console.log("Created Product");
    res.redirect("/admin/products");
  } catch (err) {
    const error = new Error(err);
    error.httpsStatusCode = 500;
    return next(error);
  }
};

exports.getEditProduct = async (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }

  const prodId = req.params.productId;

  try {
    const product = await Product.findById(prodId);

    if (!product) {
      return res.redirect("/");
    }

    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      product,
      hasError: false,
      errorMessage: null,
      validationErrors: [],
    });
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpsStatusCode = 500;
    return next(error);
  }
};

exports.postEditProduct = async (req, res, next) => {
  const { productId, title, price, imageUrl, description } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true,
      product: { title, imageUrl, price, description, _id: productId },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.redirect("/");
    }

    if (product.userId.toString() !== req.user._id.toString()) {
      return res.redirect("/");
    }

    product.title = title;
    product.price = price;
    product.description = description;
    product.imageUrl = imageUrl;

    await product.save();
    console.log("UPDATED PRODUCT!");
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpsStatusCode = 500;
    return next(error);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ userId: req.user._id });
    console.log(products);
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
    });
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpsStatusCode = 500;
    return next(error);
  }
};

exports.postDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  try {
    await Product.deleteOne({ _id: prodId, userId: req.user._id });
    console.log("DESTROYED PRODUCT");
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpsStatusCode = 500;
    return next(error);
  }
};

/////////////////////////////////////////////////// SQL
// const Product = require("../models/product");

// exports.getAddProduct = async (req, res, next) => {
//   res.render("admin/edit-product", {
//     pageTitle: "Add Product",
//     path: "/admin/add-product",
//     editing: false,
//   });
// };
// exports.postAddProduct = async (req, res, next) => {
//   try {
//     const { title, imageUrl, price, description } = req.body;
//     await req.user.createProduct({
//       title: title,
//       price: price,
//       imageUrl: imageUrl,
//       description: description,
//     });
//     console.log("Created Product");
//     res.redirect("/admin/produc ts");
//   } catch (err) {
//     console.log(err);
//   }
// };

// exports.getEditProduct = async (req, res, next) => {
//   try {
//     const editMode = req.query.edit;
//     if (!editMode) {
//       return res.redirect("/");
//     }

//     const prodId = req.params.productId;
//     const product = await req.user.getProducts({where: {id: prodId}})

//     if (!product) {
//       return res.redirect("/");
//     }

//     res.render("admin/edit-product", {
//       pageTitle: "Edit Product",
//       path: "/admin/edit-product",
//       editing: editMode,
//       product,
//     });
//   } catch (err) {
//     console.log(err);
//   }
// };

// exports.postEditProduct = async (req, res, next) => {
//   try {
//     const { productId, title, price, imageUrl, description } = req.body;

//     const product = await Product.findByPk(productId);

//     if (!product) {
//       return res.redirect("/");
//     }

//     product.title = title;
//     product.price = price;
//     product.imageUrl = imageUrl;
//     product.description = description;

//     await product.save();

//     console.log("UPDATED PRODUCT!");
//     res.redirect("/admin/products");
//   } catch (err) {
//     console.log(err);
//   }
// };

// exports.getProducts = async (req, res, next) => {
//   try {
//     const products = await req.user.getProducts()

//     res.render("admin/products", {
//       prods: products,
//       pageTitle: "Admin Products",
//       path: "/admin/products",
//     });
//   } catch (err) {
//     console.log(err);
//   }
// };

// exports.postDeleteProduct = async (req, res, next) => {
//   try {
//     const prodId = req.body.productId;
//     const product = await Product.findByPk(prodId);

//     if (!product) {
//       return res.redirect("/admin/products");
//     }

//     await product.destroy();

//     console.log("DESTROYED PRODUCT");
//     res.redirect("/admin/products");
//   } catch (err) {
//     console.log(err);
//   }
// };
