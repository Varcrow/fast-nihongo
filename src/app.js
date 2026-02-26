const searchInput = document.getElementById('search-input');
const searchResultContainer = document.getElementById('search-result-container');

// Event for focusing and unfocusing search bar
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
        handleSubmit();
    }
});

async function handleSubmit() {
    const value = searchInput.value.trim();
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

    createCards(wordDataArray)
}

// Expects an array with no null objects
// Arrays should be cleaned before getting passed to this
async function createCards(dataArray) {
    searchResultContainer.innerHTML = '';
    dataArray.forEach(data => {
        const newElement = document.createElement('div');
        const word = data.japanese[0].word ?? 'N/A';
        const reading = data.japanese[0].reading ?? 'N/A';
        const level = data.jlpt[0] ?? 'N/A';
        const meanings = data.senses[0].english_definitions.join(', ');
        const partsOfSpeech = data.senses[0].parts_of_speech.join(', ');

        newElement.innerHTML = `
            <div class="card">
                <span class="card-word">${word}</span>
                <span class="card-level">${level}</span>
                <span class="card-reading">${reading}</span>
                <p class="card-meanings">${meanings}</p>
                <p class="card-pos">${partsOfSpeech}</p>
            </div>
        `;

        searchResultContainer.append(newElement);
    });
}
