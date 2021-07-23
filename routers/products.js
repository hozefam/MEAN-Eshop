const { Product } = require('../models/product');
const mongoose = require('mongoose');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('invalid image type');
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, path.join(__dirname, '../public/uploads'));
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.replace(' ', '-');
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

router.get('/', async (req, res) => {
  let filter = {};

  if (req.query.category) {
    filter = { category: req.query.category.split(',') };
  }

  const productList = await Product.find(filter);

  if (!productList) {
    return res.status(500).json({
      success: false,
    });
  }

  return res.send(productList);
});

router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category');

  if (!product) {
    res.status(500).json({
      success: false,
    });
  }

  res.send(product);
});

router.post('/', uploadOptions.single('image'), async (req, res) => {
  const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
  const {
    name,
    description,
    richDescription,
    brand,
    price,
    category,
    countInStock,
    rating,
    numReviews,
    isFeatured,
  } = req.body;

  const file = req.file;
  if (!file) {
    return res
      .status(400)
      .send({ success: false, message: 'No image in the request' });
  }

  const image = `${basePath}${req.file.filename}`;

  const categoryData = Category.findById(category);

  if (!categoryData) {
    return res
      .status(400)
      .send({ success: false, message: 'Invalid Category' });
  }

  let product = new Product({
    name,
    description,
    richDescription,
    image,
    brand,
    price,
    category,
    countInStock,
    rating,
    numReviews,
    isFeatured,
  });

  product = await product.save();

  if (!product) {
    return res.status(500).json({
      success: false,
      message: 'The product cannot be created',
    });
  }

  return res.status(200).send(product);
});

router.put('/:id', uploadOptions.single('image'), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .send({ success: false, message: 'Invalid Product Id' });
  }

  let {
    name,
    description,
    richDescription,
    brand,
    price,
    category,
    countInStock,
    rating,
    numReviews,
    isFeatured,
  } = req.body;

  const categoryData = Category.findById(category);

  if (!categoryData) {
    return res
      .status(400)
      .send({ success: false, message: 'Invalid Category' });
  }

  const productData = Product.findById(req.params.id);

  if (!productData) {
    return res
      .status(400)
      .send({ success: false, message: 'Invalid Category' });
  }

  const file = req.file;
  let imagepath = productData.image;
  if (file) {
    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    imagepath = `${basePath}${fileName}`;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name,
      description,
      richDescription,
      image: imagepath,
      brand,
      price,
      category,
      countInStock,
      rating,
      numReviews,
      isFeatured,
    },
    { new: true, useFindAndModify: false },
  );

  if (!updatedProduct) {
    return res.status(404).send('The product cannot be updated');
  }

  return res.send(updatedProduct);
});

router.delete('/:id', (req, res) => {
  Product.findByIdAndRemove(req.params.id, { useFindAndModify: false })
    .then(product => {
      if (product) {
        return res.status(200).json({
          success: true,
          message: 'The product is deleted',
        });
      } else {
        return res
          .status(404)
          .json({ success: false, message: 'Product not found' });
      }
    })
    .catch(err => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.get('/get/count', async (req, res) => {
  const productCount = await Product.countDocuments(count => count);

  if (!productCount) {
    res.status(500).json({
      success: false,
    });
  }

  return res.send({
    count: productCount,
  });
});

router.get('/get/featured/:count', async (req, res) => {
  let count = req.params.count ? +req.params.count : 0;
  const featuredProductList = await Product.find({ isFeatured: true }).limit(
    count,
  );

  if (!featuredProductList) {
    return res.status(500).json({
      success: false,
    });
  }

  return res.send(featuredProductList);
});

router.put(
  '/gallery-images/:id',
  uploadOptions.array('images', 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .send({ success: false, message: 'Invalid Product Id' });
    }

    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    const files = req.files;
    let imagesPath = [];
    if (files) {
      files.map(file => {
        imagesPath.push(`${basePath}${file.filename}`);
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPath,
      },
      { new: true, useFindAndModify: false },
    );

    if (!product) {
      return res.status(500).send('The images cannot be uploaded');
    }

    return res.send(product);
  },
);

module.exports = router;
