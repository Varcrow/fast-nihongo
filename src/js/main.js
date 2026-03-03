import WordlistManager from "./core/wordlistManager.js";

document.addEventListener('click', (e) => {
    const action = e.target.dataset.action;

    if (!action) return;

    switch (action) {
        case 'save-wordlist':
            WordlistManager.saveWordlist();
            // Refresh sidebar
            break;

        case 'load-wordlist':
            WordlistManager.loadWordlist(e.target.dataset.name);
            // Set wordlist name
            // Load wordlist cards
            break;

        case 'delete-wordlist':
            // Open delete confirmation menu
            break;

        case 'confirm-delete':
            // Delete wordlist
            // Load new default wordlist
            break;
    }
});
