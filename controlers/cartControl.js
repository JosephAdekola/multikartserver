const cartSchema = require("../schemas/cartSchema.js")
const productModel = require("../schemas/productSchema.js")
const { usersModel } = require("../schemas/usersSchema.js")
const { verifyToken } = require("../utils/services.js")


const addToCart = async (req, res) => {
    const { userId, productId, quantity } = req.body

    try {
        const findProduct = await productModel.findById(productId)

        if (!findProduct) {
            return res.status(400).json({ message: "this product is not available" })
        }

        if (findProduct.quantity === 0) {
            await productModel.findOneAndUpdate({ _id: findProduct._id }, { $set: { stock: "out of stock" } })
            return res.status(400).json({ message: `${findProduct.title} is out of stock` })
        } else if (findProduct.quantity < quantity) {
            return res.status(400).json({ message: `we only have ${findProduct.quantity} of ${findProduct.title} left in stock, please adjust your cart quantity accordingly.` })
        }

        const userCart = await cartSchema.findOne({ userId })
        if (!userCart) {
            const newCart = new cartSchema({
                userId,
                items: [
                    {
                        product: productId,
                        quantity
                    }
                ]
            })
            const saveCart = await newCart.save()
            return res.status(200).json({ message: `${quantity} ${findProduct.title} successfully added to cart`, cart: saveCart })
        }

        const existingProduct = userCart.items.find(
            (item) => item.product.toString() === productId
        );

        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            userCart.items.push({ product: productId, quantity });
        }

        const updatedCart = await userCart.save();
        return res.status(200).json({ message: "Cart updated", cart: updatedCart });
    } catch (error) {
        console.error("Add to cart error:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

const customerCart = async (req, res) => {

  console.log("was here");
  
    
    const { authorization } = req.headers;
    
    console.log(authorization);

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ message: "authorization token missing or malformed" });
  }

  const token = authorization.split(" ")[1];
  const getUser = verifyToken(token);

  try {
    const findUser = await usersModel.findOne({ userId: getUser.userId });
    const getUserCart = await cartSchema.findOne({ userId: findUser._id });

    if (!getUserCart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const productIds = getUserCart.items.map(prodId => prodId.product);
    const products = await productModel.find({ _id: { $in: productIds } }).select("title images price productCode");
    console.log(products);
    

    const productMap = {};
    products.forEach(product => {
      productMap[product._id.toString()] = {
        title: product.title,
        images: product.images,
        price: product.price,
        productId: product._id
      };
    });

    const result = getUserCart.items.map(item => {
      const product = productMap[item.product.toString()];
      return {
        title: product?.title || "Unknown Product",
        images: product?.images || [],
        price: product?.price || "cant get price right now",
        productId: product?.productId || "cant get price right now",
        quantity: item.quantity
      };
    });

    return res.status(200).json(result);

  } catch (error) {
    console.error("get cart item error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteCartItem = async (req, res) => {
    const { userId, productId } = req.body;

    try {
        const userCart = await cartSchema.findOne({ userId });

        if (!userCart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const itemIndex = userCart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Product not found in cart" });
        }
        
        userCart.items.splice(itemIndex, 1);
        
        const updatedCart = await userCart.save();

        return res.status(200).json({
            message: "Item removed from cart",
            cart: updatedCart
        });
    } catch (error) {
        console.error("Delete cart item error:", error);
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const changeCartQuantity = async (req, res) => {
    const { userId, productId, quantity } = req.body;

    try {
        if (!userId || !productId || quantity === undefined) {
            return res.status(400).json({ message: "Missing credentials" });
        }

        const cart = await cartSchema.findOne({ userId });
        
        if (!cart) {
            return res.status(404).json({ message: "Cart not found for this user" });
        }
        
        const itemToUpdate = cart.items.find(item => item.product.toString() === productId);
        if (!itemToUpdate) {
            return res.status(404).json({ message: "Product not found in cart" });
        }
        
        itemToUpdate.quantity = quantity;
        
        await cart.save();

        return res.status(200).json({
            message: "Quantity updated successfully",
            cart: cart
        });

    } catch (error) {
        console.error("Error updating cart quantity:", error);
        return res.status(500).json({ message: "Server error" });
    }
};







module.exports = {
    addToCart,
    customerCart,
    deleteCartItem,
    changeCartQuantity
}