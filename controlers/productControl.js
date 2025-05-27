const { default: categoriesSchema } = require("../schemas/categoriesSchema")
const productModel = require("../schemas/productSchema")


const addProduct = async (req, res) => {
  const { images, title, rating, stock, quantity, price, old_price, colour,
    productDetail, description, details, video, productCode, sizes, category } = req.body

  const findProduct = await productModel.findOne({ productCode: productCode })
  if (findProduct) {
    return res.status(400).json({ message: "this product is already available online", product: findProduct })
  }

  if (!images[0] || !title || !price || !old_price || !productCode ||
    !colour || !productDetail || !sizes || !category) {

    return res.status(400).json({ message: "please fill all required fields" })
  }

  try {
    let savedCategory = await categoriesSchema.findOne({ name: category })
    if (!savedCategory) {
      const newCategory = new categoriesSchema({ name: category })
      savedCategory = await newCategory.save()
    }
    const newProduct = new productModel({
      images,
      rating,
      title,
      price,
      old_price,
      quantity,
      sizes,
      colour,
      productDetail,
      stock,
      description,
      details,
      video,
      productCode,
      category: savedCategory._id
    })

    const savedProduct = await newProduct.save()

    if (savedProduct) {
      console.log(savedProduct);

      return res.status(201).json({ message: "product added successfully" })
    }

  } catch (error) {
    console.log("this error occured while uploading the product", error);
    res.status(500).json({ errorMessage: "there was an error uploading your product" })
  }
}

const allProducts = async (req, res) => {
  try {
    const getAllProducts = await productModel.find().populate("category")
    if (getAllProducts) {
      return res.status(200).json(getAllProducts)
    }
  } catch (error) {

  }
}

const singleProduct = async (req, res) => {
  const { code } = req.params;
  console.log(code);
  console.log(req.params);


  if (!code) {
    return res.status(400).json({ message: "Product code is required" });
  }

  try {
    const product = await productModel.findOne({ productCode: code }).populate("category");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({ error: "There was an error fetching the product" });
  }
};


const productUpdater = async (req, res) => {
  const { productCode, category, ...payload } = req.body;

  if (!productCode) {
    return res.status(400).json({ message: "Product code cannot be empty" });
  }

  try {
    let updatedCategoryId = undefined;

    if (category) {
      let savedCategory = await categoriesSchema.findOne({ name: category });
      if (!savedCategory) {
        const newCategory = new categoriesSchema({ name: category });
        savedCategory = await newCategory.save();
      }
      updatedCategoryId = savedCategory._id;
    }

    const updatePayload = {
      ...payload,
      ...(updatedCategoryId && { category: updatedCategoryId })
    };

    const result = await productModel.updateOne(
      { productCode },
      { $set: updatePayload }
    );

    return res.status(200).json({
      message: "Product successfully updated",
      result,
    });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({
      error: "There was an error while updating the product. Please try again later.",
    });
  }
};


const productDeleter = async (req, res) => {
  const { productCode } = req.body

  try {
    if (!productCode) {
      return res.status(400).json({ message: "product code is required to perform this operation" })
    }

    const deleted = await productModel.findOneAndDelete({ productCode })

    if (!deleted) {
      return res.status(404).json({ message: "product not found" })
    }

    return res.status(200).json({ message: "product deleted successfully" })

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "this error is from the server" })
  }
}

const productCategory = async (req, res) => {
  const { categoryId } = req.body

  try {
    const products = await productModel.find({ category: categoryId }).populate("category")

    return res.status(200).json({ data: products })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Server error occurred" })
  }
}


// const productCategory = async (req, res) => {
//   const { category } = req.body

//   try {
//     const getAllProd = await productModel.find().populate("category")
//     const prodCate = getAllProd.map((prod, index) => {
//       if (prod.category.name === category) {
//         return (
//           [
//             { prod },
//           ]
//         )
//       }

//     })

//     return res.status(200).json({ data: prodCate })
//   } catch (error) {

//   }
// }


module.exports = {
  addProduct,
  allProducts,
  singleProduct,
  productUpdater,
  productDeleter,
  productCategory
}
