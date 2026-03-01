// ***** DOM REFERENCES *****

// Search bar
const searchBar = document.getElementById('search-bar');

// Wordlist name
const wordlistName = document.getElementById('wordlist-name');

// Save button
const saveButton = document.getElementById('save');

// Delete button/menu
const deleteMenu = document.getElementById('delete-menu');
const deleteButton = document.getElementById('delete');
const deleteNoButton = document.getElementById('delete-no');
const deleteYesButton = document.getElementById('delete-yes');

// New wordlist menu
const newWordlistBtn = document.getElementById('new-wordlist-btn');
const newWordlistMenu = document.getElementById('new-wordlist-menu');
const newWordlistNameInput = document.getElementById('new-wordlist-name-input');
const newWordlistCreate = document.getElementById('new-wordlist-create');
const newWordlistLanguage = document.getElementById('new-wordlist-language');
const newWordlistLanguageDisplay = document.getElementById('new-wordlist-language-display');

// Settings button/menu
const settingsButton = document.getElementById('settings');
const settingsMenu = document.getElementById('settings-menu');
const settingsSave = document.getElementById('settings-save');

// Containers
const wordlistsContainer = document.getElementById('wordlists-container');
const searchResultsContainer = document.getElementById('search-result-container');
const wordlistWordContainer = document.getElementById('wordlist-words-container');

// Builds the settings menu UI dynamically from SETTINGS schema
function buildSettingsMenu() {
    const container = document.getElementById('settings-fields');
    if (!container) return;
    const current = settingsManager.load();
    container.innerHTML = '';

    SETTINGS.forEach(s => {
        const row = document.createElement('div');
        row.classList.add('settings-row');

        const label = document.createElement('label');
        label.textContent = s.label;
        label.setAttribute('for', `setting-${s.id}`);
        row.appendChild(label);

        let input;
        if (s.type === 'select') {
            input = document.createElement('select');
            input.classList.add('neu-input');
            s.options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = opt.label;
                if (current[s.id] === opt.value) option.selected = true;
                input.appendChild(option);
            });
        } else if (s.type === 'number') {
            input = document.createElement('input');
            input.classList.add('neu-input');
            input.type = 'number';
            input.min = s.min;
            input.max = s.max;
            input.value = current[s.id];
        } else if (s.type === 'toggle') {
            input = document.createElement('input');
            input.type = 'checkbox';
            input.classList.add('neu-toggle');
            input.checked = current[s.id];
        }

        input.id = `setting-${s.id}`;
        row.appendChild(input);
        container.appendChild(row);
    });
}

// Reads current values from the settings menu UI and saves them
function saveSettings() {
    const values = {};
    SETTINGS.forEach(s => {
        const input = document.getElementById(`setting-${s.id}`);
        if (!input) return;
        if (s.type === 'toggle') {
            values[s.id] = input.checked;
        } else if (s.type === 'number') {
            values[s.id] = Number(input.value);
        } else {
            values[s.id] = input.value;
        }
    });
    settingsManager.save(values);
    notify('Settings saved', 'success');
    closeMenu();
}

// ***** WORDLIST *****

let wordlist;

// ***** LANGUAGE REGISTRY *****

const languageRegistry = {
    japanese: JapaneseWordlist,
    english: null,
    french: null,
};

const languageIds = Object.keys(languageRegistry);
let selectedLanguageId = languageIds[0];

function setLanguageDisplay(languageId) {
    selectedLanguageId = languageId;
    newWordlistLanguageDisplay.textContent =
        languageId.charAt(0).toUpperCase() + languageId.slice(1);
}

function cycleLanguage() {
    const currentIndex = languageIds.indexOf(selectedLanguageId);
    const nextIndex = (currentIndex + 1) % languageIds.length;
    setLanguageDisplay(languageIds[nextIndex]);
}

// ***** WORDLIST MANAGEMENT *****

function createWordlist(languageId, name = '', words = []) {
    const WordlistClass = languageRegistry[languageId];
    if (!WordlistClass) throw new Error(`Unknown language: ${languageId}`);
    return new WordlistClass(name, words);
}

function newWordlist(languageId) {
    wordlist = createWordlist(languageId);
    wordlistName.value = '';
    wordlistWordContainer.innerHTML = '';
}

function loadWordlist(name) {
    const loaded = window.wordlistAPI.load(name);
    if (!loaded) return;
    wordlist = createWordlist(loaded.languageId ?? 'japanese', loaded.name, loaded.words);
    wordlistName.value = wordlist.name;
    createAllWordlistCards(wordlist.words);
}

function saveWordlist() {
    const name = wordlistName.value.trim();
    if (!name) {
        notify('Please enter a wordlist name', 'warn');
        return;
    }
    wordlist.name = name;
    wordlist.save();
    notify(`Wordlist "${name}" saved`, 'success');
    refreshSidebar();
}

function deleteWordlist() {
    const name = wordlist.name;
    window.wordlistAPI.delete(name);
    notify(`Wordlist "${name}" deleted`, 'info');
    newWordlist(selectedLanguageId);
    refreshSidebar();
}

// ***** SIDEBAR *****

function refreshSidebar() {
    wordlistsContainer.innerHTML = '';
    const names = window.wordlistAPI.getNames();

    names.forEach(name => {
        const el = document.createElement('div');
        el.classList.add('wordlist-button');
        el.innerHTML = `<span>${name}</span>`;
        el.addEventListener('click', () => loadWordlist(name));
        wordlistsContainer.appendChild(el);
    });
}

// ***** SEARCH *****

async function searchSubmit() {
    const value = searchBar.value.trim();
    if (!value) {
        notify('Please enter a search term', 'warn');
        return;
    }
    searchBar.value = '';

    const resultLimit = settingsManager.get('resultLimit');
    const results = await Promise.all(value.split(' ').map(w => wordlist.search(w, resultLimit)));
    const wordDataArray = results.filter(Boolean).flat();

    if (wordDataArray.length > 0) {
        createAllSearchCards(wordDataArray);
    }
}

// ***** CARD RENDERING *****

function createAllSearchCards(dataArray) {
    searchResultsContainer.innerHTML = '';
    dataArray.forEach(appendNewSearchCard);
}

function createAllWordlistCards(dataArray) {
    wordlistWordContainer.innerHTML = '';
    dataArray.forEach(appendNewWordlistCard);
}

function appendNewSearchCard(data) {
    const el = wordlist.buildCard(data);
    el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const added = wordlist.addWord(data);
        if (added) {
            appendNewWordlistCard(data);
            notify(`"${data.word}" added to wordlist`, 'success');
        } else {
            notify(`"${data.word}" is already in the wordlist`, 'warn');
        }
    });
    searchResultsContainer.append(el);
}

function appendNewWordlistCard(data) {
    const el = wordlist.buildCard(data);
    el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        wordlist.removeWord(data);
        el.remove();
        notify(`"${data.word}" removed from wordlist`, 'info');
    });
    wordlistWordContainer.append(el);
}

// ***** LOGIC FOR OPENING/CLOSING MENUS *****

let menuToClose = null;

function openMenu(menu) {
    closeMenu();
    menuToClose = menu;
    menuToClose.classList.add('open');
}

function closeMenu() {
    menuToClose?.classList.remove('open');
    menuToClose = null;
}

// ***** EVENT LISTENERS *****

// Keybinds
document.addEventListener('keydown', (e) => {
    if (e.key === '/') {
        e.preventDefault();
        searchBar.focus();
    }
    if (e.key === 'Escape') {
        searchBar.blur();
        closeMenu();
    }
});

// Close menu when clicking outside of it or on another menu button
document.addEventListener('click', (e) => {
    if (!menuToClose) return;
    if (e.target.closest('.menu.open')) return;
    if (e.target.closest('#delete, #new-wordlist-btn, #settings')) return;
    closeMenu();
}, true);

// Search
searchBar.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchSubmit();
});

// Delete button/menu
deleteButton.addEventListener('click', () => {
    if (!wordlist?.name) {
        notify('No wordlist selected to delete', 'warn');
        return;
    }
    openMenu(deleteMenu);
});

deleteNoButton.addEventListener('click', () => {
    closeMenu();
});

deleteYesButton.addEventListener('click', () => {
    deleteWordlist();
    closeMenu();
});

// Save
saveButton.addEventListener('click', saveWordlist);

// New wordlist menu
newWordlistBtn.addEventListener('click', () => {
    openMenu(newWordlistMenu);
});

newWordlistCreate.addEventListener('click', () => {
    const name = newWordlistNameInput.value.trim();
    if (!name) {
        notify('Please enter a wordlist name', 'warn');
        return;
    }
    if (!languageRegistry[selectedLanguageId]) {
        notify(`${selectedLanguageId} is not supported yet`, 'warn');
        return;
    }
    newWordlist(selectedLanguageId);
    wordlistName.value = name;
    wordlist.name = name;
    newWordlistNameInput.value = '';
    closeMenu();
    notify(`New ${selectedLanguageId} wordlist "${name}" created`, 'success');
});

newWordlistLanguage.addEventListener('click', () => {
    cycleLanguage();
});

// Settings button/menu
settingsButton.addEventListener('click', () => {
    buildSettingsMenu();
    openMenu(settingsMenu);
});

settingsSave.addEventListener('click', () => {
    saveSettings();
});

// ***** INIT *****

const defaultLanguage = settingsManager.get('defaultLanguage');
setLanguageDisplay(defaultLanguage);
refreshSidebar();
newWordlist(defaultLanguage);
