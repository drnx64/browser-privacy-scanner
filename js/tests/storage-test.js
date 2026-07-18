window.PrivacyTester = window.PrivacyTester || {};
(function(ns) {
  ns.tests = ns.tests || {};

  ns.tests.testStorage = async function() {
    const results = {
      localStorage: false,
      sessionStorage: false,
      indexedDB: false,
      cookies: false
    };

    let deduction = 0;

    try {
      const key = '_pt_test_' + Date.now();
      localStorage.setItem(key, '1');
      const val = localStorage.getItem(key);
      if (val === '1') {
        results.localStorage = true;
      }
      localStorage.removeItem(key);
    } catch (e) {
      results.localStorage = false;
    }

    try {
      const key = '_pt_test_' + Date.now();
      sessionStorage.setItem(key, '1');
      const val = sessionStorage.getItem(key);
      if (val === '1') {
        results.sessionStorage = true;
      }
      sessionStorage.removeItem(key);
    } catch (e) {
      results.sessionStorage = false;
    }

    try {
      const req = indexedDB.open('_pt_test_db_' + Date.now());
      await new Promise((resolve, reject) => {
        req.onsuccess = () => {
          results.indexedDB = true;
          const db = req.result;
          db.close();
          indexedDB.deleteDatabase(db.name);
          resolve();
        };
        req.onerror = () => {
          results.indexedDB = false;
          resolve();
        };
        req.onblocked = () => {
          results.indexedDB = false;
          resolve();
        };
        setTimeout(() => { resolve(); }, 3000);
      });
    } catch (e) {
      results.indexedDB = false;
    }

    try {
      document.cookie = '_pt_test=1; path=/; max-age=10';
      results.cookies = document.cookie.indexOf('_pt_test') !== -1;
      document.cookie = '_pt_test=; path=/; max-age=0';
    } catch (e) {
      results.cookies = false;
    }

    const allAccessible = Object.values(results).every(v => v === true);
    const anyAccessible = Object.values(results).some(v => v === true);

    const accessible = Object.entries(results)
      .filter(([, v]) => v)
      .map(([k]) => k);

    if (allAccessible) {
      deduction = 5;
    } else if (anyAccessible) {
      deduction = 2;
    }

    return {
      key: 'storage',
      status: allAccessible ? 'exposed' : (anyAccessible ? 'warning' : 'blocked'),
      title: 'Tracking Storage Vectors',
      summary: allAccessible
        ? 'All storage vectors (localStorage, sessionStorage, IndexedDB, cookies) fully accessible.'
        : accessible.length > 0
          ? `Partial storage: ${accessible.join(', ')} accessible.`
          : 'All storage vectors blocked — strong anti-tracking.',
      details: {
        localStorage: results.localStorage,
        sessionStorage: results.sessionStorage,
        indexedDB: results.indexedDB,
        cookies: results.cookies
      },
      explanation: 'Storage APIs are the foundation of web tracking. Cookies, localStorage, and IndexedDB are used to persist tracking IDs, session replays, and fingerprint caches across browsing sessions. When all storage vectors are open, trackers can reliably store and retrieve unique identifiers even after browser restarts. Blocking storage or making it ephemeral (like Firefox\'s Total Cookie Protection) breaks this tracking chain.',
      remediation: 'Use Firefox with Strict Enhanced Tracking Protection (enables Total Cookie Protection with ephemeral storage). Brave offers per-site ephemeral storage when Shields are up. Block third-party cookies in browser settings. Clear all site data on browser exit. Use uBlock Origin with advanced privacy filters.',
      deduction
    };
  };

})(window.PrivacyTester);
