/* Offline-first persistence for the FUT-DESASTRE PWA. */
(function () {
    const DB_NAME = 'fut-desastre-db';
    const DB_VERSION = 1;
    const STORE_NAME = 'app-state';
    const STATE_KEY = 'current-tournament';

    function openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = () => {
                const database = request.result;
                if (!database.objectStoreNames.contains(STORE_NAME)) {
                    database.createObjectStore(STORE_NAME);
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async function getState() {
        const database = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(STORE_NAME, 'readonly');
            const request = transaction.objectStore(STORE_NAME).get(STATE_KEY);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
            transaction.oncomplete = () => database.close();
        });
    }

    async function saveState(state) {
        const database = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(STORE_NAME, 'readwrite');
            transaction.objectStore(STORE_NAME).put({ ...state, updatedAt: new Date().toISOString() }, STATE_KEY);
            transaction.oncomplete = () => {
                database.close();
                resolve();
            };
            transaction.onerror = () => reject(transaction.error);
        });
    }

    async function clearState() {
        const database = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(STORE_NAME, 'readwrite');
            transaction.objectStore(STORE_NAME).delete(STATE_KEY);
            transaction.oncomplete = () => {
                database.close();
                resolve();
            };
            transaction.onerror = () => reject(transaction.error);
        });
    }

    window.FutDesastreStorage = { getState, saveState, clearState };
}());
