window.PrivacyTester = window.PrivacyTester || {};
(function(ns) {
  ns.tests = ns.tests || {};

  ns.tests.testHardware = async function() {
    const details = {};
    let deduction = 0;

    try {
      const cores = navigator.hardwareConcurrency;
      if (cores) {
        details.cpuCores = cores;
        deduction += 2;
      } else {
        details.cpuCores = 'Not reported';
      }
    } catch (e) {
      details.cpuCores = 'Not accessible';
    }

    try {
      if ('deviceMemory' in navigator) {
        const mem = navigator.deviceMemory;
        details.deviceMemory = mem ? mem + ' GB' : 'Not reported';
        if (mem) deduction += 2;
      } else {
        details.deviceMemory = 'Not supported';
      }
    } catch (e) {
      details.deviceMemory = 'Not accessible';
    }

    try {
      const screen = window.screen;
      details.screenResolution = screen.width + ' x ' + screen.height;
      details.colorDepth = screen.colorDepth + '-bit';
      details.pixelDepth = screen.pixelDepth + '-bit';
      if (screen.width && screen.height) deduction += 1;
    } catch (e) {
      details.screenResolution = 'Not accessible';
    }

    try {
      details.orientation = screen.orientation ? screen.orientation.type : 'Not available';
    } catch (e) {
      details.orientation = 'Not accessible';
    }

    try {
      const touchPoints = navigator.maxTouchPoints;
      details.maxTouchPoints = touchPoints !== undefined ? touchPoints : 'Not reported';
    } catch (e) {
      details.maxTouchPoints = 'Not accessible';
    }

    try {
      details.windowInner = window.innerWidth + ' x ' + window.innerHeight;
      details.windowOuter = window.outerWidth + ' x ' + window.outerHeight;
      details.devicePixelRatio = window.devicePixelRatio.toFixed(2);
      deduction += 1;
    } catch (e) {
      details.windowInner = 'Not accessible';
    }

    const exposed = deduction >= 4;

    return {
      key: 'hardware',
      status: exposed ? 'warning' : 'info',
      title: 'Device Hardware Profile',
      summary: exposed
        ? `Device specs exposed: ${details.cpuCores || '?'} cores, ${details.deviceMemory || '?'} RAM, ${details.screenResolution || '?'} screen.`
        : 'Limited hardware information available.',
      details,
      explanation: 'Hardware specs like CPU cores, RAM, screen resolution, and pixel ratio are used by fingerprinting scripts as additional entropy sources. While individually weak, combined they help narrow down your device model and configuration, especially when correlated with other signals like GPU and browser version.',
      remediation: 'Firefox with privacy.resistFingerprinting=true spoofs hardwareConcurrency to 2. Tor Browser reports standardized screen dimensions. Brave may limit some sensor data. For Firefox, set dom.maxHardwareConcurrency and deviceMemory overrides in about:config.',
      deduction
    };
  };

})(window.PrivacyTester);
