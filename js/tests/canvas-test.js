window.PrivacyTester = window.PrivacyTester || {};
(function(ns) {
  ns.tests = ns.tests || {};

  ns.tests.testCanvas = async function() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 420;
      canvas.height = 240;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        return {
          key: 'canvas',
          status: 'blocked',
          title: 'Canvas Fingerprinting',
          summary: 'Canvas 2D context blocked — privacy protection active.',
          explanation: 'Canvas fingerprinting renders hidden images to generate a unique device signature based on GPU drivers, font rendering, and sub-pixel positioning. Being blocked is a strong privacy win.',
          deduction: 0
        };
      }

      ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'left';

      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, 420, 240);

      ctx.fillStyle = '#123456';
      ctx.font = 'bold 38px "Arial", "Helvetica", sans-serif';
      ctx.fillText('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 12, 52);

      ctx.font = '26px "Times New Roman", serif';
      ctx.fillStyle = '#654321';
      ctx.fillText('abcdefghijklmnopqrstuvwxyz', 12, 92);

      ctx.font = '20px "Courier New", monospace';
      ctx.fillStyle = '#ff6b35';
      ctx.fillText('0123456789 !@#$%^&*()_+-=[]{}|;:,.<>?', 12, 128);

      ctx.font = '16px "Georgia", serif';
      ctx.fillStyle = '#4a9eff';
      ctx.fillText('The quick brown fox jumps over the lazy dog.', 12, 156);

      ctx.fillStyle = 'rgba(200, 50, 100, 0.6)';
      ctx.beginPath();
      ctx.arc(340, 180, 36, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(50, 200, 100, 0.5)';
      ctx.beginPath();
      ctx.arc(370, 150, 28, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(50, 100, 200, 0.4)';
      ctx.beginPath();
      ctx.arc(310, 150, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#00d4aa';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.rect(260, 120, 100, 60);
      ctx.stroke();

      const gradient = ctx.createLinearGradient(12, 180, 180, 220);
      gradient.addColorStop(0, 'rgba(255, 0, 0, 0.7)');
      gradient.addColorStop(0.5, 'rgba(0, 255, 0, 0.7)');
      gradient.addColorStop(1, 'rgba(0, 0, 255, 0.7)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(100, 200, 80, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      ctx.font = '14px "Comic Sans MS", cursive';
      ctx.fillStyle = '#333333';
      ctx.fillText('Fingerprint', 160, 220);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      const hash = await ns.hash.hashCanvas(canvas);
      if (!hash) {
        return {
          key: 'canvas',
          status: 'blocked',
          title: 'Canvas Fingerprinting',
          summary: 'Canvas rendering available but fingerprint hash extraction blocked.',
          explanation: 'Some browsers block toDataURL() or toBlob() on canvas elements to prevent fingerprinting. This effectively neuters canvas-based tracking.',
          deduction: 0
        };
      }

      return {
        key: 'canvas',
        status: 'exposed',
        title: 'Canvas Fingerprinting',
        summary: 'Canvas fingerprint hash generated. Your GPU/driver stack produces a unique rendering signature.',
        details: { hash },
        explanation: 'Canvas fingerprinting is one of the most accurate tracking techniques. The hash identifies your specific GPU, driver version, OS font renderer, and even browser build — creating a stable, unique device ID. Trackers like CanvasBlocker and fingerprinting scripts use this to follow you across sessions without cookies.',
        remediation: 'Switch to Brave Browser (farbles canvas output randomly per session), or Firefox with privacy.resistFingerprinting=true. The CanvasBlocker extension randomizes canvas hashes. Tor Browser blocks canvas reads entirely.',
        deduction: 12
      };
    } catch (e) {
      return {
        key: 'canvas',
        status: 'blocked',
        title: 'Canvas Fingerprinting',
        summary: 'Canvas API blocked or threw an error — privacy protection active.',
        explanation: 'Canvas fingerprinting is a primary vector for device tracking. If the canvas APIs are blocked or distorted (e.g., Brave\'s farbling), trackers cannot generate your unique rendering signature.',
        deduction: 0,
        error: e.message
      };
    }
  };

})(window.PrivacyTester);
