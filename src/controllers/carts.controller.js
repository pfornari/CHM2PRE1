import CartsService from "../services/dao/carts.dao.js";
import ProductsService from "../services/dao/products.dao.js";

const cartService = new CartsService();
const productsService = new ProductsService()


export const getNewCart = async (req, res) => {
  try {
    const newCart = await cartService.createCart();
    res.json({ newCartId: newCart._id });
  } catch (error) {
    console.error("Error creating a new cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const renderCart = async (req, res) => {
  try {
    const cartsToRender = await cartService.getAllCarts();
    console.log(cartsToRender);

    const cartIds = cartsToRender.map((cart) => cart._id);

    res.json({ cartIds });
  } catch (error) {
    console.error("Error getting all carts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getCartById = async (req, res) => {
  try {
    const { cid } = req.params;
    const cartWithProducts = await cartService.getProductsFromCart(cid);

    res.json(cartWithProducts);
    console.log(cartWithProducts);
  } catch (error) {
    console.error("Error getting cart with products:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const deleteCartById = async (req, res) => {
  try {
    const { cid } = req.params;
    const deletedCart = await cartService.getCartById(cid);
    deletedCart.products = [];

    let updatedCart = await cartService.updateCart(cid, deletedCart);
    res.json(updatedCart);
    console.log(updatedCart);
  } catch (error) {
    console.error("Error getting cart with products:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const deleteProductFromCart = async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const productId = pid;
    const quantity = req.body.quantity;
    const cartId = cid;

    const cart = await cartService.getCartById(cartId);

    if (cart) {
      const product = await productsService.getProductById(productId);

      if (product) {
        const index = cart.products.findIndex((item) =>
          item.product.equals(productId)
        );

        if (index !== 1) {
          cart.products[index].quantity -= 1;
        } else {
          cart.products.splice(index, 1);
        }

        const response = await cartService.updateCart(cartId, cart);

        res.status(200).json({ response: "OK", message: response });
      } else {
        res.status(404).json({ error: "Product not found." });
      }
    } else {
      res.status(404).json({ error: "Cart not found." });
    }
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const addProductToCart = async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const productId = pid;
    const quantity = req.body.quantity;
    const cartId = cid;

    const cart = await cartService.getCartById(cartId);

    if (cart) {
      const product = await productsService.getProductById(productId);

      if (product) {
        const index = cart.products.findIndex((item) =>
          item.product.equals(productId)
        );

        if (index !== -1) {
          cart.products[index].quantity += 1;
        } else {
          cart.products.push({ product: productId, quantity: quantity });
        }

        const response = await cartService.updateCart(cartId, cart);

        res.status(200).json({ response: "OK", message: response });
      } else {
        res.status(404).json({ error: "Product not found." });
      }
    } else {
      res.status(404).json({ error: "Cart not found." });
    }
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const modifyProductQuantityToCart = async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartService.getCartById(cid);
    const products = req.body;

    products.forEach((e) => {
      const index = cart.products.findIndex((item) => item.product.equals(cid));
      if (index != -1) {
        cart.products[index].quantity += e.quantity;
      } else {
        cart.products.push({ product: e._id, quantity: e.quantity });
      }
    });
  } catch (error) {
    console.error("Error modifiying products in cart:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const modifyProductOnCart = async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const cart = await cartService.getCartById(cid);
    const product = await productsService.getProductById(pid);

    const index = cart.products.findIndex((item) => item.product.equals(pid));

    if (index !== -1) {
      cart.products[index].quantity += req.body.quantity;
    } else {
      cart.products.push({ product: pid, quantity: req.body.quantity });
    }

    const updatedCart = await cartService.updateCart(cid, cart);

    res.status(200).json({ response: "OK", cart: updatedCart });
  } catch (error) {
    console.error("Error modifying products in cart:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};
