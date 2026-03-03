import { JapaneseWordlist } from "./japaneseWordlist.js";

class LanguageRegistry {
    constructor() {
        this.registry = {
            japanese: JapaneseWordlist,
            english: null,
            french: null,
        };
        this.languageIds = Object.keys(this.registry);
    }

    getLanguageIds() {
        return this.languageIds;
    }

    getWordlistClassByID(languageId) {
        return this.registry[languageId];
    }
}

export default new LanguageRegistry();
