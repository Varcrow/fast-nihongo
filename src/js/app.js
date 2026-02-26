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

// ***** EVENT HANDLING *****

// Event for handling key presses
document.addEventListener('keydown', (e) => {
    if (e.key === '/') {
        e.preventDefault();
        document.getElementById('search-input').focus();
    }
    if (e.key === 'Escape') {
        document.getElementById('search-input').blur();
    }
});

// Event to submit after hitting enter while focusing search input
searchInput.addEventListener('keydown', function(e) {
    if (e.key == 'Enter') {
        searchSubmit();
    }
});

// Event for clearing search with clear button
clearButton.addEventListener('click', () => {
    searchResultContainer.innerHTML = '';
});

// Load a session when selected from dropdown
sessionSelect.addEventListener('change', () => {
    const name = sessionSelect.value;

    // Auto save previous session if it had a name and words
    if (session.sessionName && session.sessionWords.length > 0) {
        window.sessionAPI.save(session);
    }

    // New session on default option
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

// Save current session
saveButton.addEventListener('click', () => {
    const name = sessionNameInput.value.trim();
    if (!name) return;
    session.sessionName = name;
    window.sessionAPI.save(session);
    loadSessionNames();
    // Select the saved session in the dropdown
    sessionSelect.value = name;
});

// Delete selected session
deleteButton.addEventListener('click', () => {
    const name = sessionSelect.value;
    if (!name) return;
    window.sessionAPI.delete(name);
    session = { sessionName: '', sessionWords: [] };
    sessionNameInput.value = '';
    sessionWordsContainer.innerHTML = '';
    loadSessionNames();
});

async function searchSubmit() {
    const value = searchInput.value.trim();
    if (value === '') return;
    const words = value.split(' ');
    const wordDataArray = []
    searchInput.value = "";

    for (const word of words) {
        const wordData = await searchJisho(word);
        if (wordData != null) {
            wordData.forEach(
                data => {
                    wordDataArray.push(data);
                })
        }
    }

    createAllSearchCards(wordDataArray)
}

// ***** CREATING NEW CARDS *****

async function createAllSearchCards(dataArray) {
    searchResultContainer.innerHTML = '';
    dataArray.forEach(data => {
        data = trimWordData(data);
        appendNewSeachCard(data)
    });
}

function createAllSessionCards(dataArray) {
    sessionWordsContainer.innerHTML = '';

    dataArray.forEach(data => {
        appendNewSessionCard(data);
    });
}

function appendNewSeachCard(data) {
    const newElement = document.createElement('div');
    newElement.innerHTML = `
            <div class="card">
                <span class="card-word">${data.word}</span>
                <span class="card-level">${data.level}</span>
                <span class="card-reading">${data.reading}</span>
                <p class="card-meanings">${data.meanings}</p>
                <p class="card-pos">${data.partsOfSpeech}</p>
            </div>
        `;

    newElement.addEventListener('click', () => addWordToSession(data));
    searchResultContainer.append(newElement);
}

function appendNewSessionCard(data) {
    const newElement = document.createElement('div');
    newElement.innerHTML = `
            <div class="card">
                <span class="card-word">${data.word}</span>
                <span class="card-level">${data.level}</span>
                <span class="card-reading">${data.reading}</span>
                <p class="card-meanings">${data.meanings}</p>
                <p class="card-pos">${data.partsOfSpeech}</p>
            </div>
        `;
    newElement.addEventListener('click', () => {
        removeWordFromSession(data);
        newElement.remove();
    })
    sessionWordsContainer.append(newElement);
}

// ***** UTIL *****
function trimWordData(data) {
    return {
        word: data.japanese[0].word ?? 'N/A',
        reading: data.japanese[0].reading ?? 'N/A',
        level: data.jlpt[0] ?? 'N/A',
        meanings: data.senses[0].english_definitions.join(', '),
        partsOfSpeech: data.senses[0].parts_of_speech.join(', '),
    };
}

function sessionContainsWord(data) {
    return session.sessionWords.some(w =>
        w.word === data.word &&
        w.reading === data.reading
    );
}

function addWordToSession(data) {
    if (sessionContainsWord(data)) return;
    session.sessionWords.push(data);
    appendNewSessionCard(data);
}

function removeWordFromSession(data) {
    session.sessionWords = session.sessionWords.filter(w =>
        !(w.word === data.word && w.reading === data.reading)
    );
}

function loadSessionNames() {
    const names = window.sessionAPI.getNames();
    sessionSelect.innerHTML = '<option value="">New Session</option>';
    names.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        sessionSelect.appendChild(option);
    });
}

loadSessionNames();
