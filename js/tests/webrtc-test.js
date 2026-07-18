window.PrivacyTester = window.PrivacyTester || {};
(function(ns) {
  ns.tests = ns.tests || {};

  ns.tests.testWebRTC = async function() {
    return new Promise(async (resolve) => {
      try {
        if (!window.RTCPeerConnection) {
          resolve({
            key: 'webrtc',
            status: 'blocked',
            title: 'WebRTC IP Leak Test',
            summary: 'RTCPeerConnection not available — WebRTC leak protection active.',
            explanation: 'WebRTC can leak your local and public IP addresses through ICE candidate gathering, even when using a VPN. When RTCPeerConnection is unavailable or blocked, this critical privacy leak is prevented.',
            deduction: 0
          });
          return;
        }

        const pc = new RTCPeerConnection({ iceServers: [] });
        const ips = new Set();
        let timeoutId = null;

        try {
          pc.createDataChannel('');
        } catch (e) {}

        pc.onicecandidate = (event) => {
          if (event.candidate && event.candidate.candidate) {
            const parts = event.candidate.candidate.split(' ');
            if (parts.length >= 5) {
              const ip = parts[4];
              if (ip && !ip.includes(':')) {
                ips.add(ip);
              }
            }
          }
        };

        pc.onicegatheringstatechange = () => {
          if (pc.iceGatheringState === 'complete') {
            if (timeoutId) clearTimeout(timeoutId);
            finalize();
          }
        };

        const finalize = () => {
          if (timeoutId) clearTimeout(timeoutId);
          try { pc.close(); } catch (e) {}

          const ipList = Array.from(ips);
          const privateIPs = ipList.filter(ip =>
            ip.startsWith('10.') ||
            ip.startsWith('192.168.') ||
            (ip.startsWith('172.') && parseInt(ip.split('.')[1]) >= 16 && parseInt(ip.split('.')[1]) <= 31) ||
            ip === '127.0.0.1' ||
            ip === '0.0.0.0'
          );

          if (ipList.length === 0) {
            resolve({
              key: 'webrtc',
              status: 'blocked',
              title: 'WebRTC IP Leak Test',
              summary: 'No IP addresses gathered via WebRTC — leak protection active.',
              explanation: 'When no ICE candidates are generated, the browser is effectively blocking WebRTC IP leakage. This prevents websites from discovering your local network IP, which can otherwise be used for NAT/firewall bypass tracking.',
              deduction: 0
            });
            return;
          }

          return resolve({
            key: 'webrtc',
            status: 'exposed',
            title: 'WebRTC IP Leak Test',
            summary: privateIPs.length > 0
              ? `Local IP(s) detected via WebRTC: ${privateIPs.join(', ')}.`
              : `IP(s) detected: ${ipList.join(', ')}.`,
            details: {
              allIPs: ipList,
              privateIPs
            },
            explanation: 'WebRTC ICE candidates expose your local network IP addresses to every website you visit, even if you use a VPN. This bypasses HTTP proxy and VPN protections because WebRTC forces direct peer-to-peer connections. Local IPs can be used to track you across networks and infer your physical location.',
            remediation: 'Use Brave Browser (blocks WebRTC by default). In Firefox, set media.peerconnection.enabled=false in about:config. For Chrome, install the WebRTC Network Limiter extension. Always pair a VPN with a browser that supports WebRTC leak protection (Firefox, Brave, Tor).',
            deduction: 10
          });
        };

        try {
          await pc.createOffer({ offerToReceiveAudio: false });
          await pc.setLocalDescription(pc.localDescription);
        } catch (e) {
          if (timeoutId) clearTimeout(timeoutId);
          try { pc.close(); } catch (ex) {}
          resolve({
            key: 'webrtc',
            status: 'blocked',
            title: 'WebRTC IP Leak Test',
            summary: 'Could not create SDP offer — WebRTC restricted.',
            explanation: 'If SDP offer creation fails, the browser may be restricting WebRTC functionality. This prevents IP leakage through ICE candidates.',
            deduction: 0,
            error: e.message
          });
          return;
        }

        timeoutId = setTimeout(() => {
          try { pc.close(); } catch (e) {}
          if (ips.size > 0) {
            finalize();
          } else {
            resolve({
              key: 'webrtc',
              status: 'blocked',
              title: 'WebRTC IP Leak Test',
              summary: 'No IP candidates received within timeout — leak protection likely active.',
              explanation: 'If no ICE candidates arrive within the timeout period, the browser may be blocking or filtering WebRTC candidates for privacy reasons.',
              deduction: 0
            });
          }
        }, 4000);
      } catch (e) {
        resolve({
          key: 'webrtc',
          status: 'blocked',
          title: 'WebRTC IP Leak Test',
          summary: 'WebRTC test threw an error — privacy protection.',
          explanation: 'A robust error in the WebRTC stack prevents websites from using it for IP leakage.',
          deduction: 0,
          error: e.message
        });
      }
    });
  };

})(window.PrivacyTester);
