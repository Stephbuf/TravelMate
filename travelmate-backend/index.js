const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./db_config');

const app = express();
const PORT = 3000;

const User = require('./models/users');
const Location = require('./models/location');


User.hasMany(Location, {
  foreignKey: 'userEmail',
  sourceKey: 'email',
  as: 'locations'
});

Location.belongsTo(User, {
  foreignKey: 'userEmail',
  targetKey: 'email'
});


const usersRoutes = require('./routes/users');
const locationsRoutes = require('./routes/locations');

// Middleware
app.use(cors({
    origin: ['http://localhost:8100', 'http://localhost:8101'],
  credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));


//Routes
app.use('/users', usersRoutes);
app.use('/locations', locationsRoutes);

app.get('/', (req, res) => {
  res.send('Motiv API is running.. yay!');
});

// Sync DB and start server
sequelize.sync()
  .then(() => {
    console.log(' Database synced successfully!');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to sync database:', err);
  });
