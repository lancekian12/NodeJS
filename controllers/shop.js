const fs = require("fs");
const path = require("path");

const Product = require("../models/product");
const Order = require("../models/order");

const ITEMS_PER_PAGE = 2;

const PDFDocument = require("pdfkit");

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();

    res.render("shop/product-list", {
      prods: products,
      pageTitle: "All Products",
      path: "/products",
    });
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpsStatusCode = 500;
    return next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const prodId = req.params.productId;
    const product = await Product.findById(prodId);

    res.render("shop/product-detail", {
      product,
      pageTitle: product.title,
      path: "/products",
    });
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpsStatusCode = 500;
    return next(error);
  }
};

exports.getIndex = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;
    let totalItems;

    totalItems = await Product.find().countDocuments();

    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
      totalProducts: totalItems,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    next(error);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    await req.user.populate("cart.items.productId");
    const products = req.user.cart.items;

    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      products,
    });
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpsStatusCode = 500;
    return next(error);
  }
};

exports.postCart = async (req, res, next) => {
  try {
    const prodId = req.body.productId;
    const product = await Product.findById(prodId);

    await req.user.addToCart(product);
    res.redirect("/cart");
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpsStatusCode = 500;
    return next(error);
  }
};

exports.postCartDeleteProduct = async (req, res, next) => {
  try {
    const prodId = req.body.productId;
    await req.user.removeFromCart(prodId);

    res.redirect("/cart");
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpsStatusCode = 500;
    return next(error);
  }
};

exports.postOrder = async (req, res, next) => {
  try {
    await req.user.populate("cart.items.productId");

    const products = req.user.cart.items.map((i) => ({
      quantity: i.quantity,
      product: { ...i.productId._doc },
    }));

    const order = new Order({
      user: {
        email: req.user.email,
        userId: req.user,
      },
      products,
    });

    await order.save();
    await req.user.clearCart();

    res.redirect("/orders");
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpsStatusCode = 500;
    return next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ "user.userId": req.user._id });

    res.render("shop/orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      orders,
    });
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpsStatusCode = 500;
    return next(error);
  }
};

exports.getInvoice = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("No order found.");
    }

    if (order.user.userId.toString() !== req.user._id.toString()) {
      throw new Error("Unauthorized");
    }

    const invoiceName = `invoice-${orderId}.pdf`;
    const invoicePath = path.join("data", "invoices", invoiceName);

    const pdfDoc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${invoiceName}"`);

    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    pdfDoc.fontSize(26).text("Invoice", { underline: true });
    pdfDoc.text("-----------------------");

    let totalPrice = 0;
    order.products.forEach((prod) => {
      totalPrice += prod.quantity * prod.product.price;
      pdfDoc
        .fontSize(14)
        .text(
          `${prod.product.title} - ${prod.quantity} x $${prod.product.price}`,
        );
    });

    pdfDoc.text("---");
    pdfDoc.fontSize(20).text(`Total Price: $${totalPrice}`);

    pdfDoc.end();
  } catch (err) {
    next(err);
  }
};

// /////////////////////////////////////////// SQL
// // const Product = require("../models/product");
// // const Cart = require("../models/cart");

// // exports.getProducts = async (req, res, next) => {
// //   try {
// //     const products = await Product.findAll();
// //     res.render("shop/product-list", {
// //       prods: products,
// //       pageTitle: "All Products",
// //       path: "/products",
// //     });
// //   } catch (err) {
// //     console.log(err);
// //   }
// // };

// // exports.getProduct = async (req, res, next) => {
// //   try {
// //     const prodId = req.params.productId;
// //     const product = await Product.findByPk(prodId);

// //     res.render("shop/product-detail", {
// //       product: product,
// //       pageTitle: product.title,
// //       path: "/products",
// //     });
// //   } catch (err) {
// //     console.log(err);
// //   }
// // };

// // exports.getIndex = async (req, res, next) => {
// //   try {
// //     const products = await Product.findAll();
// //     res.render("shop/index", {
// //       prods: products,
// //       pageTitle: "Shop",
// //       path: "/",
// //     });
// //   } catch (err) {
// //     console.log(err);
// //   }
// // };

// // exports.getCart = async (req, res, next) => {
// //   try {
// //     const cart = await req.user.getCart();
// //     const products = await cart.getProducts();

// //     res.render("shop/cart", {
// //       path: "/cart",
// //       pageTitle: "Your Cart",
// //       products: products,
// //     });
// //   } catch (err) {
// //     console.log(err);
// //   }
// // };

// // exports.postCart = async (req, res, next) => {
// //   try {
// //     const prodId = req.body.productId;
// //     let newQuantity = 1;

// //     const cart = await req.user.getCart();
// //     const products = await cart.getProducts({ where: { id: prodId } });

// //     let product;
// //     if (products.length > 0) {
// //       product = products[0];
// //       newQuantity = product.cartItem.quantity + 1;
// //     } else {
// //       product = await Product.findByPk(prodId);
// //     }

// //     await cart.addProduct(product, {
// //       through: { quantity: newQuantity },
// //     });

// //     res.redirect("/cart");
// //   } catch (err) {
// //     console.log(err);
// //   }
// // };

// // // req.user.getCart().then((cart) => {
// // //   return cart.getProducts({ where: { id: prodId } });
// // // }).then(products => {
// // //   const product = products[0];
// // //   return product.cartItem.destroy();
// // // }).then(result => {
// // //   res.redirect('/cart')
// // // })

// // exports.postCartDeleteProduct = async (req, res, next) => {
// //   try {
// //     const prodId = req.body.productId;
// //     const cart = await req.user.getCart();
// //     const products = await cart.getProducts({ where: { id: prodId } });
// //     if (!products.length) {
// //       return res.redirect("/cart");
// //     }

// //     await products[0].cartItem.destroy();
// //     res.redirect("/cart");
// //   } catch (err) {
// //     console.log(err);
// //   }
// // };

// // exports.postOrder = async (req, res, next) => {
// //   try {
// //     const cart = await req.user.getCart();
// //     const products = await cart.getProducts();

// //     const order = await req.user.createOrder();

// //     await order.addProducts(
// //       products.map(product => {
// //         product.orderItem = {
// //           quantity: product.cartItem.quantity
// //         };
// //         return product;
// //       })
// //     );

// //     await cart.setProducts(null);
// //     res.redirect('/orders');
// //   } catch (err) {
// //     console.error(err);
// //   }
// // };

// // exports.getOrders = async (req, res, next) => {
// //   try {
// //     const orders = await req.user.getOrders({
// //       include: ['products']
// //     });

// //     res.render('shop/orders', {
// //       path: '/orders',
// //       pageTitle: 'Your Orders',
// //       orders
// //     });
// //   } catch (err) {
// //     console.error(err);
// //   }
// // };

// // exports.getCheckout = async (req, res, next) => {
// //   res.render("shop/checkout", {
// //     path: "/checkout",
// //     pageTitle: "Checkout",
// //   });
// // };
