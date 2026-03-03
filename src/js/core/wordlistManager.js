import LanguageRegistry from '../languages/languageRegistry.js'

class WordlistManager {
    constructor() {
        const WordlistClass = LanguageRegistry.getWordlistClassByID('japanese'); // Update to settings default once settings are implemented !!
        this.currentList = new WordlistClass();
    }

    loadWordlist(name) {
        const loaded = window.wordlistAPI.load(name);
        if (!loaded) return;
        const WordlistClass = LanguageRegistry.getWordlistClassByID(loaded.languageId);
        this.currentList = new WordlistClass(loaded.name, loaded.words);
    }

    saveWordlist(name) {
        this.currentList = name;
        this.currentList.save();
    }

    getCard(data) {
        return this.currentList.buildCard(data);
    }

    /*
     * For mapping current wordlist words to cards in bulk(mainly for loading a wordlist)
     */
    mapWordsToCards() {
        return this.currentList.words.map(data => {
            const card = this.getCard(data);
            card.dataset.rightClick = 'delete-card';
            return card;
        });
    }

    /*
     * For searching and making a section for each value
     */
    async searchAndMap(values) {
        const searches = values.map(async value => {
            const results = await this.currentList.search(value);

            const section = document.createElement('div');
            const header = document.createElement('h2');
            header.textContent = value;
            section.appendChild(header);

            if (!results) return section; // still return header even if no results

            const container = document.createElement('div');
            container.classList.add('word-container');
            results.forEach(data => container.appendChild(this.getCard(data)));
            section.appendChild(container);

            return section;
        });

        return Promise.all(searches); // wait for all searches to finish
    }
}

export default new WordlistManager();
