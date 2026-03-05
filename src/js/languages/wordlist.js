export default class Wordlist {
    constructor(languageId, name = '', words = []) {
        this.languageId = languageId;
        this.name = name;
        this.words = words;
    }

    save() {
        window.wordlistAPI.save(this);
    }

    delete() {
        window.wordlistAPI.delete(this.name);
    }

    addWord(data) {
        if (this.containsWord(data)) return false;
        this.words.push(data);
        return true;
    }

    async search(word) {
        throw new Error(`${this.constructor.name} must implement search()`);
    }

    removeWord(data) {
        throw new Error(`${this.constructor.name} must implement removeWord()`);
    }

    containsWord(data) {
        throw new Error(`${this.constructor.name} must implement containsWord()`);
    }

    trim(data) {
        throw new Error(`${this.constructor.name} must implement trim()`);
    }

    buildCard(data) {
        throw new Error(`${this.constructor.name} must implement buildCard()`);
    }
}
