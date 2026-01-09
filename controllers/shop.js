const Product = require("../models/productMongo");
const Cart = require("../models/cart");

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.fetchAll();
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "All Products",
      path: "/products",
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const prodId = req.params.productId;
    const product = await Product.findById(prodId);

    res.render("shop/product-detail", {
      product: product,
      pageTitle: product.title,
      path: "/products",
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getIndex = async (req, res, next) => {
  try {
    const products = await Product.fetchAll();
    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const cart = await req.user.getCart();

    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      products: cart,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postCart = async (req, res, next) => {
  try {
    const prodId = req.body.productId;
    const product = await Product.findById(prodId);

    if (!product) {
      return res.redirect("/cart");
    }

    const result = await req.user.addToCart(product);
    console.log(result);

    res.redirect("/cart");
  } catch (err) {
    console.log(err);
  }
};

// req.user.getCart().then((cart) => {
//   return cart.getProducts({ where: { id: prodId } });
// }).then(products => {
//   const product = products[0];
//   return product.cartItem.destroy();
// }).then(result => {
//   res.redirect('/cart')
// })

exports.postCartDeleteProduct = async (req, res, next) => {
  try {
    const prodId = req.body.productId;
    await req.user.deleteItemFromCart(prodId);

    res.redirect("/cart");
  } catch (err) {
    console.log(err);
  }
};

exports.postOrder = async (req, res, next) => {
  try {
    await req.user.addOrder();
    res.redirect("/orders");
  } catch (err) {
    console.error(err);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await req.user.getOrders();

    res.render("shop/orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      orders,
    });
  } catch (err) {
    console.error(err);
  }
};

exports.getCheckout = async (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};

/////////////////////////////////////////// SQL
// const Product = require("../models/product");
// const Cart = require("../models/cart");

// exports.getProducts = async (req, res, next) => {
//   try {
//     const products = await Product.findAll();
//     res.render("shop/product-list", {
//       prods: products,
//       pageTitle: "All Products",
//       path: "/products",
//     });
//   } catch (err) {
//     console.log(err);
//   }
// };

// exports.getProduct = async (req, res, next) => {
//   try {
//     const prodId = req.params.productId;
//     const product = await Product.findByPk(prodId);

//     res.render("shop/product-detail", {
//       product: product,
//       pageTitle: product.title,
//       path: "/products",
//     });
//   } catch (err) {
//     console.log(err);
//   }
// };

// exports.getIndex = async (req, res, next) => {
//   try {
//     const products = await Product.findAll();
//     res.render("shop/index", {
//       prods: products,
//       pageTitle: "Shop",
//       path: "/",
//     });
//   } catch (err) {
//     console.log(err);
//   }
// };

// exports.getCart = async (req, res, next) => {
//   try {
//     const cart = await req.user.getCart();
//     const products = await cart.getProducts();

//     res.render("shop/cart", {
//       path: "/cart",
//       pageTitle: "Your Cart",
//       products: products,
//     });
//   } catch (err) {
//     console.log(err);
//   }
// };

// exports.postCart = async (req, res, next) => {
//   try {
//     const prodId = req.body.productId;
//     let newQuantity = 1;

//     const cart = await req.user.getCart();
//     const products = await cart.getProducts({ where: { id: prodId } });

//     let product;
//     if (products.length > 0) {
//       product = products[0];
//       newQuantity = product.cartItem.quantity + 1;
//     } else {
//       product = await Product.findByPk(prodId);
//     }

//     await cart.addProduct(product, {
//       through: { quantity: newQuantity },
//     });

//     res.redirect("/cart");
//   } catch (err) {
//     console.log(err);
//   }
// };

// // req.user.getCart().then((cart) => {
// //   return cart.getProducts({ where: { id: prodId } });
// // }).then(products => {
// //   const product = products[0];
// //   return product.cartItem.destroy();
// // }).then(result => {
// //   res.redirect('/cart')
// // })

// exports.postCartDeleteProduct = async (req, res, next) => {
//   try {
//     const prodId = req.body.productId;
//     const cart = await req.user.getCart();
//     const products = await cart.getProducts({ where: { id: prodId } });
//     if (!products.length) {
//       return res.redirect("/cart");
//     }

//     await products[0].cartItem.destroy();
//     res.redirect("/cart");
//   } catch (err) {
//     console.log(err);
//   }
// };

// exports.postOrder = async (req, res, next) => {
//   try {
//     const cart = await req.user.getCart();
//     const products = await cart.getProducts();

//     const order = await req.user.createOrder();

//     await order.addProducts(
//       products.map(product => {
//         product.orderItem = {
//           quantity: product.cartItem.quantity
//         };
//         return product;
//       })
//     );

//     await cart.setProducts(null);
//     res.redirect('/orders');
//   } catch (err) {
//     console.error(err);
//   }
// };

// exports.getOrders = async (req, res, next) => {
//   try {
//     const orders = await req.user.getOrders({
//       include: ['products']
//     });

//     res.render('shop/orders', {
//       path: '/orders',
//       pageTitle: 'Your Orders',
//       orders
//     });
//   } catch (err) {
//     console.error(err);
//   }
// };

// exports.getCheckout = async (req, res, next) => {
//   res.render("shop/checkout", {
//     path: "/checkout",
//     pageTitle: "Checkout",
//   });
// };
