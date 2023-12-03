const fs = require('fs');
const moment = require('moment');
const geolib = require('geolib');

// Step 1: Read and Parse the Input JSON
const inputFilePath = 'input.json';
const outputFilePath = 'output.json';

const rawData = fs.readFileSync(inputFilePath);
const inputData = JSON.parse(rawData);

// Step 2: Accept Customer Check-in Date
const checkinDate = process.argv[2]; // Accept as a command-line argument
const formattedCheckinDate = moment(checkinDate).format('YYYY-MM-DD');

// Step 3: Filter Offers
const categoryMapping = {
    Restaurant: 1,
    Retail: 2,
    Hotel: 3,
    Activity: 4,
  };
  
  const eligibleCategories = [categoryMapping.Restaurant, categoryMapping.Retail, categoryMapping.Activity];
  const eligibleOffers = inputData.offers
    .filter(offer =>
      eligibleCategories.includes(offer.category) &&
      moment(offer.valid_to).isSameOrAfter(moment(formattedCheckinDate).add(5, 'days'))
    )
    .map(offer => {
      const closestMerchant = offer.merchants.reduce((closest, current) =>
        current.distance < closest.distance ? current : closest
      );
      return { ...offer, merchants: [closestMerchant] };
    })
    .sort((a, b) => a.merchants[0].distance < b.merchants[0].distance);
  
// Select 2 offers with different categories
const selectedOffers = [];
for(const offer of eligibleOffers) {
    console.log(offer.merchants[0].distance);
}
for (const currentOffer of eligibleOffers) {
  if (selectedOffers.length < 2 && !selectedOffers.some(offer => offer.category === currentOffer.category)) {
    selectedOffers.push(currentOffer);
  }
}

// Step 4: Write the Output JSON
const outputData = { offers: selectedOffers };
fs.writeFileSync(outputFilePath, JSON.stringify(outputData, null, 2));

console.log('Filtered offers saved to output.json');
