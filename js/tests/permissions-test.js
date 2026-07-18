window.PrivacyTester = window.PrivacyTester || {};
(function(ns) {
  ns.tests = ns.tests || {};

  ns.tests.testPermissions = async function() {
    const permissionNames = [
      'geolocation',
      'notifications',
      'camera',
      'microphone',
      'clipboard-read',
      'clipboard-write',
      'midi',
      'midi-sysex',
      'push',
      'persistent-storage',
      'background-sync',
      'ambient-light-sensor',
      'accelerometer',
      'gyroscope',
      'magnetometer',
      'screen-wake-lock',
      'nfc',
      'display-capture'
    ];

    const permResults = {};

    for (const name of permissionNames) {
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const result = await navigator.permissions.query({ name });
          permResults[name] = result.state;
          if (result.state === 'granted') {
          }
        } else {
          permResults[name] = 'unsupported';
        }
      } catch (e) {
        permResults[name] = 'error';
      }
    }

    const granted = Object.entries(permResults)
      .filter(([, v]) => v === 'granted')
      .map(([k]) => k);
    const denied = Object.entries(permResults)
      .filter(([, v]) => v === 'denied')
      .map(([k]) => k);
    const prompted = Object.entries(permResults)
      .filter(([, v]) => v === 'prompt')
      .map(([k]) => k);

    const sensitiveGranted = granted.filter(p =>
      ['geolocation', 'camera', 'microphone', 'notifications'].includes(p)
    );

    let deduction = 0;
    if (sensitiveGranted.length >= 3) deduction = 5;
    else if (sensitiveGranted.length >= 1) deduction = 3;

    return {
      key: 'permissions',
      status: sensitiveGranted.length > 0 ? 'warning' : 'info',
      title: 'Permissions API Audit',
      summary: sensitiveGranted.length > 0
        ? `${sensitiveGranted.length} sensitive permission(s) already granted: ${sensitiveGranted.join(', ')}.`
        : 'No sensitive permissions are in "granted" state. Good privacy posture.',
      details: {
        granted,
        denied,
        prompt: prompted,
        all: permResults
      },
      explanation: 'The Permissions API reveals which capabilities you have already granted to websites. Pre-granted permissions for geolocation, camera, or microphone are particularly valuable to trackers — they indicate that websites can access these sensors without triggering a prompt. A clean slate (all "prompt" or "denied") means trackers get no information about your sensor access history.',
      remediation: 'Revoke unused permissions immediately: Chrome -> chrome://settings/content, Firefox -> about:preferences#privacy (Permissions section). Use Firefox "Temporary Permissions" (auto-revoke on tab close). Regular audit of granted permissions is recommended. Brave disables permission queries for fingerprinting-resistant APIs.',
      deduction
    };
  };

})(window.PrivacyTester);
