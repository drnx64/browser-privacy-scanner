window.PrivacyTester = window.PrivacyTester || {};

(function(ns) {

  const deductions = [];
  const results = {};
  let score = 100;
  let finalized = false;

  function reset() {
    deductions.length = 0;
    for (var k in results) delete results[k];
    score = 100;
    finalized = false;
  }

  function registerResult(key, data) {
    results[key] = data;
    if (data.deduction && !finalized) {
      deductions.push({ key, deduction: data.deduction, reason: data.remediation || data.summary });
    }
  }

  function calculateScore() {
    finalized = true;
    score = 100;
    for (var i = 0; i < deductions.length; i++) {
      score = Math.max(0, score - deductions[i].deduction);
    }
    return Math.round(score);
  }

  function getScore() {
    return Math.round(score);
  }

  function getDeductions() {
    return deductions.slice();
  }

  function getResults() {
    return results;
  }

  function getResult(key) {
    return results[key];
  }

  function getSummary() {
    var vals = Object.values(results);
    var total = vals.length;
    var blocked = 0, exposed = 0, warnings = 0, infos = 0;
    for (var i = 0; i < vals.length; i++) {
      switch (vals[i].status) {
        case 'blocked': blocked++; break;
        case 'exposed': exposed++; break;
        case 'warning': warnings++; break;
        case 'info': infos++; break;
      }
    }
    return { total: total, blocked: blocked, exposed: exposed, warnings: warnings, infos: infos };
  }

  ns.scoring = {
    reset: reset,
    registerResult: registerResult,
    calculateScore: calculateScore,
    getScore: getScore,
    getDeductions: getDeductions,
    getResults: getResults,
    getResult: getResult,
    getSummary: getSummary
  };

})(window.PrivacyTester);
