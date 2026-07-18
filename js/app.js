window.PrivacyTester = window.PrivacyTester || {};
(function(ns) {
  ns.app = ns.app || {};

  var $ = function(id) { return document.getElementById(id); };

  var categories = [
    { id: 'hardware', title: 'Hardware & Silicon Blueprint', tests: ['testCanvas','testWebAudio','testWebGL','testFonts','testHardware'] },
    { id: 'network',  title: 'Network & Environment Leakage', tests: ['testWebRTC','testNetwork','testLocale'] },
    { id: 'software', title: 'Software & Automation Identity', tests: ['testBrowser','testBotDetection','testAPIs'] },
    { id: 'tracking', title: 'Tracking State & Permissions',  tests: ['testStorage','testPermissions'] }
  ];

  var allTests = [];
  categories.forEach(function(c) { c.tests.forEach(function(t) { allTests.push(t); }); });

  var currentCategory = 'hardware';
  var categoryResults = {};

  function makePending(name) {
    return { key: name, status: 'pending', title: name.replace('test',''), summary: 'Waiting...', explanation: '', deduction: 0 };
  }

  function initCache() {
    categoryResults = {};
    categories.forEach(function(c) {
      categoryResults[c.id] = c.tests.map(makePending);
    });
  }
  initCache();

  function findCat(id) {
    for (var i = 0; i < categories.length; i++) {
      if (categories[i].id === id) return categories[i];
    }
    return null;
  }

  ns.app.switchCategory = function(catId) {
    currentCategory = catId;
    var cat = findCat(catId);
    var results = categoryResults[catId] || (cat ? cat.tests.map(makePending) : []);
    if (cat) ns.ui.renderPanel(catId, '', cat.title, cat.description, results);
  };

  ns.app.runAll = async function() {
    if (this._running) return;
    this._running = true;

    if (ns.ui.closeDrawer) ns.ui.closeDrawer();

    if ($('scanProgress')) $('scanProgress').classList.remove('complete');
    if ($('scanProgressFill')) $('scanProgressFill').style.background = 'linear-gradient(90deg, var(--accent-blue), var(--accent-green))';

    if ($('scanProgressText')) $('scanProgressText').textContent = 'Starting scan\u2026';
    if ($('scanTimestamp')) $('scanTimestamp').textContent = 'Running\u2026';

    initCache();
    ns.ui.updateProgress(0, allTests.length);

    var completed = 0;

    for (var ci = 0; ci < categories.length; ci++) {
      var cat = categories[ci];
      var results = [];

      for (var ti = 0; ti < cat.tests.length; ti++) {
        var name = cat.tests[ti];
        var result;

        try {
          var fn = ns.tests[name];
          result = typeof fn === 'function' ? await fn() : { key: name, status: 'blocked', title: name.replace('test',''), summary: 'Test not found.', explanation: '', deduction: 0 };
        } catch (e) {
          result = { key: name, status: 'blocked', title: name.replace('test',''), summary: 'Test error \u2014 data protected.', explanation: '', deduction: 0, error: e.message };
        }

        ns.scoring.registerResult(result.key, result);
        results.push(result);
        categoryResults[cat.id] = results.slice();
        completed++;

        if (currentCategory === cat.id) {
          ns.ui.renderPanel(cat.id, '', cat.title, cat.description, results);
        } else {
          ns.ui.updateTabDots(cat.id, categoryResults[cat.id]);
        }

        ns.ui.updateProgress(completed, allTests.length);
      }
    }

    var score = ns.scoring.calculateScore();
    ns.ui.updateRiskBar(score);
    if ($('scanTimestamp')) $('scanTimestamp').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if ($('rerunBtn')) $('rerunBtn').style.display = 'flex';

    var saveSection = $('saveSection');
    if (saveSection) saveSection.style.display = 'flex';

    this._running = false;
  };

  document.addEventListener('DOMContentLoaded', function() {
    ns.ui.setupEvents();

    var startBtn = $('startBtn');
    var landing = $('landingPage');
    var reportPage = $('reportPage');

    if (startBtn && landing && reportPage) {
      startBtn.addEventListener('click', function() {
        landing.style.display = 'none';
        reportPage.style.display = 'block';

        var cat = findCat('hardware');
        var initial = categoryResults.hardware || (cat ? cat.tests.map(makePending) : []);
        if (cat) ns.ui.renderPanel('hardware', '', cat.title, cat.description, initial);

        categories.forEach(function(c) {
          var dots = $('tabDots-' + c.id);
          if (dots) {
            dots.innerHTML = c.tests.map(function() {
              return '<span class="dot pending"></span>';
            }).join('');
          }
        });

        var saveSection = $('saveSection');
        if (saveSection) saveSection.style.display = 'none';

        ns.app.runAll();
      });
    }
  });

})(window.PrivacyTester);
