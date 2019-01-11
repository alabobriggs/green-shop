const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete', 'root', 'letmein@1', {
  dialect: 'mysql',
  host: 'localhost'
});

module.exports = sequelize;
