import Wordlist from './wordlist.js'

export class JapaneseWordlist extends Wordlist {
    constructor(name = '', words = []) {
        super('japanese', name, words);
    }

    async search(word) {
        try {
            const encodedKeyword = encodeURIComponent(word.trim());
            const url = `https://jisho.org/api/v1/search/words?keyword=${encodedKeyword}`;
            const response = await fetch(url);
            if (!response.ok) {
                return null;
            }
            const data = await response.json();
            if (!data.data || data.data.length === 0) {
                return null;
            }
            return data.data.map(d => this.trim(d)).filter(Boolean);
        } catch (err) {
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
        el.classList.add('neu-card');
        el.classList.add('word-card');
        el.dataset.word = JSON.stringify(data);
        el.innerHTML = `
            <h2>${data.word}</h2>
            <h3>${data.level}</h3>
            <h3>${data.reading}</h3>
            <p>${data.meanings}</p>
            <p>${data.partsOfSpeech}</p>
        `;
        return el;
    }
}
