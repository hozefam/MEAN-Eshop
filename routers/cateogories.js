const { Category } = require('../models/category');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const categoryList = await Category.find({});

  if (!categoryList) {
    res.status(500).json({
      success: false,
    });
  }

  res.send(categoryList);
});

module.exports = router;
