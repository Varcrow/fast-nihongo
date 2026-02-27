const searchInput = document.getElementById('search-input');
const sessionNameInput = document.getElementById('session-name');
const clearButton = document.getElementById('clear-button');
const saveButton = document.getElementById('save-button');
const deleteButton = document.getElementById('delete-button');
const sessionSelect = document.getElementById('session-select');
const searchResultContainer = document.getElementById('search-result-container');
const sessionWordsContainer = document.getElementById('session-words-container');

let session = {
    sessionName: "",
    sessionWords: [],
}

let suppressSelectChange = false;

// ***** EVENT HANDLING *****

document.addEventListener('keydown', (e) => {
    if (e.key === '/') {
        e.preventDefault();
        document.getElementById('search-input').focus();
    }
    if (e.key === 'Escape') {
        document.getElementById('search-input').blur();
    }
});

searchInput.addEventListener('keydown', function(e) {
    if (e.key == 'Enter') {
        searchSubmit();
    }
});

clearButton.addEventListener('click', () => {
    searchResultContainer.innerHTML = '';
    notify('Search cleared', 'info');
});

sessionSelect.addEventListener('change', () => {
    if (suppressSelectChange) return;
    const name = sessionSelect.value;

    if (session.sessionName && session.sessionWords.length > 0) {
        window.sessionAPI.save(session);
    }

    if (!name) {
        session = { sessionName: '', sessionWords: [] };
        sessionNameInput.value = '';
        sessionWordsContainer.innerHTML = '';
        return;
    }

    const loaded = window.sessionAPI.load(name);
    if (!loaded) return;
    session = loaded;
    sessionNameInput.value = session.sessionName;
    createAllSessionCards(session.sessionWords);
});

saveButton.addEventListener('click', () => {
    const name = sessionNameInput.value.trim();
    if (!name) {
        notify('Please enter a session name', 'warn');
        return;
    }
    session.sessionName = name;
    window.sessionAPI.save(session);
    loadSessionNames(name);
    notify(`Session "${name}" saved`, 'success');
});

deleteButton.addEventListener('click', () => {
    const name = sessionSelect.value;
    if (!name) {
        notify('No session selected to delete', 'warn');
        return;
    }
    window.sessionAPI.delete(name);
    session = { sessionName: '', sessionWords: [] };
    sessionNameInput.value = '';
    sessionWordsContainer.innerHTML = '';
    loadSessionNames();
    notify(`Session "${name}" deleted`, 'info');
});

function confirmDeletion() {
    let confirmElement = document.createElement('div');
    confirmElement.innerHTML = `
        <span>${session.sessionName}</span>
        <p>Delete this session?</p>
        <button>No</button>
        <button>Yes</button>
    `;
}

// ***** SEARCH *****

async function searchSubmit() {
    const value = searchInput.value.trim();
    if (!value) {
        notify('Please enter a search term', 'warn');
        return;
    }
    const words = value.split(' ');
    const wordDataArray = [];
    searchInput.value = '';

    for (const word of words) {
        const wordData = await searchJisho(word);
        if (wordData != null) {
            wordData.forEach(data => wordDataArray.push(data));
        }
    }

    if (wordDataArray.length > 0) {
        createAllSearchCards(wordDataArray);
    }
}

// ***** CREATING CARDS *****

function createAllSearchCards(dataArray) {
    searchResultContainer.innerHTML = '';
    const trimmed = dataArray.map(trimWordData).filter(Boolean);
    trimmed.forEach(data => appendNewSeachCard(data));
}

function createAllSessionCards(dataArray) {
    sessionWordsContainer.innerHTML = '';
    dataArray.forEach(data => appendNewSessionCard(data));
}

function appendNewSeachCard(data) {
    const newElement = document.createElement('div');
    newElement.classList.add('card');
    newElement.innerHTML = `
        <span class="card-word">${data.word}</span>
        <span class="card-level">${data.level}</span>
        <span class="card-reading">${data.reading}</span>
        <p class="card-meanings">${data.meanings}</p>
        <p class="card-pos">${data.partsOfSpeech}</p>
    `;
    newElement.addEventListener('contextmenu', () => addWordToSession(data));
    searchResultContainer.append(newElement);
}

function appendNewSessionCard(data) {
    const newElement = document.createElement('div');
    newElement.classList.add('card');
    newElement.innerHTML = `
        <span class="card-word">${data.word}</span>
        <span class="card-level">${data.level}</span>
        <span class="card-reading">${data.reading}</span>
        <p class="card-meanings">${data.meanings}</p>
        <p class="card-pos">${data.partsOfSpeech}</p>
    `;
    newElement.addEventListener('contextmenu', () => {
        removeWordFromSession(data);
        newElement.remove();
    });
    sessionWordsContainer.append(newElement);
}

// ***** UTIL *****

function trimWordData(data) {
    if (!data.japanese || data.japanese.length === 0) return null;
    if (!data.senses || data.senses.length === 0) return null;
    return {
        word: data.japanese[0].word ?? 'N/A',
        reading: data.japanese[0].reading ?? 'N/A',
        level: data.jlpt[0] ?? 'N/A',
        meanings: data.senses[0].english_definitions?.join(', ') ?? 'N/A',
        partsOfSpeech: data.senses[0].parts_of_speech?.join(', ') ?? 'N/A',
    };
}

function sessionContainsWord(data) {
    return session.sessionWords.some(w =>
        w.word === data.word &&
        w.reading === data.reading
    );
}

function addWordToSession(data) {
    if (sessionContainsWord(data)) {
        notify(`"${data.word}" is already in the session`, 'warn');
        return;
    }
    session.sessionWords.push(data);
    appendNewSessionCard(data);
    notify(`"${data.word}" added to session`, 'success');
}

function removeWordFromSession(data) {
    session.sessionWords = session.sessionWords.filter(w =>
        !(w.word === data.word && w.reading === data.reading)
    );
    notify(`"${data.word}" removed from session`, 'info');
}

function loadSessionNames(preserveValue) {
    suppressSelectChange = true;
    const names = window.sessionAPI.getNames();
    sessionSelect.innerHTML = '<option value="">New Session</option>';
    names.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        sessionSelect.appendChild(option);
    });
    if (preserveValue) sessionSelect.value = preserveValue;
    suppressSelectChange = false;
}

loadSessionNames();
