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

    saveWordlist() {
        this.currentList.save();
    }

    getCurrentWordlist() {
        return this.currentList;
    }
}

export default new WordlistManager();
