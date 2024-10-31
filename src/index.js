/**
 * Gefið efni fyrir verkefni 9, ekki er krafa að nota nákvæmlega þetta en nota
 * verður gefnar staðsetningar.
 */

import { el, empty } from './lib/elements.js';
import { weatherSearch } from './lib/weather.js';

/**
 * @typedef {Object} SearchLocation
 * @property {string} title
 * @property {number} lat
 * @property {number} lng
 */

/**
 * Allar staðsetning sem hægt er að fá veður fyrir.
 * @type Array<SearchLocation>
 */
const locations = [
  {
    title: 'Reykjavík',
    lat: 64.1355,
    lng: -21.8954,
  },
  {
    title: 'Akureyri',
    lat: 65.6835,
    lng: -18.0878,
  },
  {
    title: 'New York',
    lat: 40.7128,
    lng: -74.006,
  },
  {
    title: 'Tokyo',
    lat: 35.6764,
    lng: 139.65,
  },
  {
    title: 'Sydney',
    lat: 33.8688,
    lng: 151.2093,
  },
];

/**
 * Hreinsar fyrri niðurstöður, passar að niðurstöður séu birtar og birtir element.
 * @param {Element} element
 */
function renderIntoResultsContent(element) {
  const outputElement = document.querySelector('.output');

  if (!outputElement) {
    console.warn('fann ekki .output');
    return;
  }

  empty(outputElement);

  outputElement.appendChild(element);
}

/**
 * Birtir niðurstöður í viðmóti.
 * @param {SearchLocation} location
 * @param {Array<import('./lib/weather.js').Forecast>} results
 */

function renderResults(location, results) {
  
  const resultsTable = el('table', { class: 'forecast' });
  const header = document.createElement('thead');
  const headerRow = el('tr', {},
    el('th', {}, 'Tími'),
    el('th', {}, 'Hiti (°C)'),
    el('th', {}, 'Úrkoma (mm)')
  );
  header.appendChild(headerRow);
  resultsTable.appendChild(header); 

  const body = document.createElement('tbody');
  results.forEach((forecast) => {
    const time = forecast.time.split('T')[1].slice(0, 5); 
    const row = el('tr', {},
      el('td', {}, time),
      el('td', {}, forecast.temperature.toFixed(1)),
      el('td', {}, forecast.precipitation.toFixed(1))
    );
    body.appendChild(row); 
  });
  resultsTable.appendChild(body); 

  const locationName = el('h3', {}, location.title);
  const locationInfo = el(
    'p',
    {},
    `Spá fyrir daginn á breiddargráðu ${location.lat} og lengdargráðu ${location.lng}`
  );

    renderIntoResultsContent(
    el(
      'section',
      {},
      el('h2', {}, `Niðurstöður`),
      locationName,
      locationInfo,
      resultsTable
    )
  );
}



/**
 * Birta villu í viðmóti.
 * @param {Error} error
 */
function renderError(error) {
  console.log(error);
  const message = error.message;
  renderIntoResultsContent(el('p', {}, `Villa: ${message}`));
  
}


/**
 * Birta biðstöðu í viðmóti.
 */
function renderLoading() {

  /// Frá fyrirlestum:
  //console.log('render loading')
  //const outputElement = document.querySelector('.output')
  //if (outputElement){
  //outputElement.textContent('Leita...')
  //} else {
  //console.warn('fann ekki .output');
//}

  renderIntoResultsContent(el('p', {}, 'Leita...'));

  /**
 * Birta villu í viðmóti.
 * @param {Error} error
 */



}




/**
 * Framkvæmir leit að veðri fyrir gefna staðsetningu.
 * Birtir biðstöðu, villu eða niðurstöður í viðmóti.
 * @param {SearchLocation} location Staðsetning sem á að leita eftir.
 */
async function onSearch(location) {
  renderLoading(); //Birtir loading state

  let results;
  try {
    results = await weatherSearch(location.lat, location.lng);
  } catch (error) {
    renderError(error);
    return;
  }

  renderResults(location, results ?? []);

  // TODO útfæra
  // Hér ætti að birta og taka tillit til mismunandi staða meðan leitað er.
}

/**
 * Framkvæmir leit að veðri fyrir núverandi staðsetningu.
 * Biður notanda um leyfi gegnum vafra.
 */
async function onSearchMyLocation() {
  // TODO útfæra;
  
  
  if (!navigator.geolocation) {
    renderError(new Error("Villa...."));
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      onSearch({ title: 'Núverandi staðsetning', lat: latitude, lng: longitude });
    },
    () => {
      renderError(new Error("Ekki tókst að sækja staðsetningu"));
    }
  );
}

/**
 * Býr til takka fyrir staðsetningu.
 * @param {string} locationTitle
 * @param {() => void} onSearch
 * @returns {HTMLElement}
 */
function renderLocationButton(locationTitle, onSearch) {
  // Notum `el` fallið til að búa til element og spara okkur nokkur skref.
  const locationElement = el(
    'li',
    { class: 'locations__location' },
    el(
      'button',
      { class: 'locations__button', click: onSearch },
      locationTitle,
    ),
  );

  /* Til smanburðar við el fallið ef við myndum nota DOM aðgerðir
  const locationElement = document.createElement('li');
  locationElement.classList.add('locations__location');
  const locationButton = document.createElement('button');
  locationButton.appendChild(document.createTextNode(locationTitle));
  locationButton.addEventListener('click', onSearch);
  locationElement.appendChild(locationButton);
  */

  return locationElement;
}

/**
 * Býr til grunnviðmót: haus og lýsingu, lista af staðsetningum og niðurstöður (falið í byrjun).
 * @param {Element} container HTML element sem inniheldur allt.
 * @param {Array<SearchLocation>} locations Staðsetningar sem hægt er að fá veður fyrir.
 * @param {(location: SearchLocation) => void} onSearch
 * @param {() => void} onSearchMyLocation
 */


function render(container, locations, onSearch, onSearchMyLocation) {
  const parentElement = document.createElement('main');
  parentElement.classList.add('weather');

  const headerElement = document.createElement('header');
  const heading = document.createElement('h1');
  heading.appendChild(document.createTextNode('☀️Veðrið🌧️'));
  headerElement.appendChild(heading);
  parentElement.appendChild(headerElement);

  const introText = document.createElement('p');
  introText.textContent = 'Veldu stað til að sjá hita- og úrkomuspá.'; 
  headerElement.appendChild(introText);

  const locationHeading = document.createElement('h2');
  locationHeading.textContent = 'Staðsetningar';
  locationHeading.style.fontWeight = 'bold'; 
  locationHeading.style.fontSize = '2 rem'; 
  headerElement.appendChild(locationHeading);

  const locationsElement = document.createElement('div');
  locationsElement.classList.add('locations');

  const locationsListElement = document.createElement('ul');
  locationsListElement.classList.add('locations__list');
  locationsElement.appendChild(locationsListElement);

  const myLocationButton = renderLocationButton(
    'Mín staðsetning (þarf leyfi)',
    onSearchMyLocation
  );
  locationsListElement.appendChild(myLocationButton);

  for (const location of locations) {
    const liButtonElement = renderLocationButton(location.title, () => {
      onSearch(location);
    });
    locationsListElement.appendChild(liButtonElement);
  }

  parentElement.appendChild(locationsElement);

  const outputElement = document.createElement('div');
  outputElement.classList.add('output');
  parentElement.appendChild(outputElement);

  container.appendChild(parentElement);
}


// Þetta fall býr til grunnviðmót og setur það í `document.body`
render(document.body, locations, onSearch, onSearchMyLocation);
