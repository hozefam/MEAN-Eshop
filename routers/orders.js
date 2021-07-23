const { Order } = require('../models/order');
const { OrderItem } = require('../models/order-item');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const orderList = await Order.find({})
    .populate('user', 'name')
    .populate({
      path: 'orderItems',
      populate: {
        path: 'product',
        populate: 'category',
      },
    });

  if (!orderList) {
    res.status(500).json({
      success: false,
    });
  }

  res.send(orderList);
});

router.post('/', async (req, res) => {
  let {
    orderItems,
    shippingAddress1,
    shippingAddress2,
    city,
    zip,
    country,
    phone,
    status,
    user,
  } = req.body;

  const orderItemIds = Promise.all(
    orderItems.map(async orderItem => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });

      newOrderItem = await newOrderItem.save();

      return newOrderItem._id;
    }),
  );

  const orderItemIdsResolved = await orderItemIds;

  const totalPrices = await Promise.all(
    orderItemIdsResolved.map(async orderItemId => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        'product',
        'price',
      );
      const totalPrice = orderItem.product.price * orderItem.quantity;

      return totalPrice;
    }),
  );

  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

  let order = new Order({
    orderItems: orderItemIdsResolved,
    shippingAddress1,
    shippingAddress2,
    city,
    zip,
    country,
    phone,
    status,
    totalPrice,
    user,
  });

  order = await order.save();

  if (!order) {
    return res.status(404).send('The order cannot be created');
  }

  return res.send(order);
});

router.put('/:id', async (req, res) => {
  let { status } = req.body;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status,
    },
    { new: true, useFindAndModify: false },
  );
  if (!order) {
    return res.status(404).send('The order cannot be updated');
  }

  return res.send(order);
});

router.delete('/:id', (req, res) => {
  Order.findByIdAndRemove(req.params.id, { useFindAndModify: false })
    .then(async order => {
      if (order) {
        await order.orderItems.map(async orderItem => {
          await OrderItem.findByIdAndRemove(orderItem);
        });

        return res.status(200).json({
          success: true,
          message: 'The order is deleted',
        });
      } else {
        return res
          .status(404)
          .json({ success: false, message: 'Order not found' });
      }
    })
    .catch(err => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.get('/get/totalsales', async (req, res) => {
  const totalSales = await Order.aggregate([
    {
      $group: { _id: null, totalSales: { $sum: '$totalPrice' } },
    },
  ]);

  if (!totalSales) {
    return res.status(400).send('The order sales cannot be generated');
  }

  return res.send({ totalsales: totalSales.pop().totalSales });
});

router.get('/get/count', async (req, res) => {
  const orderCount = await Order.countDocuments(count => count);

  if (!orderCount) {
    res.status(500).json({
      success: false,
    });
  }

  return res.send({
    count: orderCount,
  });
});

router.get('/get/userorders/:userId', async (req, res) => {
  const orderList = await Order.find({ user: req.params.userId })
    .populate({
      path: 'orderItems',
      populate: {
        path: 'product',
        populate: 'category',
      },
    })
    .sort({ dateOrdered: -1 });

  if (!orderList) {
    res.status(500).json({
      success: false,
    });
  }

  res.send(orderList);
});

module.exports = router;
