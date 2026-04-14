// these change the name of the site (at the top

var sitename = "fanter beta."; // Change this to change the name of your website.

var subtext = "v0.2, games not added, styling incomplete. :3"; // set the subtext

// more settings in main.css


// end of config
// only change this if you know what your doing - a wise man
// also if you're a beginner coder, use this code to study or something; this code is pretty good 
// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

var serverUrl1 = "https://gms.parcoil.com";
var currentPageTitle = document.title;
document.title = `${currentPageTitle} | ${sitename}`;
let gamesData = [];

function getFavourites() {
  return JSON.parse(localStorage.getItem("favourites") || "[]");
}

function toggleFavourite(gameName) {
  let favs = getFavourites();
  if (favs.includes(gameName)) {
    favs = favs.filter(f => f !== gameName);
  } else {
    favs.push(gameName);
  }
  localStorage.setItem("favourites", JSON.stringify(favs));
}

function displayFilteredGames(filteredGames) {
  const gamesContainer = document.getElementById("gamesContainer");
  gamesContainer.innerHTML = "";
  filteredGames.forEach((game) => {
    const gameDiv = document.createElement("div");
    gameDiv.classList.add("game");
    const gameImage = document.createElement("img");
    let imageSrc;
    if (game.image.startsWith('http')) {
      imageSrc = game.image;
    } else {
      imageSrc = `${serverUrl1}/${game.url}/${game.image}`;
    }
    gameImage.src = imageSrc;
    gameImage.alt = game.name;
    gameImage.onclick = () => {
      if (game.url.startsWith('http')) {
        window.location.href = game.url;
      } else {
        window.location.href = `play.html?gameurl=${game.url}/`;
      }
    };
    const gameName = document.createElement("p");
    gameName.textContent = game.name;
    const favBtn = document.createElement("button");
    favBtn.classList.add("fav-btn");
    favBtn.textContent = getFavourites().includes(game.name) ? "★" : "☆";
    favBtn.title = "favourite";
    favBtn.onclick = (e) => {
      e.stopPropagation();
      toggleFavourite(game.name);
      favBtn.textContent = getFavourites().includes(game.name) ? "★" : "☆";
    };
    gameDiv.appendChild(gameImage);
    gameDiv.appendChild(gameName);
    gameDiv.appendChild(favBtn);
    gamesContainer.appendChild(gameDiv);
  });
}

function handleSearchInput() {
  const searchInputValue = document
    .getElementById("searchInput")
    .value.toLowerCase();
  let filteredGames;
  const favFilterOn = localStorage.getItem("favFilter") === "true";
  if (favFilterOn) {
    const favs = getFavourites();
    filteredGames = gamesData.filter((game) =>
      favs.includes(game.name) &&
      game.name.toLowerCase().includes(searchInputValue)
    );
  } else {
    filteredGames = gamesData.filter((game) =>
      game.name.toLowerCase().includes(searchInputValue)
    );
  }
  displayFilteredGames(filteredGames);
}

function toggleFavSidebar() {
  const btn = document.getElementById("favSidebarBtn");
  const favFilterOn = localStorage.getItem("favFilter") === "true";
  btn.classList.toggle("active", !favFilterOn);
  btn.textContent = !favFilterOn ? "✕" : "★";

  if (!favFilterOn) {
    const favs = getFavourites();
    const allCards = document.querySelectorAll(".game");
    const searchBar = document.getElementById("searchInput");
    const searchRect = searchBar.getBoundingClientRect();

    let delay = 0;

    allCards.forEach((card) => {
      const isFaved = favs.includes(card.querySelector("p").textContent);
      if (!isFaved) {
        const cardRect = card.getBoundingClientRect();

        const clone = card.cloneNode(true);
        clone.style.position = "fixed";
        clone.style.left = cardRect.left + "px";
        clone.style.top = cardRect.top + "px";
        clone.style.width = cardRect.width + "px";
        clone.style.height = cardRect.height + "px";
        clone.style.margin = "0";
        clone.style.zIndex = "999";
        clone.style.transition = `transform 0.3s ease ${delay}s, opacity 0.25s ease ${delay + 0.05}s`;
        clone.style.pointerEvents = "none";
        document.body.appendChild(clone);

        card.style.visibility = "hidden";

        const targetX = searchRect.left + searchRect.width / 2 - cardRect.left - cardRect.width / 2;
        const targetY = searchRect.top - cardRect.top;

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            clone.style.transform = `translate(${targetX}px, ${targetY}px) scale(0.2)`;
            clone.style.opacity = "0";
          });
        });

        setTimeout(() => {
          clone.remove();
        }, delay * 1000 + 400);

        delay += 0.04;
      }
    });

    setTimeout(() => {
      localStorage.setItem("favFilter", "true");
      handleSearchInput();
    }, delay * 1000 + 300);

  } else {
    localStorage.setItem("favFilter", "false");
    handleSearchInput();
  }
}

fetch("./config/games.json")
  .then((response) => response.json())
  .then((data) => {
    gamesData = data;
    handleSearchInput();
    const btn = document.getElementById("favSidebarBtn");
    if (btn && localStorage.getItem("favFilter") === "true") {
      btn.classList.add("active");
      btn.textContent = "✕";
    }
  })
  .catch((error) => console.error("Error fetching games:", error));

document
  .getElementById("searchInput")
  .addEventListener("input", handleSearchInput);
document.getElementById("title").innerHTML = `${sitename}`;
document.getElementById("subtitle").innerHTML = `${subtext}`;
window.toggleFavSidebar = toggleFavSidebar;
window.toggleFavFilter = toggleFavFilter;
