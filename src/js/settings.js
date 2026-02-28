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
