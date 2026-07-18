window.PrivacyTester = window.PrivacyTester || {};
(function(ns) {
  ns.tests = ns.tests || {};

  ns.tests.testBotDetection = async function() {
    const details = {};
    let isBot = false;

    try {
      details.webdriver = navigator.webdriver;
      if (navigator.webdriver) {
        isBot = true;
        details.webdriverStatus = 'Present — indicates automated control';
      } else {
        details.webdriverStatus = 'Not present — normal browser';
      }
    } catch (e) {
      details.webdriver = 'unknown';
    }

    try {
      details.pluginsLength = navigator.plugins.length;
      if (navigator.plugins.length === 0) {
        details.pluginsNote = 'No plugins — common in headless mode';
      } else {
        details.pluginsNote = `${navigator.plugins.length} plugin(s) detected`;
      }
    } catch (e) {
      details.pluginsLength = 'unknown';
    }

    try {
      if (navigator.languages && navigator.languages.length === 0) {
        isBot = true;
        details.languagesNote = 'Empty languages array — automation indicator';
      }
    } catch (e) {}

    try {
      if (navigator.userAgent && navigator.userAgent.toLowerCase().includes('headless')) {
        isBot = true;
        details.headlessUA = 'Headless user agent detected';
      }
    } catch (e) {}

    try {
      const hasChrome = !!window.chrome;
      const hasRuntime = !!chrome?.runtime;
      if (!hasChrome && !hasRuntime && navigator.userAgent?.includes('Chrome')) {
        details.chromeRuntimeNote = 'chrome.runtime missing — possible headless Chrome';
      }
    } catch (e) {}

    if (isBot) {
      return {
        key: 'botDetection',
        status: 'warning',
        title: 'Bot / Automation Detection',
        summary: 'Signals indicate this may be an automated browser or testing framework.',
        details: {
          ...details,
          isLikelyAutomated: true
        },
        explanation: 'Automated browser detection checks for signs of Selenium, Puppeteer, Playwright, or headless browsers. These frameworks modify navigator properties (webdriver, plugins, languages) to support automation, which can also be detected by tracking scripts. Normal browsing should show no automation indicators.',
        remediation: 'If you use automation tools, apply stealth plugins (puppeteer-extra-plugin-stealth). For normal browsing, no action needed — these flags should not appear in standard browsers. If detected, verify your system is not infected with a bot or remote-control agent.',
        deduction: 2
      };
    }

    return {
      key: 'botDetection',
      status: 'info',
      title: 'Bot / Automation Detection',
      summary: 'No automation signals detected. You appear to be using a standard browser.',
      details: {
        ...details,
        isLikelyAutomated: false
      },
      explanation: 'Automated browser detection flags Selenium, Puppeteer, and headless Chrome via modified navigator properties. Their absence indicates normal browser usage, which is expected for privacy-conscious users. Some fingerprinting scripts use automation detection to filter out fake traffic or apply different tracking logic.',
      deduction: 0
    };
  };

})(window.PrivacyTester);
