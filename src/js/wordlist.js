class Wordlist {
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

class JapaneseWordlist extends Wordlist {
    constructor(name = '', words = []) {
        super('japanese', name, words);
    }
    async search(word) {
        try {
            const encodedKeyword = encodeURIComponent(word.trim());
            const url = `https://jisho.org/api/v1/search/words?keyword=${encodedKeyword}`;
            const response = await fetch(url);
            if (!response.ok) {
                notify(`HTTP error: ${response.status}`, 'error');
                return null;
            }
            const data = await response.json();
            if (!data.data || data.data.length === 0) {
                notify(`No results found for "${word}"`, 'warn');
                return null;
            }
            return data.data.map(d => this.trim(d)).filter(Boolean);
        } catch (err) {
            notify('Failed to reach Jisho — check your connection', 'error');
            console.error('Error:', err.message);
            return null;
        }
    }
    removeWord(data) {
        this.words = this.words.filter(
            w => !(w.word === data.word && w.reading === data.reading)
        );
    }
    containsWord(data) {
        return this.words.some(
            w => w.word === data.word && w.reading === data.reading
        );
    }
    trim(data) {
        if (!data.japanese?.length || !data.senses?.length) return null;
        return {
            word: data.japanese[0].word ?? 'N/A',
            reading: data.japanese[0].reading ?? 'N/A',
            level: data.jlpt[0] ?? 'N/A',
            meanings: data.senses[0].english_definitions?.join(', ') ?? 'N/A',
            partsOfSpeech: data.senses[0].parts_of_speech?.join(', ') ?? 'N/A',
        };
    }
    buildCard(data) {
        const el = document.createElement('div');
        el.classList.add('card');
        el.innerHTML = `
            <span class="card-word">${data.word}</span>
            <span class="card-level">${data.level}</span>
            <span class="card-reading">${data.reading}</span>
            <p class="card-meanings">${data.meanings}</p>
            <p class="card-pos">${data.partsOfSpeech}</p>
        `;
        return el;
    }
}
