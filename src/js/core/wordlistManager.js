import LanguageRegistry from "../languages/languageRegistry.js";

class WordlistManager {
  constructor() {
    const WordlistClass = LanguageRegistry.getWordlistClassByID("japanese"); // Update to settings default once settings are implemented !!
    this.currentList = new WordlistClass();
  }

  newWordlist() {
    const WordlistClass = LanguageRegistry.getWordlistClassByID("japanese"); // HARD CODED TILL SETTINGS ARE IMPLEMENTED
    this.currentList = new WordlistClass("", []);
  }

  loadWordlist(name) {
    const loaded = window.wordlistAPI.load(name);
    if (!loaded) return;
    const WordlistClass = LanguageRegistry.getWordlistClassByID(
      loaded.languageId,
    );
    this.currentList = new WordlistClass(loaded.name, loaded.words);
  }

  saveWordlist(name) {
    this.currentList.name = name;
    this.currentList.save();
  }

  getCard(data) {
    return this.currentList.buildCard(data);
  }

  /*
   * For mapping current wordlist words to cards in bulk(mainly for loading a wordlist)
   */
  mapWordsToCards() {
    return this.currentList.words.map((data) => {
      const card = this.getCard(data);
      card.dataset.action = "remove-word";
      return card;
    });
  }

  /*
   * For searching and making a section for each value
   */
  async searchAndMap(values) {
    const array = [];

    await Promise.all(
      values.map(async (value) => {
        const results = await this.currentList.search(value);

        const header = document.createElement("h3");
        header.classList.add("search-header");
        header.textContent = value;
        array.push(header);

        const wordContainer = document.createElement("div");
        wordContainer.classList.add("word-container");
        wordContainer.classList.add("search");
        array.push(wordContainer);

        if (results) {
          results.forEach((data) => {
            const card = this.getCard(data);
            card.dataset.action = "add-word";
            wordContainer.appendChild(card);
          });
        }
      }),
    );

    return array;
  }
}

export default new WordlistManager();
