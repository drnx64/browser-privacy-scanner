window.PrivacyTester = window.PrivacyTester || {};
(function(ns) {
  ns.ui = ns.ui || {};

  var $ = function(id) { return document.getElementById(id); };

  var els = {};
  function cacheRefs() {
    els = {
      grid: $('panelGrid'),
      panelTitle: $('panelTitle'),
      panelSubtitle: $('panelSubtitle'),
      riskFill: $('riskBarFill'),
      riskIndicator: $('riskBarIndicator'),
      riskScore: $('riskBarScore'),
      badgeNum: $('badgeScoreNum'),
      threatLabel: $('threatLabel'),
      deductionsLabel: $('deductionsLabel'),
      riskStats: $('riskStats'),
      scanTs: $('scanTimestamp'),
      rerunBtn: $('rerunBtn'),
      progressFill: $('scanProgressFill'),
      progressText: $('scanProgressText'),
      progress: $('scanProgress'),
      drawerOverlay: $('drawerOverlay'),
      drawer: $('drawer'),
      drawerTitle: $('drawerTitle'),
      drawerBadge: $('drawerBadge'),
      drawerData: $('drawerDataContent'),
      drawerExplanation: $('drawerExplanation'),
      drawerRemediation: $('drawerRemediation'),
      drawerDataSec: $('drawerDataSection'),
      drawerExplSec: $('drawerExplanationSection'),
      drawerRemSec: $('drawerRemediationSection')
    };
  }
  cacheRefs();

  function escapeHtml(str) {
    if (typeof str !== 'string') str = String(str);
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function renderValue(val) {
    if (val === null || val === undefined) return 'N/A';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    return String(val);
  }

  function statusDotClass(s) {
    switch (s) {
      case 'blocked': return 'blocked';
      case 'exposed': return 'exposed';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'pending';
    }
  }

  function badgeClass(s) {
    switch (s) {
      case 'blocked': return 'badge-green';
      case 'exposed': return 'badge-red';
      case 'warning': return 'badge-yellow';
      case 'info': return 'badge-blue';
      default: return 'badge-blue';
    }
  }

  function badgeLabel(s) {
    switch (s) {
      case 'blocked': return 'Protected';
      case 'exposed': return 'Exposed';
      case 'warning': return 'Warning';
      case 'info': return 'Info';
      default: return 'Pending';
    }
  }

  function renderCompactCard(r) {
    var sClass = statusDotClass(r.status);
    var bClass = badgeClass(r.status);
    var bLabel = badgeLabel(r.status);
    var hash = r.details && r.details.hash ? escapeHtml(r.details.hash) : '';
    var abbrHash = hash.length > 20 ? hash.slice(0, 8) + '\u2026' + hash.slice(-4) : hash;
    var summary = escapeHtml(r.summary || '');

    return '<div class="test-compact" data-key="' + escapeHtml(r.key) + '">' +
      '<div class="tc-status tc-' + sClass + '"></div>' +
      '<div class="tc-body">' +
      '<div class="tc-top">' +
      '<span class="tc-title">' + escapeHtml(r.title) + '</span>' +
      '<span class="badge ' + bClass + '">' + bLabel + '</span>' +
      '</div>' +
      '<div class="tc-summary">' + summary + '</div>' +
      '<div class="tc-meta">' +
      (abbrHash ? '<span class="tc-hash">' + abbrHash + '</span>' : '<span></span>') +
      '<button class="tc-detail-btn" data-key="' + escapeHtml(r.key) + '">View Details</button>' +
      '</div></div></div>';
  }

  function renderDetailsObject(obj, depth) {
    if (depth > 3) return '';
    if (!obj || typeof obj !== 'object') return renderValue(obj);
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '<span class="text-muted">None</span>';
      return '<div class="list-display">' + obj.map(function(item) {
        return '<span class="list-item">' + escapeHtml(String(item).substring(0, 60)) + '</span>';
      }).join('') + '</div>';
    }
    var hasHash = 'hash' in obj;
    var html = '';
    for (var k in obj) {
      if (k === 'hash' && hasHash) continue;
      var label = k.replace(/([A-Z])/g, ' $1').replace(/^./, function(s) { return s.toUpperCase(); });
      var val = obj[k];
      if (typeof val === 'object' && val !== null) {
        html += '<div class="kv-row"><span class="kv-key">' + escapeHtml(label) + '</span></div>' +
          '<div style="padding-left:14px">' + renderDetailsObject(val, depth + 1) + '</div>';
      } else {
        html += '<div class="kv-row"><span class="kv-key">' + escapeHtml(label) + '</span>' +
          '<span class="kv-value">' + escapeHtml(renderValue(val)) + '</span></div>';
      }
    }
    if (hasHash && obj.hash) {
      html += '<div class="hash-display">' + escapeHtml(obj.hash) + '</div>';
    }
    return html;
  }

  function setActiveTab(catId) {
    var tabs = document.querySelectorAll('.cat-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle('active', tabs[i].getAttribute('data-cat') === catId);
    }
  }

  function updateTabDots(catId, results) {
    var c = $('tabDots-' + catId);
    if (!c) return;
    c.innerHTML = results.map(function(r) {
      return '<span class="dot ' + statusDotClass(r.status) + '"></span>';
    }).join('');
  }

  function updateProgress(current, total) {
    if (!els.progressFill || !els.progressText) return;
    var pct = total > 0 ? Math.round(current / total * 100) : 0;
    els.progressFill.style.width = pct + '%';
    if (current >= total) {
      els.progressFill.style.background = 'var(--accent-green)';
      els.progress.classList.add('complete');
      els.progressText.textContent = 'Complete \u2014 ' + total + '/' + total + ' tests';
    } else {
      els.progressText.textContent = 'Running ' + (current + 1) + '/' + total + '\u2026';
    }
  }

  function updateRiskBar(score) {
    var f = els.riskFill, ind = els.riskIndicator, se = els.riskScore;
    if (!f || !ind || !se) return;

    f.style.width = score + '%';
    ind.style.left = score + '%';
    se.textContent = score + '%';

    if (els.badgeNum) {
      els.badgeNum.textContent = score + '%';
      els.badgeNum.style.color = score >= 80 ? 'var(--accent-green)' : score >= 50 ? 'var(--accent-yellow)' : score >= 20 ? 'var(--risk-high)' : 'var(--accent-red)';
    }

    if (els.threatLabel) {
      els.threatLabel.className = 'risk-bar-threat';
      if (score >= 80) { els.threatLabel.textContent = 'LOW'; els.threatLabel.classList.add('threat-low'); }
      else if (score >= 50) { els.threatLabel.textContent = 'MODERATE'; els.threatLabel.classList.add('threat-moderate'); }
      else if (score >= 20) { els.threatLabel.textContent = 'ELEVATED'; els.threatLabel.classList.add('threat-high'); }
      else { els.threatLabel.textContent = 'CRITICAL'; els.threatLabel.classList.add('threat-critical'); }
    }

    var summary = ns.scoring.getSummary();
    if (els.riskStats) {
      els.riskStats.innerHTML =
        '<span class="risk-stat rs-protected"><span class="rs-dot"></span>' + summary.blocked + ' Protected</span>' +
        '<span class="risk-stat rs-exposed"><span class="rs-dot"></span>' + summary.exposed + ' Exposed</span>' +
        '<span class="risk-stat rs-warning"><span class="rs-dot"></span>' + summary.warnings + ' Warning</span>' +
        '<span class="risk-stat rs-info"><span class="rs-dot"></span>' + summary.infos + ' Info</span>';
    }

    var total = ns.scoring.getDeductions().reduce(function(s, d) { return s + d.deduction; }, 0);
    if (els.deductionsLabel) {
      els.deductionsLabel.textContent = total > 0 ? '-' + total + ' pts deducted' : '0 pts deducted';
    }

    if (els.scanTs) {
      els.scanTs.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (els.rerunBtn) els.rerunBtn.style.display = 'flex';
  }

  function renderPanel(catId, icon, title, desc, results) {
    if (!els.grid) return;

    var done = results.filter(function(r) { return r.status !== 'pending'; });
    var names = {
      hardware: 'Hardware &amp; Silicon Blueprint',
      network: 'Network &amp; Environment Leakage',
      software: 'Software &amp; Automation Identity',
      tracking: 'Tracking State &amp; Permissions'
    };

    if (els.panelTitle) els.panelTitle.innerHTML = names[catId] || title;
    if (els.panelSubtitle) els.panelSubtitle.textContent = done.length + '/' + results.length + ' checks';

    els.grid.innerHTML = results.map(renderCompactCard).join('');
    updateTabDots(catId, results);
    setActiveTab(catId);
  }

  function openDrawer(key) {
    var result = ns.scoring.getResult(key);
    if (!result) return;
    if (!els.drawer || !els.drawerOverlay) return;

    els.drawerTitle.textContent = result.title;
    els.drawerBadge.textContent = badgeLabel(result.status);
    els.drawerBadge.className = 'badge ' + badgeClass(result.status);

    var detailHtml = result.details ? renderDetailsObject(result.details, 0) : '';
    els.drawerData.innerHTML = detailHtml;
    els.drawerDataSec.style.display = detailHtml ? 'block' : 'none';

    els.drawerExplanation.textContent = result.explanation || '';
    els.drawerExplSec.style.display = result.explanation ? 'block' : 'none';

    els.drawerRemediation.textContent = result.remediation || '';
    els.drawerRemSec.style.display = (result.remediation && result.status !== 'blocked') ? 'block' : 'none';

    els.drawer.classList.add('open');
    els.drawerOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (els.drawer) els.drawer.classList.remove('open');
    if (els.drawerOverlay) els.drawerOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ---- Event Setup (called once) ---- */
  function setupEvents() {
    var catTabs = document.getElementById('catTabs');
    if (catTabs) {
      catTabs.addEventListener('click', function(e) {
        var tab = e.target.closest('.cat-tab');
        if (!tab) return;
        var catId = tab.getAttribute('data-cat');
        if (catId && typeof ns.app.switchCategory === 'function') {
          ns.app.switchCategory(catId);
        }
      });
    }

    var panelGrid = els.grid;
    if (panelGrid) {
      panelGrid.addEventListener('click', function(e) {
        var card = e.target.closest('.test-compact');
        var btn = e.target.closest('.tc-detail-btn');
        if (btn) {
          var key = btn.getAttribute('data-key');
          if (key) openDrawer(key);
        } else if (card) {
          var key = card.getAttribute('data-key');
          if (key) openDrawer(key);
        }
      });
    }

    if (els.drawerClose) els.drawerClose.addEventListener('click', closeDrawer);
    if (els.drawerOverlay) els.drawerOverlay.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeDrawer();
    });

    if (els.rerunBtn) {
      els.rerunBtn.addEventListener('click', function() {
        closeDrawer();
        if (typeof ns.app.runAll === 'function') ns.app.runAll();
      });
    }

    var saveBtn = document.getElementById('saveReportBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        if (typeof ns.saveReport.download === 'function') {
          ns.saveReport.download();
        }
      });
    }
  }

  ns.ui.renderCompactCard = renderCompactCard;
  ns.ui.renderPanel = renderPanel;
  ns.ui.updateRiskBar = updateRiskBar;
  ns.ui.updateProgress = updateProgress;
  ns.ui.updateTabDots = updateTabDots;
  ns.ui.setupEvents = setupEvents;
  ns.ui.closeDrawer = closeDrawer;

})(window.PrivacyTester);
