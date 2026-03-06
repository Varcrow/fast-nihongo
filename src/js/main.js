import WordlistManager from "./core/wordlistManager.js";
import SidebarUI from "./ui/sidebar.js";

const searchBar = document.getElementById("search-bar");
const wordlistWordsContainer = document.getElementById(
  "wordlist-words-container",
);
const searchResultsContainer = document.getElementById(
  "search-result-container",
);

document.addEventListener("click", (e) => {
  const target = e.target.closest("[data-action]");

  // Close menus on outside click
  if (
    !e.target.closest(".menu") &&
    !e.target.closest('[data-action="toggle-menu"]')
  ) {
    document
      .querySelectorAll(".menu.open")
      .forEach((m) => m.classList.remove("open"));
  }

  if (!target) return;

  const action = target.dataset.action;

  switch (action) {
    case "save-wordlist":
      if (SidebarUI.wordlistName.length > 0) {
        WordlistManager.saveWordlist(SidebarUI.wordlistName);
        SidebarUI.refreshSidebar();
      }
      break;

    case "load-wordlist":
      const name = target.dataset.name;
      SidebarUI.wordlistName = name;
      WordlistManager.loadWordlist(name);
      const cards = WordlistManager.mapWordsToCards();
      wordlistWordsContainer.innerHTML = "";
      cards.forEach((card) => {
        wordlistWordsContainer.append(card);
      });
      break;

    case "delete-wordlist":
      WordlistManager.currentList.delete();
      SidebarUI.wordlistName = "";
      SidebarUI.refreshSidebar();
      wordlistWordsContainer.innerHTML = "";
      WordlistManager.newWordlist();
      break;

    case "add-word":
      const word = JSON.parse(target.dataset.word);
      if (WordlistManager.currentList.addWord(word)) {
        let card = WordlistManager.getCard(word);
        card.dataset.action = "remove-word";
        wordlistWordsContainer.append(card);
      }
      break;

    case "remove-word":
      break;

    case "toggle-menu":
      const menuId = target.dataset.target;
      document.getElementById(menuId).classList.toggle("open");
      break;

    case "close-menu":
      document.getElementById(target.dataset.target).classList.remove("open");
      break;
  }
});

searchBar.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    const values = searchBar.value.trim().split(" ").filter(Boolean);
    searchBar.value = "";
    if (!values.length) return;

    const sections = await WordlistManager.searchAndMap(values);
    searchResultsContainer.innerHTML = "";
    sections.forEach((el) => searchResultsContainer.appendChild(el));
  }
});
