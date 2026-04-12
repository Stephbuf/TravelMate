const { DataTypes } = require('sequelize');
const db = require('../db_config');

const Location = db.define('Location', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  country: DataTypes.STRING,
  city: DataTypes.STRING,
  category: DataTypes.STRING,
  location_name: DataTypes.STRING,
  address: DataTypes.TEXT,
  userEmail: DataTypes.STRING,
  wishlist: DataTypes.BOOLEAN,
  place_id: DataTypes.STRING,
  tag: DataTypes.STRING, 
  
}, {
  timestamps: false,
  tableName: 'locations'
});

module.exports = Location;
