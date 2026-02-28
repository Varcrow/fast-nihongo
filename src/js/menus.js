const MENUS = {
    settings: {
        title: 'Settings',
        fields: [
            { type: 'select', id: 'defaultLanguage', label: 'Default Language', optionsFrom: () => settingsManager.getOptions('defaultLanguage'), defaultFrom: () => settingsManager.get('defaultLanguage') },
            { type: 'number', id: 'resultLimit', label: 'Result Limit', min: 1, max: 20, defaultFrom: () => settingsManager.get('resultLimit') },
            { type: 'toggle', id: 'darkMode', label: 'Dark Mode', defaultFrom: () => settingsManager.get('darkMode') },
        ],
        confirm: {
            label: 'Save',
            action: (values) => {
                settingsManager.save(values);
                notify('Settings saved', 'success');
            }
        }
    },
    newWordlist: {
        title: 'New Wordlist',
        fields: [
            { type: 'text', id: 'name', label: 'Name', placeholder: 'Wordlist name' },
            { type: 'select', id: 'languageId', label: 'Language', optionsFrom: () => settingsManager.getOptions('defaultLanguage'), defaultFrom: () => settingsManager.get('defaultLanguage') },
        ],
        confirm: {
            label: 'Create',
            action: (values) => {
                if (!values.name) { notify('Please enter a wordlist name', 'warn'); return; }
                newWordlist(values.languageId);
                wordlist.name = values.name;
                wordlistNameInput.value = values.name;
                wordlist.save();
                refreshSidebar();
                closeOverlay();
                notify(`Wordlist "${values.name}" created`, 'success');
            }
        }
    },
    confirmDeletion: {
        title: `Delete current wordlist?`,
        fields: [],
        confirm: {
            label: 'Delete',
            variant: 'danger',
            action: () => {
                const name = wordlist.name;
                wordlist.delete();
                newWordlist(settingsManager.get('defaultLanguage'));
                refreshSidebar();
                closeOverlay();
                notify(`Wordlist "${name}" deleted`, 'info');
            }
        }
    }
};
