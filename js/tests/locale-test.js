window.PrivacyTester = window.PrivacyTester || {};
(function(ns) {
  ns.tests = ns.tests || {};

  ns.tests.testLocale = async function() {
    const details = {};
    let deduction = 0;

    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      details.timezone = tz || 'Not reported';
      if (tz) deduction += 1;
    } catch (e) {
      details.timezone = 'Not accessible';
    }

    try {
      const offset = new Date().getTimezoneOffset();
      const sign = offset <= 0 ? '+' : '-';
      const absOffset = Math.abs(offset);
      const hours = String(Math.floor(absOffset / 60)).padStart(2, '0');
      const minutes = String(absOffset % 60).padStart(2, '0');
      details.timezoneOffset = `UTC${sign}${hours}:${minutes}`;
      details.timezoneOffsetMinutes = offset;
      deduction += 1;
    } catch (e) {
      details.timezoneOffset = 'Not accessible';
    }

    try {
      details.languages = navigator.languages ? Array.from(navigator.languages) : [navigator.language || 'Not reported'];
      deduction += 1;
    } catch (e) {
      details.languages = ['Not accessible'];
    }

    try {
      details.locale = navigator.language || 'Not reported';
    } catch (e) {
      details.locale = 'Not accessible';
    }

    try {
      const dtf = new Intl.DateTimeFormat(navigator.language);
      const examples = [
        dtf.format(new Date(2026, 0, 15)),
        dtf.format(new Date(2026, 6, 4))
      ];
      details.dateFormatExamples = examples;
    } catch (e) {}

    try {
      const nf = new Intl.NumberFormat(navigator.language);
      details.numberFormatExample = nf.format(1234567.89);
    } catch (e) {}

    return {
      key: 'locale',
      status: details.timezone && details.languages ? 'info' : 'blocked',
      title: 'Timezone & Locale Profile',
      summary: details.timezone
        ? `Timezone: ${details.timezone} (${details.timezoneOffset}), Languages: ${details.languages.join(', ')}`
        : 'Timezone and locale information protected.',
      details,
      explanation: 'Your timezone narrows your geographic location to a specific region (often a single country or state). Combined with your language preferences, this creates a strong geo-location signal. Even without IP geolocation, trackers can infer your likely country, work hours, and language community.',
      remediation: 'Firefox with privacy.resistFingerprinting=true spoofs timezone to UTC and limits language preference exposure. Tor Browser standardizes timezone, locale, and language lists across all users — this is the gold standard for locale privacy.',
      deduction
    };
  };

})(window.PrivacyTester);
