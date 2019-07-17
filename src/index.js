import './index.scss';
import '@babel/polyfill';
import axios from 'axios';
import API_KEY from './env';
import webpackimg from './img/webpack-img.jpg'
// const img = document.createElement("img")
// img.src = webpackimg
// document.body.appendChild(img)
//
// let a = 3
// console.log(a);
// let test = () => console.log(123);
// test();
//
// let b = 5
// console.log(b)

// Helpful resources for promises and async/await:
// https://alligator.io/js/async-functions/ and https://www.codingame.com/playgrounds/347/javascript-promises-mastering-the-asynchronous/chaining-the-promises
async function getOnTV() {
  const promises = [];
  const response = await axios.get(`https://api.themoviedb.org/3/tv/on_the_air?api_key=${API_KEY}&language=en-US&page=1`); // this promise basically has resolve(result)
  const detailText = document.getElementsByClassName('detail-text');

  const totalDetailText = 3;
  for (let i = 0; i < totalDetailText; i += 1) {
    detailText[i].children[0].innerHTML = response.data.results[i].name;
    promises.push(axios.get(`https://api.themoviedb.org/3/tv/${response.data.results[i].id}?api_key=${API_KEY}&language=en-US`));
  }

  const totalSmallPic = 2;
  const smallPic = document.querySelectorAll('.small-pic img');
  for (let i = 0; i < totalSmallPic; i += 1) {
    smallPic[i].src = `https://image.tmdb.org/t/p/w300/${response.data.results[i + 1].backdrop_path}`;
  }

  const bigPic = document.querySelectorAll('.big-pic > img');
  bigPic[0].src = `https://image.tmdb.org/t/p/w500/${response.data.results[0].backdrop_path}`;
  // image sizes are avialible here: https://developers.themoviedb.org/3/configuration/get-api-configuration
  // note that :w500 and w1920 are also supported for backdrops (https://www.themoviedb.org/talk/53c11d4ec3a3684cf4006400)
  const detailPic = document.getElementsByClassName('detail-pic');
  detailPic[0].src = `https://image.tmdb.org/t/p/w185/${response.data.results[0].poster_path}`;

  const tvDetailResponses = await Promise.all(promises);
  for (let i = 0; i < totalDetailText; i += 1) {
    const nextAirDate = tvDetailResponses[i].data.next_episode_to_air.air_date;
    detailText[i].children[1].innerHTML = `Next episode: ${nextAirDate}`;
  }
}

async function getOnTheaters() {
  const promises = [];

  const response = await axios.get(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1`);
  const totalDetailText = 3;

  const title = document.querySelectorAll('.column:nth-child(2) .detail-text h2');
  let detailTextIndex = 2;
  for (let i = 0; i < totalDetailText; i += 1) {
    title[detailTextIndex].innerHTML = response.data.results[i].original_title;
    detailTextIndex -= 1;
    promises.push(axios.get(`https://api.themoviedb.org/3/movie/${response.data.results[i].id}/credits?api_key=${API_KEY}&language=en-US`));
  }

  let smallPicIndex = 0;
  const smallPic = document.querySelectorAll('.column:nth-child(2) .small-pic img');
  for (let i = 2; i > 0; i -= 1) {
    smallPic[smallPicIndex].src = `https://image.tmdb.org/t/p/w300/${response.data.results[i].backdrop_path}`;
    smallPicIndex += 1;
  }

  const bigPic = document.querySelectorAll('.big-pic > img');
  bigPic[1].src = `https://image.tmdb.org/t/p/w500/${response.data.results[0].backdrop_path}`;

  const detailPic = document.getElementsByClassName('detail-pic');
  detailPic[1].src = `https://image.tmdb.org/t/p/w185/${response.data.results[0].poster_path}`;

  const movieDetailResponses = await Promise.all(promises);
  const cast = document.querySelectorAll('.column:nth-child(2) .detail-text h4');
  let castIndex = 2;
  for (let i = 0; i < totalDetailText; i += 1) {
    cast[castIndex].innerHTML = `${movieDetailResponses[i].data.cast[0].name}, ${movieDetailResponses[i].data.cast[1].name}`;
    castIndex -= 1;
  }
}

async function getTrendingMovies() {
  const response = await axios.get('https://api.themoviedb.org/3/trending/movie/week?api_key=267f6c03dccb4096c3b41afeb9ac7d26');
  const trendingImage = document.getElementsByClassName('trending-img');
  const title = document.querySelectorAll('.trending-list li h3 ');
  const overview = document.querySelectorAll('.trending-list li p ');
  const totalImage = 3;
  for (let i = 0; i < totalImage; i += 1) {
    // console.log(`https://image.tmdb.org/t/p/154/${response.data.results[i].poster_path}`)
    trendingImage[i].src = `https://image.tmdb.org/t/p/w154/${response.data.results[i].poster_path}`;
    title[i].innerHTML = `${response.data.results[i].original_title}`;
    overview[i].innerHTML = `${response.data.results[i].overview}`;
  }
}

function loaderStatus() {
  Promise.all([getOnTV(), getOnTheaters(), getTrendingMovies()]).then(() => {
    document.getElementsByClassName('loader')[0].style.display = 'none';
  }).catch((error) => {
    console.log(error);
  });
}


loaderStatus();


function showResultsFromSearchBox() {
  window.addEventListener('click', (e) => {
    if (document.querySelector('.search-form > input').contains(e.target)) {
      document.getElementsByClassName('search-dropdown')[0].style.display = 'block';
    } else {
      document.getElementsByClassName('search-dropdown')[0].style.display = 'none';
    }
  });

  window.addEventListener('scroll', () => {
    document.getElementsByClassName('search-dropdown')[0].style.display = 'none';
  });
}

showResultsFromSearchBox();

function getTrendingSearch() {
  axios.get(`https://api.themoviedb.org/3/trending/all/week?api_key=${API_KEY}`).then((response) => {
    const total = Math.min(response.data.results.length, 10);
    const list = document.querySelector('.search-dropdown > ul');
    console.log('trending search');
    for (let i = 0; i < total; i += 1) {
      const node = document.createElement('li');
      const text = document.createTextNode(`${response.data.results[i].original_title}`);
      node.appendChild(text);
      list.appendChild(node);
    }
  }).catch((error) => {
    console.log(error)
  });
}

getTrendingSearch();
function getDataForSearchBox() {

  // Retrieved from: https://schier.co/blog/2014/12/08/wait-for-user-to-stop-typing-using-javascript.html
  //  Get the input box
  const searchBox = document.querySelector('.search-form > input');

  // Init a timeout variable to be used below
  let timeout = null;

  // Listen for keystroke events
  searchBox.onkeyup = () => {
    // Clear the timeout if it has already been set.
    // This will prevent the previous task from executing
    // if it has been less than <MILLISECONDS>
    clearTimeout(timeout);

    // remove all child inside <ul>
    const list = document.querySelector('.search-dropdown > ul');
    const trendingSearchesHeader = document.querySelector('.search-dropdown > h1');
    trendingSearchesHeader.style.display = 'none';
    while (list.hasChildNodes()) {
      list.removeChild(list.firstChild);
    }

    // Make a new timeout set to go off in 800ms
    timeout = setTimeout(() => {
      if (searchBox.value !== '') {
        axios.get(`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&language=en-US
          &query=${searchBox.value}&page=1&include_adult=false`)
          .then((response) => {
            const total = Math.min(response.data.results.length, 10);

            for (let i = 0; i < total; i += 1) {
              const node = document.createElement('li');
              let text;
              if (response.data.results[i].media_type === 'movie') {
                text = document.createTextNode(`${response.data.results[i].title} (Movie)`);
              } else if (response.data.results[i].media_type === 'person') {
                text = document.createTextNode(`${response.data.results[i].name} (Person)`);
              } else {
                text = document.createTextNode(`${response.data.results[i].name} (Show)`);
              }
              node.appendChild(text);
              list.appendChild(node);
            }
          }).catch((error) => {
            console.log(error)
          });
      }
    }, 500);
  };
}

getDataForSearchBox();
