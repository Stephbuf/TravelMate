const express = require('express');
const router = express.Router();
const { Sequelize } = require('sequelize');
const Location = require('../models/location');

// Move country from wishlist to itinerary or from itinerary to wishlist
router.put('/move-country', async (req, res) => {
  const { email, country, currentTag } = req.body;

  try {
    const normalizedEmail = email?.trim();
    const normalizedCountry = country?.trim();
    const normalizedCurrentTag = currentTag?.trim();

    const existingLocation = await Location.findOne({
      where: {
        userEmail: normalizedEmail,
        country: normalizedCountry,
        tag: normalizedCurrentTag
      }
    });

    if (!existingLocation) {
      return res.status(404).json({ message: 'Location not found in the specified category.' });
    }

    const newTag = normalizedCurrentTag === 'wishlist' ? 'itinerary' : 'wishlist';

    await Location.update(
      { tag: newTag },
      {
        where: {
          userEmail: normalizedEmail,
          country: normalizedCountry,
          tag: normalizedCurrentTag
        }
      }
    );

    res.status(200).json({ message: `${normalizedCountry} moved to ${newTag}` });
  } catch (err) {
    console.error('Error moving country:', err);
    res.status(500).json({ message: 'Failed to move country', error: err.message });
  }
});

// Create new location
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

    const normalizedCountry = country?.trim();
    const normalizedCity = city?.trim();
    const normalizedCategory = category?.trim();
    const normalizedLocationName = location_name?.trim();
    const normalizedAddress = address?.trim();
    const normalizedUserEmail = userEmail?.trim();
    const normalizedTag = tag?.trim();
    const normalizedPlaceId = place_id?.trim();

    let existingLocation = null;

    if (normalizedPlaceId) {
      existingLocation = await Location.findOne({
        where: {
          userEmail: normalizedUserEmail,
          tag: normalizedTag,
          place_id: normalizedPlaceId
        }
      });
    } else {
      existingLocation = await Location.findOne({
        where: {
          userEmail: normalizedUserEmail,
          tag: normalizedTag,
          country: normalizedCountry,
          city: normalizedCity,
          location_name: normalizedLocationName
        }
      });
    }

    if (existingLocation) {
      return res.status(400).json({ message: 'You’ve already added this place to your list.' });
    }

    const newLocation = await Location.create({
      country: normalizedCountry,
      city: normalizedCity,
      category: normalizedCategory,
      location_name: normalizedLocationName,
      address: normalizedAddress,
      userEmail: normalizedUserEmail,
      wishlist,
      place_id: normalizedPlaceId || null,
      tag: normalizedTag
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
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('country')), 'country']]
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

    const whereClause = { userEmail: userEmail?.trim() };
    if (tag) whereClause.tag = tag.trim();

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
      tag
    } = req.body;

    const [updated] = await Location.update(
      {
        country: country?.trim(),
        city: city?.trim(),
        category: category?.trim(),
        address: address?.trim(),
        place_id: place_id?.trim() || null,
        userEmail: userEmail?.trim(),
        location_name: location_name?.trim(),
        wishlist,
        tag: tag?.trim()
      },
      { where: { id: req.params.id } }
    );

    if (!updated) return res.status(404).json({ message: 'Location not found' });
    res.status(200).json({ message: 'Location updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update location', error: err.message });
  }
});

// Edit city or country name (updates all matching rows for that user)
router.put('/editLocation/:type/:name', async (req, res) => {
  try {
    const { newName, userEmail } = req.body;
    const { type, name } = req.params;

    if (!newName || !userEmail) {
      return res.status(400).json({ message: 'Missing required fields: newName or userEmail' });
    }

    const decodedName = decodeURIComponent(name).trim();
    const normalizedNewName = newName.trim();
    const normalizedUserEmail = userEmail.trim();

    let updateResult;

    if (type === 'city') {
      updateResult = await Location.update(
        { city: normalizedNewName },
        {
          where: {
            city: decodedName,
            userEmail: normalizedUserEmail
          }
        }
      );
    } else if (type === 'country') {
      updateResult = await Location.update(
        { country: normalizedNewName },
        {
          where: {
            country: decodedName,
            userEmail: normalizedUserEmail
          }
        }
      );
    } else {
      return res.status(400).json({ message: 'Invalid type. Must be city or country.' });
    }

    const [updatedCount] = updateResult;

    if (!updatedCount) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.status(200).json({ message: `${type} updated successfully`, updatedCount });
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

    const decodedName = decodeURIComponent(name).trim();

    const location = await Location.findOne({
      where: {
        location_name: decodedName,
        userEmail: userEmail.trim()
      }
    });

    if (!location) {
      return res.status(404).json({ message: 'Place not found' });
    }

    location.location_name = newName.trim();

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

// Delete city scoped by user
router.delete('/city/:city', async (req, res) => {
  const { city } = req.params;
  const { userEmail } = req.query;

  try {
    if (!userEmail) {
      return res.status(400).json({ message: 'userEmail is required' });
    }

    const deleted = await Location.destroy({
      where: {
        city: city.trim(),
        userEmail: userEmail.trim()
      }
    });

    if (!deleted) return res.status(404).json({ message: 'City not found' });
    res.status(200).json({ message: 'City deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete city', error: err.message });
  }
});

// Delete country scoped by user
router.delete('/country/:country', async (req, res) => {
  const { country } = req.params;
  const { userEmail } = req.query;

  try {
    if (!userEmail) {
      return res.status(400).json({ message: 'userEmail is required' });
    }

    const deleted = await Location.destroy({
      where: {
        country: country.trim(),
        userEmail: userEmail.trim()
      }
    });

    if (!deleted) return res.status(404).json({ message: 'Country not found' });
    res.status(200).json({ message: 'Country deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete country', error: err.message });
  }
});

module.exports = router;