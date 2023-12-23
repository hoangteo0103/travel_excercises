// server.js
const express = require('express');
const bodyParser = require('body-parser');
const { filterOffers } = require('./offerFilter');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index', { defaultDate: '2019-12-25' });
});

app.post('/filter', async (req, res) => {
  const checkinDate = req.body.checkinDate || '2019-12-25';
  const selectedCategories = req.body.selectedCategories ? JSON.parse(req.body.selectedCategories) : [];
  const apiLink = req.body.apiLink;
  const useDefaultData = req.body.useDefaultData === 'true';

  try {
    const selectedOffers = await filterOffers(checkinDate, selectedCategories, apiLink, useDefaultData);
    res.json(selectedOffers);
   } catch (error) {
    const errorMessage = getErrorMessage(error);
    res.status(500).send(errorMessage);
  }
});

app.post('/filtered-offers', (req, res) => {
  try {
    const offers = req.body.offers ? JSON.parse(req.body.offers) : [];
    console.log(offers);
    res.render('output', { offers });
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    res.status(500).send(errorMessage);
  }
});

function getErrorMessage(error) {
  switch (error.message) {
    case 'No data source provided':
      return 'Please provide either an API link or select "Use Default Data".';
    case 'Error reading default data file':
      return 'Error reading the default data file. Make sure it exists and is readable.';
    case 'Error fetching data from API':
      return 'Error fetching data from the provided API link.';
    case 'No eligible offers found':
      return 'No eligible offers found based on the specified criteria.';
    case 'Not enough selected offers found':
      return 'Not enough eligible offers found to meet the selection criteria.';
    default:
      return 'An unexpected error occurred.';
  }
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
