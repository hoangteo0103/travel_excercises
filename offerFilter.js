// offerFilter.js
const moment = require('moment');
const axios = require('axios');

async function filterOffers(checkinDate, selectedCategories, apiLink, useDefaultData) {
  let inputData;

  if (useDefaultData) {
    const rawData = require('./input.json');
    inputData = JSON.parse(JSON.stringify(rawData)); // Deep copy to avoid modifying the original data
  } else {
    try {
      const response = await axios.get(apiLink);
      inputData = response.data;
    } catch (error) {
      console.error('Error fetching data from API:', error.message);
      throw new Error('Error fetching data from API');
    }
  }

  const categoryMapping = {
    Restaurant: 1,
    Retail: 2,
    Hotel: 3,
    Activity: 4,
  };

  let eligibleCategories;

  if (selectedCategories.length > 0) {
    eligibleCategories = selectedCategories.map(category => categoryMapping[category]);
  } else {
    // If no categories are specified, include all categories
    eligibleCategories = [categoryMapping.Restaurant, categoryMapping.Hotel, categoryMapping.Activity];
  }

  const eligibleOffers = inputData.offers
    .filter(offer =>
      eligibleCategories.includes(offer.category) &&
      moment(offer.valid_to).isSameOrAfter(moment(checkinDate).add(5, 'days'))
    )
    .map(offer => {
      const closestMerchant = offer.merchants.reduce((closest, current) =>
        current.distance < closest.distance ? current : closest
      );
      return { ...offer, merchants: [closestMerchant] };
    })
    .sort((a, b) => a.merchants[0].distance < b.merchants[0].distance);

  const selectedOffers = [];
  for (const currentOffer of eligibleOffers) {
    if (selectedOffers.length < 2 && !selectedOffers.some(offer => offer.category === currentOffer.category)) {
      selectedOffers.push(currentOffer);
      if (selectedOffers.length === 2) {
        break;
      }
    }
  }

  return selectedOffers;
}

module.exports = { filterOffers };
