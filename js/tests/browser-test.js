window.PrivacyTester = window.PrivacyTester || {};
(function(ns) {
  ns.tests = ns.tests || {};

  ns.tests.testBrowser = async function() {
    const details = {};

    try {
      details.userAgent = navigator.userAgent || 'Not reported';
    } catch (e) {
      details.userAgent = 'Not accessible';
    }

    try {
      details.platform = navigator.platform || 'Not reported';
    } catch (e) {
      details.platform = 'Not accessible';
    }

    try {
      if (navigator.userAgentData) {
        const uaData = navigator.userAgentData;
        details.uaBrands = uaData.brands ? uaData.brands.map(b => `${b.brand} v${b.version}`) : undefined;
        details.uaMobile = uaData.mobile;
        details.uaPlatform = uaData.platform;
        details.uaArchitecture = uaData.architecture;
        details.uaModel = uaData.model;
        details.uaUAFullVersion = uaData.uaFullVersion;
        details.uaBitness = uaData.bitness;
        details.userAgentDataAvailable = true;
      } else {
        details.userAgentDataAvailable = false;
      }
    } catch (e) {
      details.userAgentDataAvailable = false;
    }

    try {
      details.cookiesEnabled = navigator.cookieEnabled;
    } catch (e) {
      details.cookiesEnabled = 'Unknown';
    }

    try {
      details.doNotTrack = navigator.doNotTrack || navigator.msDoNotTrack || 'Not set';
    } catch (e) {
      details.doNotTrack = 'Not accessible';
    }

    let browserName = 'Unknown';
    const ua = details.userAgent.toLowerCase();

    if (ua.includes('edg/') || ua.includes('edge/')) {
      if (ua.includes('edg/')) browserName = 'Microsoft Edge (Chromium)';
      else browserName = 'Microsoft Edge (Legacy)';
    } else if (ua.includes('chrome/') || ua.includes('crios/')) {
      if (ua.includes('brave')) browserName = 'Brave';
      else if (ua.includes('opr/') || ua.includes('opera')) browserName = 'Opera';
      else if (ua.includes('vivaldi')) browserName = 'Vivaldi';
      else browserName = 'Google Chrome';
    } else if (ua.includes('firefox/') || ua.includes('fxios/')) {
      browserName = 'Mozilla Firefox';
    } else if (ua.includes('safari/') && !ua.includes('chrome/')) {
      browserName = 'Apple Safari';
    }

    details.browserName = browserName;

    return {
      key: 'browser',
      status: 'info',
      title: 'Browser Identity & Engine',
      summary: `${browserName} on ${details.platform}`,
      details,
      explanation: 'The User-Agent string reveals your browser vendor, major version, rendering engine, and operating system. Combined with platform and User-Agent Client Hints (UA-CH), this provides trackers with your exact software stack. While UA strings can be spoofed, the combination of many signals makes real misidentification difficult.',
      remediation: 'Tor Browser provides a nearly identical UA across all users. Firefox with privacy.resistFingerprinting=true normalizes the UA. User-Agent spoofing extensions exist but are often detectable via UA-CH inconsistencies. Best approach: use Tor for anonymity, or Firefox with privacy.resistFingerprinting for strong privacy.',
      deduction: 0
    };
  };

})(window.PrivacyTester);
