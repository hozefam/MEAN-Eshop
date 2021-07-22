const { User } = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.get('/', async (req, res) => {
  const userList = await User.find({}).select('-passwordHash');

  if (!userList) {
    res.status(500).json({
      success: false,
    });
  }

  res.send(userList);
});

router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id).select('-passwordHash');

  if (!user) {
    return res.status(500).json({
      success: false,
    });
  }

  return res.status(200).send(user);
});

router.post('/', async (req, res) => {
  let {
    name,
    email,
    password,
    phone,
    isAdmin,
    street,
    apartment,
    zip,
    city,
    country,
  } = req.body;

  let passwordHash = bcrypt.hashSync(password, 10);

  let user = new User({
    name,
    email,
    passwordHash,
    phone,
    isAdmin,
    street,
    apartment,
    zip,
    city,
    country,
  });

  user = await user.save();

  if (!user) {
    return res.status(400).send({
      success: false,
      message: 'The user cannot be created',
    });
  }

  return res.send(user);
});

router.put('/:id', async (req, res) => {
  const userExist = await User.findById(req.params.id);

  let {
    name,
    email,
    password,
    phone,
    isAdmin,
    street,
    apartment,
    zip,
    city,
    country,
  } = req.body;

  let passwordHash;
  if (password) {
    passwordHash = bcrypt.hashSync(password, 10);
  } else {
    passwordHash = userExist.passwordHash;
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name,
      email,
      passwordHash,
      phone,
      isAdmin,
      street,
      apartment,
      zip,
      city,
      country,
    },
    { new: true, useFindAndModify: false },
  );

  if (!user) {
    return res.status(404).send('The user cannot be updated');
  }

  return res.send(user);
});

router.post('/login', async (req, res) => {
  let { email, password } = req.body;
  const secret = process.env.SECRET;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).send('The user not found');
  }

  if (user && bcrypt.compareSync(password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      {
        expiresIn: '1d',
      },
    );

    return res.status(200).send({
      user: user.email,
      token: token,
    });
  } else {
    return res.status(400).send({
      message: 'Password is wrong',
    });
  }
});

router.post('/register', async (req, res) => {
  let {
    name,
    email,
    password,
    phone,
    isAdmin,
    street,
    apartment,
    zip,
    city,
    country,
  } = req.body;

  let passwordHash;
  if (password) {
    passwordHash = bcrypt.hashSync(password, 10);
  } else {
    passwordHash = userExist.passwordHash;
  }

  let user = new User({
    name,
    email,
    passwordHash,
    phone,
    isAdmin,
    street,
    apartment,
    zip,
    city,
    country,
  });

  user = await user.save();

  if (!user) {
    return res.status(404).send('The user cannot be created');
  }

  return res.send(user);
});

router.delete('/:id', (req, res) => {
  User.findByIdAndRemove(req.params.id, { useFindAndModify: false })
    .then(user => {
      if (user) {
        return res.status(200).json({
          success: true,
          message: 'The user is deleted',
        });
      } else {
        return res
          .status(404)
          .json({ success: false, message: 'User not found' });
      }
    })
    .catch(err => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.get('/get/count', async (req, res) => {
  const userCount = await User.countDocuments(count => count);

  if (!userCount) {
    res.status(500).json({
      success: false,
    });
  }

  return res.send({
    count: userCount,
  });
});

module.exports = router;
