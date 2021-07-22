const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

const app = express();
const api = process.env.API_URL;

// Middleware
app.use(cors());
app.options('*', cors());
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use(errorHandler);

const productsRouter = require('./routers/products');
const usersRouter = require('./routers/users');
const ordersRouter = require('./routers/orders');
const categoryRouter = require('./routers/cateogories');

app.use(`${api}/products`, productsRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/categories`, categoryRouter);

mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'eshop-database',
  })
  .then(() => console.log('Database Connection is ready'))
  .catch(err => console.log(err));

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
