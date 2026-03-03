class SidebarUI {
    constructor() {
        this._wordlistName = document.getElementById('wordlist-name');
        this.container = document.getElementById('wordlists-container');
        this.refreshSidebar();
    }

    get wordlistName() {
        return this._wordlistName.value.trim();
    }

    set wordlistName(value) {
        this._wordlistName.value = value;
    }

    refreshSidebar() {
        this.container.innerHTML = '';
        const names = window.wordlistAPI.getNames();

        names.forEach(name => {
            const el = document.createElement('div');
            el.classList.add('neu-btn');
            el.dataset.action = 'load-wordlist';
            el.dataset.name = name;
            el.innerHTML = `<h3>${name}</h3>`;
            this.container.appendChild(el);
        });
    }
}

export default new SidebarUI();
