const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv/config');

const app = express();
const api = process.env.API_URL;

// Middleware
app.use(express.json());
app.use(morgan('tiny'));

app.get(`${api}/products`, (req, res) => {
  const product = {
    id: 1,
    name: 'hair dresser',
    image: 'some_url',
  };
  res.send(product);
});

app.post(`${api}/products`, (req, res) => {
  const newProduct = req.body;
  console.log(newProduct);
  res.send(newProduct);
});

mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'eshop-database',
  })
  .then(() => console.log('Database Connection is ready'))
  .catch((err) => console.log(err));

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
