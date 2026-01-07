const mongodb = require("mongodb");
const Product = require("../models/product");
const ObjectId = mongodb.ObjectId;

exports.getAddProduct = async (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  console.log("test");
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product(title, price, description, imageUrl);
  product
    .save()
    .then((result) => {
      // console.log(result);
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditProduct = async (req, res, next) => {
  try {
    const editMode = req.query.edit;
    if (!editMode) {
      return res.redirect("/");
    }

    const prodId = req.params.productId;
    const product = await Product.findById(prodId);

    if (!product) {
      return res.redirect("/");
    }

    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      product,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postEditProduct = async (req, res, next) => {
  try {
    const { productId, title, price, imageUrl, description } = req.body;

    const product = new Product(
      title,
      imageUrl,
      imageUrl,
      description,
      new ObjectId(productId)
    );

    if (!product) {
      return res.redirect("/");
    }

    product.title = title;
    product.price = price;
    product.imageUrl = imageUrl;
    product.description = description;

    await product.save();

    console.log("UPDATED PRODUCT!");
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.fetchAll();

    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
    });
  } catch (err) {
    console.log(err);
  }
};

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
