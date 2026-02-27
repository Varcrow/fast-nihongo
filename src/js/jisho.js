async function searchJisho(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword.trim());
        const url = `https://jisho.org/api/v1/search/words?keyword=${encodedKeyword}`;
        const response = await fetch(url);
        if (!response.ok) {
            notify(`HTTP error: ${response.status}`, 'error');
            return null;
        }
        const data = await response.json();
        if (!data.data || data.data.length === 0) {
            notify(`No results found for "${keyword}"`, 'warn');
            return null;
        }
        return data.data;
    } catch (err) {
        notify('Failed to reach Jisho — check your connection', 'error');
        console.error('Error:', err.message);
        return null;
    }
}
