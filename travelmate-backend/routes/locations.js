const express = require('express');
const router = express.Router();
const { Sequelize } = require('sequelize');
const Location = require('../models/location');

// ✅ Move country from wishlist to itinerary or from itinerary to wishlist
router.put('/move-country', async (req, res) => {
  const { email, country, currentTag } = req.body;

  try {
    const existingLocation = await Location.findOne({
      where: {
        userEmail: email,
        country,
        tag: currentTag,
      }
    });

    if (!existingLocation) {
      return res.status(404).json({ message: 'Location not found in the specified category.' });
    }

    const newTag = currentTag === 'wishlist' ? 'itinerary' : 'wishlist';

    await Location.update(
      { tag: newTag },
      { where: { userEmail: email, country, tag: currentTag } }
    );

    res.status(200).json({ message: `${country} moved to ${newTag}` });
  } catch (err) {
    console.error('Error moving country:', err);
    res.status(500).json({ message: 'Failed to move country', error: err.message });
  }
});

// ✅ Create new location
router.post('/', async (req, res) => {
  try {
    const {
      country,
      city,
      category,
      location_name,
      address,
      userEmail,
      wishlist,
      place_id,
      tag
    } = req.body;

    const existingLocation = await Location.findOne({
      where: {
        userEmail,
        city,
        location_name,
        tag
      }
    });

    if (existingLocation) {
      return res.status(400).json({ message: 'You’ve already added this place to your list.' });
    }

    const newLocation = await Location.create({
      country,
      city,
      category,
      location_name,
      address,
      userEmail,
      wishlist,
      place_id,
      tag
    });

    res.status(201).json(newLocation);
  } catch (err) {
    console.error('🔥 Error creating location:', err);
    res.status(500).json({ message: 'Failed to save location', error: err.message });
  }
});

// Get countries
router.get('/countries', async (req, res) => {
  try {
    const countries = await Location.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('country')), 'country']],
    });
    res.status(200).json(countries.map((c) => c.country));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch countries', error: err.message });
  }
});

// Get locations by user and tag
router.get('/user/:userEmail', async (req, res) => {
  try {
    const { userEmail } = req.params;
    const { tag } = req.query;

    const whereClause = { userEmail };
    if (tag) whereClause.tag = tag;

    const entries = await Location.findAll({ where: whereClause });
    res.status(200).json(entries);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user locations', error: err.message });
  }
});

// Get single location by ID
router.get('/:id', async (req, res) => {
  try {
    const location = await Location.findByPk(req.params.id);
    if (!location) return res.status(404).json({ message: 'Location not found' });
    res.status(200).json(location);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving location', error: err.message });
  }
});

// Update location by ID
router.put('/:id', async (req, res) => {
  try {
    const {
      country,
      city,
      category,
      address,
      place_id,
      userEmail,
      location_name,
      wishlist,
    } = req.body;

    const [updated] = await Location.update(
      {
        country,
        city,
        category,
        address,
        place_id,
        userEmail,
        location_name,
        wishlist,
      },
      { where: { id: req.params.id } }
    );

    if (!updated) return res.status(404).json({ message: 'Location not found' });
    res.status(200).json({ message: 'Location updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update location', error: err.message });
  }
});

// Edit city or country name
router.put('/editLocation/:type/:name', async (req, res) => {
  try {
    const { newName, userEmail } = req.body;
    const { type, name } = req.params;

    if (!newName || !userEmail) {
      return res.status(400).json({ message: 'Missing required fields: newName or userEmail' });
    }

    const decodedName = decodeURIComponent(name);

    let location = null;
    if (type === 'city') {
      location = await Location.findOne({ where: { city: decodedName, userEmail } });
    } else if (type === 'country') {
      location = await Location.findOne({ where: { country: decodedName, userEmail } });
    }

    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    if (type === 'city') {
      location.city = newName;
    } else {
      location.country = newName;
    }

    await location.save();
    res.status(200).json({ message: `${type} updated successfully`, location });
  } catch (err) {
    res.status(500).json({ message: 'Error updating location', error: err.message });
  }
});

// Edit place (location_name)
router.put('/editLocation/place/:name', async (req, res) => {
  try {
    const { newName, userEmail } = req.body;
    const { name } = req.params;

    if (!newName || !userEmail) {
      return res.status(400).json({ message: 'Missing required fields: newName or userEmail' });
    }

    const decodedName = decodeURIComponent(name);

    const location = await Location.findOne({
      where: { location_name: decodedName, userEmail }
    });

    if (!location) {
      return res.status(404).json({ message: 'Place not found' });
    }

    location.location_name = newName;

    await location.save();

    res.status(200).json({ message: 'Place name updated successfully', location });
  } catch (err) {
    console.error('Error updating place:', err);
    res.status(500).json({ message: 'Error updating place', error: err.message });
  }
});

// Delete a specific location by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Location.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.status(200).json({ message: 'Location deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete location', error: err.message });
  }
});

// Delete city
router.delete('/city/:city', async (req, res) => {
  const { city } = req.params;
  try {
    const deleted = await Location.destroy({ where: { city } });
    if (!deleted) return res.status(404).json({ message: 'City not found' });
    res.status(200).json({ message: 'City deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete city', error: err.message });
  }
});

// Delete country
router.delete('/country/:country', async (req, res) => {
  const { country } = req.params;
  try {
    const deleted = await Location.destroy({ where: { country } });
    if (!deleted) return res.status(404).json({ message: 'Country not found' });
    res.status(200).json({ message: 'Country deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete country', error: err.message });
  }
});

module.exports = router;
