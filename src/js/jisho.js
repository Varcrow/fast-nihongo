/*
 * Currently throws errors if something goes wrong
 * Once util for on screen notifications are added use those instead where comments are
 */
async function searchJisho(keyword) {
    try {
        if (typeof keyword !== 'string' || keyword.trim() === '') {
            // NOTIFY EMPTY SEARCH GIVEN
            throw new Error('Keyword must be a non-empty string.');
        }

        const encodedKeyword = encodeURIComponent(keyword.trim());
        const url = `https://jisho.org/api/v1/search/words?keyword=${encodedKeyword}`;

        const response = await fetch(url);
        if (!response.ok) {
            // NOTIFY HTTP ERROR
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.data || data.data.length === 0) {
            // NOTIFY WORD NOT FOUND ERROR
            return null;
        }

        return data.data;
    } catch (err) {
        console.error('Error:', err.message);
    }
}
