window.PrivacyTester = window.PrivacyTester || {};

(function(ns) {

  const deductions = [];
  const results = {};
  let score = 100;
  let finalized = false;

  function registerResult(key, data) {
    results[key] = data;
    if (data.deduction && !finalized) {
      deductions.push({ key, deduction: data.deduction, reason: data.summary });
    }
  }

  function calculateScore() {
    finalized = true;
    score = 100;
    for (const d of deductions) {
      score = Math.max(0, score - d.deduction);
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
    const total = Object.keys(results).length;
    const blocked = Object.values(results).filter(r => r.status === 'blocked').length;
    const exposed = Object.values(results).filter(r => r.status === 'exposed').length;
    const warnings = Object.values(results).filter(r => r.status === 'warning').length;
    const infos = Object.values(results).filter(r => r.status === 'info').length;
    return { total, blocked, exposed, warnings, infos };
  }

  ns.scoring = {
    registerResult,
    calculateScore,
    getScore,
    getDeductions,
    getResults,
    getResult,
    getSummary
  };

})(window.PrivacyTester);
