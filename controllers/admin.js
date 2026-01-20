const { validationResult } = require("express-validator");
const Product = require("../models/product");
const fileHelper = require("../utils/file");

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
  console.log("testsss");
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;

  // ❌ No image uploaded
  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title,
        price,
        description,
      },
      errorMessage: "Attached file is not an image.",
      validationErrors: [],
    });
  }

  const errors = validationResult(req);

  // ❌ Validation errors
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title,
        price,
        description,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  const imageUrl = image.path;

  try {
    const product = new Product({
      title,
      price,
      description,
      imageUrl,
      userId: req.user,
    });

    await product.save();

    console.log("Created Product");
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    next(error);
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
  const { productId, title, price, description } = req.body;
  const image = req.file;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true,
      product: { title, price, description, _id: productId },
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
    if (image) {
      fileHelper.deleteFile(product.imageUrl);
      product.imageUrl = image.path;
    }

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

exports.deleteProduct = async (req, res, next) => {
  const prodId = req.params.productId;

  try {
    const product = await Product.findById(prodId);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (product.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    fileHelper.deleteFile(product.imageUrl);
    await Product.deleteOne({ _id: prodId });

    console.log("DESTROYED PRODUCT");
    res.status(200).json({ message: "Success!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Deleting product failed." });
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
