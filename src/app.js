
const express = require('express');
const app = express();

const userRoutes = require('./modules/user/routes/user.routes');

app.use(express.json());
app.use('', userRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});


module.exports = app;
