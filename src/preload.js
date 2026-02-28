const { contextBridge } = require('electron');
const fs = require('fs');
const path = require('path');

const userDataPath = process.argv.find(a => a.startsWith('--userDataPath=')).split('=')[1];
const WORDLIST_FILE = path.join(userDataPath, 'wordlists.json');
const SETTINGS_FILE = path.join(userDataPath, 'settings.json');

function readFile() {
    if (!fs.existsSync(WORDLIST_FILE)) return {};
    return JSON.parse(fs.readFileSync(WORDLIST_FILE, 'utf-8'));
}

// Wordlist api
contextBridge.exposeInMainWorld('wordlistAPI', {
    getNames: () => {
        const wordlists = readFile();
        return Object.keys(wordlists);
    },
    save: (wordlist) => {
        const wordlists = readFile();
        wordlists[wordlist.name] = wordlist;
        fs.writeFileSync(WORDLIST_FILE, JSON.stringify(wordlists, null, 2));
    },
    load: (name) => {
        const wordlists = readFile();
        return wordlists[name] ?? null;
    },
    delete: (name) => {
        const wordlists = readFile();
        delete wordlists[name];
        fs.writeFileSync(WORDLIST_FILE, JSON.stringify(wordlists, null, 2));
    }
});

// Settings api
contextBridge.exposeInMainWorld('settingsAPI', {
    load: () => {
        if (!fs.existsSync(SETTINGS_FILE)) return {};
        return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    },
    save: (settings) => {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    },
});
