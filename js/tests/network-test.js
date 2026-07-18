window.PrivacyTester = window.PrivacyTester || {};
(function(ns) {
  ns.tests = ns.tests || {};

  ns.tests.testNetwork = async function() {
    try {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

      if (!connection) {
        return {
          key: 'network',
          status: 'info',
          title: 'Network Information',
          summary: 'Network Information API not available — connection details hidden.',
          explanation: 'The Network Information API exposes your connection type (Wi-Fi, cellular, ethernet) and speed. While not highly identifying alone, it adds to your browser fingerprint profile and can help trackers infer your environment.',
          deduction: 0
        };
      }

      const details = {};

      if (connection.effectiveType) {
        details.effectiveType = connection.effectiveType;
      }
      if (connection.downlink) {
        details.downlinkMbps = connection.downlink + ' Mbps';
      }
      if (connection.rtt) {
        details.rttMs = connection.rtt + ' ms';
      }
      if (connection.type) {
        details.connectionType = connection.type;
      }
      details.saveData = connection.saveData ? 'Enabled' : 'Disabled';

      return {
        key: 'network',
        status: 'info',
        title: 'Network Information',
        summary: details.effectiveType
          ? `Connection: ${details.connectionType || details.effectiveType}, ${details.downlinkMbps || 'unknown speed'}`
          : 'Some network metadata exposed.',
        details,
        explanation: 'The Network Information API lets trackers know your connection type and rough bandwidth. While this is low-entropy data, it can be used for real-time adaptation of tracking scripts and to infer whether you are at home (Wi-Fi) or mobile (cellular).',
        remediation: 'Firefox blocks the Network Information API by default. Chrome exposes it — use uBlock Origin with advanced privacy settings, or switch to Firefox/Tor Browser to eliminate this data point entirely.',
        deduction: 1
      };
    } catch (e) {
      return {
        key: 'network',
        status: 'info',
        title: 'Network Information',
        summary: 'Network Information API threw an error — data protected.',
        explanation: 'A blocked or erroring Network Information API prevents trackers from learning your connection details.',
        deduction: 0,
        error: e.message
      };
    }
  };

})(window.PrivacyTester);
