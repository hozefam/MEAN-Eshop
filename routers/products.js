const { Product } = require('../models/product');
const mongoose = require('mongoose');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();

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

router.post('/', async (req, res) => {
  const {
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
  } = req.body;

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

router.put('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .send({ success: false, message: 'Invalid Product Id' });
  }

  let {
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
  } = req.body;

  const categoryData = Category.findById(category);

  if (!categoryData) {
    return res
      .status(400)
      .send({ success: false, message: 'Invalid Category' });
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
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
    },
    { new: true, useFindAndModify: false },
  );

  if (!product) {
    return res.status(404).send('The product cannot be updated');
  }

  return res.send(product);
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

module.exports = router;
