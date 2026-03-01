// ***** DOM REFERENCES *****

// Save button
const saveButton;

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

// Containers

// ***** WORDLIST *****

let wordlist;

// ***** LANGUAGE REGISTRY && WORDLIST MANAGEMENT *****

const languageRegistry = {
    japanese: JapaneseWordlist,
    english: null,
    french: null,
};

function createWordlist(languageId, name = '', words = []) {
    const WordlistClass = languageRegistry[languageId];
    if (!WordlistClass) throw new Error(`Unknown language: ${languageId}`);
    return new WordlistClass(name, words);
}

function newWordlist(languageId) {
    wordlist = createWordlist(languageId);
    wordlistNameInput.value = '';
    wordlistWordsContainer.innerHTML = '';
}

function loadWordlist(name) {
    const loaded = window.wordlistAPI.load(name);
    if (!loaded) return;
    wordlist = createWordlist(loaded.languageId ?? 'japanese', loaded.name, loaded.words);
    wordlistNameInput.value = wordlist.name;
    createAllWordlistCards(wordlist.words);
}

function saveWordlist() {
    const name = wordlistNameInput.value.trim();
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
}

// ***** SIDEBAR *****

function refreshSidebar() {
    sidebarWordlistContainer.innerHTML = '';
    const names = window.wordlistAPI.getNames();

    names.forEach(name => {
        const el = document.createElement('div');
        el.classList.add('wordlist-button');
        el.innerHTML = `<span>${name}</span>`;
        el.addEventListener('click', () => loadWordlist(name));
        sidebarWordlistContainer.appendChild(el);
    });
}

// ***** SEARCH *****

async function searchSubmit() {
    const value = searchInput.value.trim();
    if (!value) {
        notify('Please enter a search term', 'warn');
        return;
    }
    searchInput.value = '';

    const results = await Promise.all(value.split(' ').map(w => wordlist.search(w)));
    const wordDataArray = results.filter(Boolean).flat();

    if (wordDataArray.length > 0) {
        createAllSearchCards(wordDataArray);
    }
}

// ***** CARD RENDERING *****

function createAllSearchCards(dataArray) {
    searchResultContainer.innerHTML = '';
    dataArray.forEach(appendNewSearchCard);
}

function createAllWordlistCards(dataArray) {
    wordlistWordsContainer.innerHTML = '';
    dataArray.forEach(appendNewWordlistCard);
}

function appendNewSearchCard(data) {
    const el = wordlist.buildCard(data);
    el.addEventListener('contextmenu', () => {
        const added = wordlist.addWord(data);
        if (added) {
            appendNewWordlistCard(data);
            notify(`"${data.word}" added to wordlist`, 'success');
        } else {
            notify(`"${data.word}" is already in the wordlist`, 'warn');
        }
    });
    searchResultContainer.append(el);
}

function appendNewWordlistCard(data) {
    const el = wordlist.buildCard(data);
    el.addEventListener('contextmenu', () => {
        wordlist.removeWord(data);
        el.remove();
        notify(`"${data.word}" removed from wordlist`, 'info');
    });
    wordlistWordsContainer.append(el);
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
        searchInput.focus();
    }
    if (e.key === 'Escape') {
        searchInput.blur();
        closeOverlay();
    }
});

// Event that closes current menu when clicking another menu button or outside of current menu
document.addEventListener('click', (e) => {
    if (!menuToClose) return;
    if (e.target.closest('.menu.open')) return;
    if (e.target.closest('#delete, #new-wordlist-btn')) return;
    closeMenu();
}, true);

// Search input
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchSubmit();
});

// Delete buttons/menu
deleteButton.addEventListener('click', () => {
    openMenu(deleteMenu);
});

deleteNoButton.addEventListener('click', () => {
    closeMenu();
});

deleteYesButton.addEventListener('click', () => {
    // TODO: confirm delete — delete the current wordlist
});

// Save button
saveButton.addEventListener('click', saveWordlist);

// New wordlist menu
newWordlistBtn.addEventListener('click', () => {
    openMenu(newWordlistMenu);
});

newWordlistCreate.addEventListener('click', () => {
    // TODO: create a new wordlist using newWordlistNameInput.value and selected language
});

newWordlistLanguage.addEventListener('click', () => {
    // TODO: open language picker / cycle through languages
});


deleteButton.addEventListener('click', () => {
    if (!wordlist.name) {
        notify('No wordlist selected to delete', 'warn');
        return;
    }
    openMenu(menuContainer, 'confirmDeletion')
});
newWordlistButton.addEventListener('click', () => openMenu(menuContainer, 'newWordlist'));
settingsButton.addEventListener('click', () => openMenu(menuContainer, 'settings'));
overlay.addEventListener('click', () => closeOverlay());

// ***** INIT *****

refreshSidebar();
newWordlist(settingsManager.get('defaultLanguage'));
