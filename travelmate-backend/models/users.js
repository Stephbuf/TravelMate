const { DataTypes } = require('sequelize');
const db = require('../db_config');

const User = db.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  firstName: { type: DataTypes.STRING(50), allowNull: false },
  lastName: { type: DataTypes.STRING(50), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  phone: { type: DataTypes.STRING(20), allowNull: true },
  location: { type: DataTypes.STRING(100), allowNull: true },
  bio: { type: DataTypes.TEXT, allowNull: true },
  dark_mode: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  timestamps: false,
  tableName: 'users'
});

module.exports = User;
