const { contextBridge } = require('electron');
const fs = require('fs');
const path = require('path');

const userDataPath = process.argv.find(a => a.startsWith('--userDataPath=')).split('=')[1];
const SESSION_FILE = path.join(userDataPath, 'sessions.json');

function readFile() {
    if (!fs.existsSync(SESSION_FILE)) return {};
    return JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
}

contextBridge.exposeInMainWorld('sessionAPI', {
    getNames: () => {
        const sessions = readFile();
        return Object.keys(sessions);
    },
    save: (session) => {
        const sessions = readFile();
        sessions[session.sessionName] = session;
        fs.writeFileSync(SESSION_FILE, JSON.stringify(sessions, null, 2));
    },
    load: (sessionName) => {
        const sessions = readFile();
        return sessions[sessionName] ?? null;
    },
    delete: (sessionName) => {
        const sessions = readFile();
        delete sessions[sessionName];
        fs.writeFileSync(SESSION_FILE, JSON.stringify(sessions, null, 2));
    }
});
