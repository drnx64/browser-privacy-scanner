window.PrivacyTester = window.PrivacyTester || {};
(function(ns) {
  ns.tests = ns.tests || {};

  ns.tests.testAPIs = async function() {
    const apiChecks = {
      webBluetooth: false,
      webUSB: false,
      webShare: false,
      serviceWorker: false,
      webMIDI: false,
      webSerial: false,
      webNFC: false,
      webVR: false,
      webXR: false,
      webGPU: false,
      screenWakeLock: false,
      clipboardAPI: false,
      ambientLight: false,
      proximity: false,
      batteryAPI: false,
      geolocationAPI: false,
      mediaDevices: false,
      webSpeech: false,
      webRTC: false,
      webSockets: false
    };

    try { apiChecks.webBluetooth = !!navigator.bluetooth; } catch (e) {}
    try { apiChecks.webUSB = !!navigator.usb; } catch (e) {}
    try { apiChecks.webShare = !!navigator.share; } catch (e) {}
    try { apiChecks.serviceWorker = !!navigator.serviceWorker; } catch (e) {}
    try { apiChecks.webMIDI = !!navigator.requestMIDIAccess; } catch (e) {}
    try { apiChecks.webSerial = !!navigator.serial; } catch (e) {}
    try { apiChecks.webNFC = !!navigator.nfc; } catch (e) {}
    try { apiChecks.webVR = !!navigator.getVRDisplays; } catch (e) {}
    try { apiChecks.webXR = !!navigator.xr; } catch (e) {}
    try { apiChecks.webGPU = !!navigator.gpu; } catch (e) {}
    try { apiChecks.screenWakeLock = !!navigator.wakeLock; } catch (e) {}
    try { apiChecks.clipboardAPI = !!navigator.clipboard; } catch (e) {}
    try { apiChecks.ambientLight = !!window.AmbientLightSensor; } catch (e) {}
    try { apiChecks.proximity = !!window.ProximitySensor; } catch (e) {}
    try { apiChecks.batteryAPI = !!navigator.getBattery; } catch (e) {}
    try { apiChecks.geolocationAPI = !!navigator.geolocation; } catch (e) {}
    try { apiChecks.mediaDevices = !!navigator.mediaDevices; } catch (e) {}
    try { apiChecks.webSpeech = !!window.SpeechRecognition || !!window.webkitSpeechRecognition; } catch (e) {}
    try { apiChecks.webRTC = !!window.RTCPeerConnection; } catch (e) {}
    try { apiChecks.webSockets = !!window.WebSocket; } catch (e) {}

    const available = Object.entries(apiChecks)
      .filter(([, v]) => v)
      .map(([k]) => k.replace('API', '').replace(/([A-Z])/g, ' $1').trim());

    const sensitiveAPIs = ['webBluetooth', 'webUSB', 'webSerial', 'webMIDI', 'webNFC', 'webGPU'];
    const sensitiveAvailable = sensitiveAPIs.filter(k => apiChecks[k]);

    return {
      key: 'apis',
      status: sensitiveAvailable.length > 0 ? 'warning' : 'info',
      title: 'API Capabilities Checklist',
      summary: `${available.length} APIs available. ${sensitiveAvailable.length > 0 ? sensitiveAvailable.length + ' sensitive hardware APIs detected.' : 'No exotic hardware APIs detected.'}`,
      details: {
        apiCount: available.length,
        availableAPIs: available,
        sensitiveAPIs: sensitiveAvailable.map(k => k.replace('API', '').replace(/([A-Z])/g, ' $1').trim()),
        raw: apiChecks
      },
      explanation: 'The availability of advanced APIs (especially hardware-access APIs like WebUSB, WebBluetooth, WebSerial) expands the browser\'s attack surface and fingerprinting potential. Each available API adds entropy to your browser signature. Exotic API availability is rare and thus highly identifying.',
      remediation: 'In Chrome, disable unused APIs via chrome://flags (e.g., WebUSB, WebBluetooth, WebSerial). For Firefox, use enterprise policies or about:config to disable features. Brave and Tor disable most exotic hardware APIs by default — switching to them eliminates this attack surface.',
      deduction: sensitiveAvailable.length > 0 ? Math.min(sensitiveAvailable.length * 2, 6) : 0
    };
  };

})(window.PrivacyTester);
