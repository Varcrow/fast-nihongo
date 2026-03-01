const SETTINGS = [
    {
        id: 'defaultLanguage',
        label: 'Default Language',
        type: 'select',
        options: [
            { value: 'japanese', label: 'Japanese' },
        ],
        default: 'japanese',
    },
    {
        id: 'resultLimit',
        label: 'Search Result Limit',
        type: 'number',
        min: 1,
        max: 20,
        default: 10,
    },
    {
        id: 'darkMode',
        label: 'Dark Mode',
        type: 'toggle',
        default: true,
    },
];

const settingsManager = {
    load() {
        const stored = window.settingsAPI.load();
        const result = {};
        SETTINGS.forEach(s => {
            result[s.id] = stored?.[s.id] ?? s.default;
        });
        return result;
    },
    save(values) {
        window.settingsAPI.save(values);
    },
    get(id) {
        return this.load()[id];
    },
    getOptions(id) {
        const setting = SETTINGS.find(s => s.id === id);
        return setting?.options ?? [];
    }
};

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
