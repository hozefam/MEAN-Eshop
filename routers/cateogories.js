const { Category } = require('../models/category');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const categoryList = await Category.find({});

  if (!categoryList) {
    return res.status(500).json({
      success: false,
    });
  }

  return res.status(200).send(categoryList);
});

router.get('/:id', async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(500).json({
      success: false,
    });
  }

  return res.status(200).send(category);
});

router.post('/', async (req, res) => {
  let { name, icon, color } = req.body;
  let category = new Category({
    name,
    icon,
    color,
  });
  category = await category.save();

  if (!category) {
    return res.status(404).send('The category cannot be created');
  }

  return res.send(category);
});

router.put('/:id', async (req, res) => {
  let { name, icon, color } = req.body;
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name,
      icon,
      color,
    },
    { new: true, useFindAndModify: false },
  );

  if (!category) {
    return res.status(404).send('The category cannot be updated');
  }

  return res.send(category);
});

router.delete('/:id', (req, res) => {
  Category.findByIdAndRemove(req.params.id, { useFindAndModify: false })
    .then(category => {
      if (category) {
        return res.status(200).json({
          success: true,
          message: 'The category is deleted',
        });
      } else {
        return res
          .status(404)
          .json({ success: false, message: 'Category not found' });
      }
    })
    .catch(err => {
      return res.status(400).json({ success: false, error: err });
    });
});

module.exports = router;
