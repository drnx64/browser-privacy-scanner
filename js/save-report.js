window.PrivacyTester = window.PrivacyTester || {};
(function(ns) {
  ns.saveReport = {};

  var C = {
    bg: '#0a0f1a',
    card: '#111827',
    border: '#1e2d45',
    text: '#f1f5f9',
    textSec: '#94a3b8',
    textMuted: '#64748b',
    green: '#10b981',
    greenBg: 'rgba(16,185,129,0.08)',
    red: '#ef4444',
    redBg: 'rgba(239,68,68,0.08)',
    yellow: '#f59e0b',
    yellowBg: 'rgba(245,158,11,0.08)',
    blue: '#3b82f6',
    blueBg: 'rgba(59,130,246,0.08)',
    purple: '#8b5cf6',
    headerBg: '#0f1729'
  };

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  function drawShield(ctx, x, y, s) {
    var hw = s / 2;
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = C.green;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(hw, 1);
    ctx.lineTo(1, hw * 0.35 + 1);
    ctx.lineTo(1, hw * 0.35 + hw * 0.55);
    ctx.quadraticCurveTo(1, hw * 1.85, hw, hw * 2 - 1);
    ctx.quadraticCurveTo(s - 1, hw * 1.85, s - 1, hw * 0.35 + hw * 0.55);
    ctx.lineTo(s - 1, hw * 0.35 + 1);
    ctx.closePath();
    ctx.fillStyle = 'rgba(16,185,129,0.06)';
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = C.green;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(hw * 0.4, hw * 1.0);
    ctx.lineTo(hw * 0.7, hw * 1.3);
    ctx.lineTo(hw * 1.5, hw * 0.55);
    ctx.stroke();
    ctx.restore();
  }

  function drawGauge(ctx, x, y, w, score) {
    var barH = 20;
    var r = barH / 2;

    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    roundRect(ctx, x, y, w, barH, r);
    ctx.fill();

    var grad = ctx.createLinearGradient(x, y, x + w, y);
    grad.addColorStop(0, '#10b981');
    grad.addColorStop(0.35, '#10b981');
    grad.addColorStop(0.5, '#f59e0b');
    grad.addColorStop(0.7, '#f97316');
    grad.addColorStop(1, '#ef4444');

    var fillW = Math.max(barH, (score / 100) * w);
    ctx.save();
    roundRect(ctx, x, y, fillW, barH, r);
    ctx.clip();
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, fillW, barH);
    ctx.restore();

    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    roundRect(ctx, x + fillW - barH, y, barH, barH, r);
    ctx.fill();

    ctx.fillStyle = C.text;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(score + '%', x + w, y + barH / 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  ns.saveReport.generate = function() {
    var results = ns.scoring.getResults();
    var score = ns.scoring.getScore();
    var summary = ns.scoring.getSummary();
    var deductions = ns.scoring.getDeductions();
    var totalDed = deductions.reduce(function(s, d) { return s + d.deduction; }, 0);

    var threat = score >= 80 ? 'LOW' : score >= 50 ? 'MODERATE' : score >= 20 ? 'ELEVATED' : 'CRITICAL';
    var threatColor = score >= 80 ? C.green : score >= 50 ? C.yellow : score >= 20 ? '#f97316' : C.red;

    var catOrder = [
      { label: 'Hardware & Silicon Blueprint', keys: ['canvas','webaudio','webgl','fonts','hardware'] },
      { label: 'Network & Environment Leakage', keys: ['webrtc','network','locale'] },
      { label: 'Software & Automation Identity', keys: ['browser','botDetection','apis'] },
      { label: 'Tracking State & Permissions', keys: ['storage','permissions'] }
    ];

    var W = 820, pad = 40;
    var yPos = pad;

    var catHeights = [];
    var tableRows = 0;
    catOrder.forEach(function(cat) {
      var rows = 0;
      cat.keys.forEach(function(k) {
        if (results[k]) rows++;
      });
      tableRows += rows;
      catHeights.push({ label: cat.label, rows: rows });
    });

    var rowH = 38;
    var hashH = 20;
    var extraHash = 0;
    catOrder.forEach(function(cat) {
      cat.keys.forEach(function(k) {
        var r = results[k];
        if (r && r.details && r.details.hash) extraHash += hashH;
      });
    });

    var headerH = 90;
    var gaugeH = 56;
    var statsH = 36;
    var catHeaderH = 30;
    var tableH = tableRows * rowH + extraHash + catOrder.length * catHeaderH;
    var footerH = 56;
    var H = pad * 2 + headerH + gaugeH + statsH + 20 + tableH + 20 + footerH;

    var canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = C.card;
    roundRect(ctx, pad - 4, pad - 4, W - pad * 2 + 8, H - pad * 2 + 8, 16);
    ctx.fill();

    var x = pad + 4;
    var maxW = W - pad * 2 - 8;

    /* -- HEADER -- */
    var hx = x, hy = yPos;

    drawShield(ctx, hx + 4, hy + 4, 40);

    ctx.fillStyle = C.text;
    ctx.font = 'bold 22px "Segoe UI", sans-serif';
    ctx.fillText('Browser Fingerprint Report', hx + 56, hy + 22);

    var now = new Date();
    var dateStr = now.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }) +
                  ' at ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    ctx.fillStyle = C.textMuted;
    ctx.font = '12px "Segoe UI", sans-serif';
    ctx.fillText('Generated ' + dateStr, hx + 56, hy + 42);

    ctx.fillStyle = 'rgba(16,185,129,0.12)';
    roundRect(ctx, hx + 56 + ctx.measureText('Generated ' + dateStr).width + 14, hy + 30, 90, 20, 10);
    ctx.fill();
    ctx.fillStyle = C.green;
    ctx.font = '10px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('100% LOCAL', hx + 56 + ctx.measureText('Generated ' + dateStr).width + 14 + 45, hy + 44);
    ctx.textAlign = 'left';

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(hx, hy + 68);
    ctx.lineTo(hx + maxW, hy + 68);
    ctx.stroke();

    yPos += headerH;

    /* -- SCORE SECTION -- */
    ctx.fillStyle = C.textSec;
    ctx.font = '11px "Segoe UI", sans-serif';
    ctx.fillText('PRIVACY SCORE', hx, yPos);

    ctx.fillStyle = threatColor;
    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(threat, hx + maxW, yPos + 5);
    ctx.textAlign = 'left';

    yPos += 22;
    drawGauge(ctx, hx, yPos, maxW, score);
    yPos += gaugeH;

    /* -- STATS -- */
    var stats = [
      { label: 'Protected', count: summary.blocked, color: C.green },
      { label: 'Exposed', count: summary.exposed, color: C.red },
      { label: 'Warning', count: summary.warnings, color: C.yellow },
      { label: 'Info', count: summary.infos, color: C.blue }
    ];

    var statW = (maxW - 10) / 4;
    for (var si = 0; si < stats.length; si++) {
      var sx = hx + si * (statW + 3);

      ctx.fillStyle = stats[si].color;
      ctx.font = 'bold 22px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(stats[si].count, sx + statW / 2, yPos + 16);

      ctx.fillStyle = C.textSec;
      ctx.font = '10px "Segoe UI", sans-serif';
      ctx.fillText(stats[si].label, sx + statW / 2, yPos + 31);
      ctx.textAlign = 'left';
    }

    ctx.fillStyle = C.textMuted;
    ctx.font = '10px "Segoe UI", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Deductions: \u2212' + totalDed + ' pts', hx + maxW, yPos + 31);
    ctx.textAlign = 'left';

    yPos += statsH + 8;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(hx, yPos + 6);
    ctx.lineTo(hx + maxW, yPos + 6);
    ctx.stroke();
    yPos += 14;

    /* -- RESULTS TABLE -- */
    ctx.fillStyle = C.text;
    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.fillText('Test Results', hx, yPos);
    yPos += 8;

    var colNum = 32;
    var colName = 270;
    var colStatus = 90;
    var colSummary = maxW - colNum - colName - colStatus - 8;

    for (var ci = 0; ci < catOrder.length; ci++) {
      var cat = catOrder[ci];
      var hasResults = false;
      cat.keys.forEach(function(k) { if (results[k]) hasResults = true; });
      if (!hasResults) continue;

      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      roundRect(ctx, hx, yPos, maxW, 24, 6);
      ctx.fill();

      ctx.fillStyle = C.textSec;
      ctx.font = '10px "Segoe UI", sans-serif';
      ctx.fillText(cat.label, hx + 10, yPos + 16);
      yPos += 28;

      for (var ki = 0; ki < cat.keys.length; ki++) {
        var r = results[cat.keys[ki]];
        if (!r) continue;

        var statusColor = r.status === 'blocked' ? C.green :
                          r.status === 'exposed' ? C.red :
                          r.status === 'warning' ? C.yellow : C.blue;
        var statusBg = r.status === 'blocked' ? C.greenBg :
                       r.status === 'exposed' ? C.redBg :
                       r.status === 'warning' ? C.yellowBg : C.blueBg;
        var badgeText = r.status === 'blocked' ? 'PROTECTED' :
                        r.status === 'exposed' ? 'EXPOSED' :
                        r.status === 'warning' ? 'WARNING' : 'INFO';

        ctx.fillStyle = statusBg;
        roundRect(ctx, hx, yPos, maxW, rowH, 6);
        ctx.fill();

        ctx.fillStyle = statusColor;
        ctx.beginPath();
        ctx.arc(hx + 14, yPos + rowH / 2, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = C.text;
        ctx.font = '12px "Segoe UI", sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillText(r.title || '', hx + colNum, yPos + rowH / 2);

        ctx.fillStyle = statusColor;
        ctx.font = 'bold 9px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(badgeText, hx + colNum + colName + colStatus / 2, yPos + rowH / 2);
        ctx.textAlign = 'left';

        var summ = r.summary || '';
        if (summ.length > 50) summ = summ.slice(0, 47) + '...';
        ctx.fillStyle = C.textSec;
        ctx.font = '10px "Segoe UI", sans-serif';
        ctx.fillText(summ, hx + colNum + colName + colStatus + 4, yPos + rowH / 2);

        ctx.textBaseline = 'alphabetic';
        yPos += rowH;

        if (r.details && r.details.hash) {
          var h = r.details.hash;
          if (h.length > 48) h = h.slice(0, 24) + '...' + h.slice(-8);
          ctx.fillStyle = C.textMuted;
          ctx.font = '9px monospace';
          ctx.fillText('Hash: ' + h, hx + colNum + 8, yPos + 12);
          yPos += hashH;
        }
      }

      yPos += 4;
    }

    /* -- FOOTER -- */
    var fy = Math.max(yPos + 12, H - pad - footerH + 8);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(hx, fy);
    ctx.lineTo(hx + maxW, fy);
    ctx.stroke();

    fy += 14;
    ctx.fillStyle = C.textMuted;
    ctx.font = '10px "Segoe UI", sans-serif';
    ctx.fillText('Browser Fingerprint Report v1.0  \u2014  ' + dateStr, hx, fy + 14);
    ctx.fillText('All 13 tests executed locally in your browser. Zero data transmitted to any server.', hx, fy + 28);

    return canvas;
  };

  ns.saveReport.download = function() {
    var canvas = ns.saveReport.generate();
    var link = document.createElement('a');
    link.download = 'browser-fingerprint-report-' + Date.now() + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

})(window.PrivacyTester);
