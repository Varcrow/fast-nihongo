/*
 * NOTE: anywhere newWordlist() is called right now is hard coded
 * for japanese until settings and default options are added.
 */

// ***** DOM REFERENCES *****

const overlay = document.getElementById('overlay');
const searchInput = document.getElementById('search-input');
const wordlistNameInput = document.getElementById('wordlist-name');
const settingsButton = document.getElementById('settings-button');
const saveButton = document.getElementById('save-button');
const deleteButton = document.getElementById('delete-button');
const newWordlistButton = document.getElementById('new-wordlist-button');
const searchResultContainer = document.getElementById('search-result-container');
const wordlistWordsContainer = document.getElementById('wordlist-words-container');
const sidebarWordlistContainer = document.getElementById('sidebar-wordlists');
const menuContainer = document.getElementById('menu-container');

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

// ***** MENU BUILDER *****

function buildMenu(container, menuDef) {
    container.innerHTML = '';

    const heading = document.createElement('h2');
    heading.textContent = menuDef.title;
    container.appendChild(heading);

    menuDef.fields.forEach(field => {
        const row = document.createElement('div');
        row.classList.add('menu-row');

        const label = document.createElement('label');
        label.textContent = field.label;

        let input;
        if (field.type === 'select') {
            input = document.createElement('select');
            field.optionsFrom().forEach(opt => {
                const el = document.createElement('option');
                el.value = opt.value;
                el.textContent = opt.label;
                el.selected = opt.value === field.defaultFrom();
                input.appendChild(el);
            });
        } else if (field.type === 'toggle') {
            input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = field.defaultFrom();
        } else if (field.type === 'number') {
            input = document.createElement('input');
            input.type = 'number';
            input.min = field.min;
            input.max = field.max;
            input.value = field.defaultFrom();
        } else if (field.type === 'text') {
            input = document.createElement('input');
            input.type = 'text';
            input.classList.add('text-bar');
            input.placeholder = field.placeholder ?? '';
        }

        input.dataset.fieldId = field.id;
        row.appendChild(label);
        row.appendChild(input);
        container.appendChild(row);
    });

    const confirmBtn = document.createElement('button');
    confirmBtn.classList.add('menu-confirm-btn');
    confirmBtn.textContent = menuDef.confirm.label;
    confirmBtn.addEventListener('click', () => {
        const values = collectMenuValues(container);
        menuDef.confirm.action(values);
    });
    container.appendChild(confirmBtn);
}

function collectMenuValues(container) {
    const values = {};
    container.querySelectorAll('[data-field-id]').forEach(input => {
        const id = input.dataset.fieldId;
        if (input.type === 'checkbox') values[id] = input.checked;
        else if (input.type === 'number') values[id] = Number(input.value);
        else values[id] = input.value;
    });
    return values;
}

function openMenu(container, menuKey) {
    buildMenu(container, MENUS[menuKey]);
    container.classList.add('active');
    openOverlay(() => container.classList.remove('active'));
}

// ***** OVERLAY *****

let onOverlayClose = null;

function openOverlay(closeFn) {
    onOverlayClose = closeFn;
    overlay.classList.add('active');
}

function closeOverlay() {
    overlay.classList.remove('active');
    onOverlayClose?.();
    onOverlayClose = null;
}

// ***** EVENT LISTENERS *****

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

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchSubmit();
});

saveButton.addEventListener('click', saveWordlist);
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
