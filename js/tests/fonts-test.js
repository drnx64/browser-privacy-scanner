window.PrivacyTester = window.PrivacyTester || {};
(function(ns) {
  ns.tests = ns.tests || {};

  ns.tests.testFonts = async function() {
    try {
      const fontList = [
        'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Courier New',
        'Verdana', 'Trebuchet MS', 'Impact', 'Comic Sans MS', 'Palatino Linotype',
        'Lucida Console', 'Tahoma', 'Geneva', 'Segoe UI', 'Roboto',
        'Open Sans', 'Lato', 'Montserrat', 'Merriweather', 'Playfair Display',
        'Fira Code', 'Monaco', 'Consolas', 'DejaVu Sans', 'Ubuntu',
        'Liberation Sans', 'Noto Sans', 'Franklin Gothic Medium', 'Cascadia Code',
        'Gill Sans', 'Optima', 'Baskerville', 'Didot', 'Rockwell'
      ];

      const testString = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const baseFont = 'monospace';
      const baseSize = '48px';

      const detector = document.createElement('span');
      detector.style.cssText = `position:absolute;left:-9999px;top:-9999px;visibility:hidden;white-space:nowrap;font-size:${baseSize};font-family:${baseFont}`;
      detector.textContent = testString;
      document.body.appendChild(detector);
      const baseWidth = detector.offsetWidth;
      document.body.removeChild(detector);

      const available = [];

      for (const font of fontList) {
        try {
          const el = document.createElement('span');
          el.style.cssText = `position:absolute;left:-9999px;top:-9999px;visibility:hidden;white-space:nowrap;font-size:${baseSize};font-family:"${font}",${baseFont}`;
          el.textContent = testString;
          document.body.appendChild(el);
          const w = el.offsetWidth;
          document.body.removeChild(el);
          if (w !== baseWidth) {
            available.push(font);
          }
        } catch (ex) {
          continue;
        }
      }

      if (available.length === 0) {
        return {
          key: 'fonts',
          status: 'blocked',
          title: 'Font Enumeration',
          summary: 'No system fonts could be detected — font fingerprinting blocked.',
          explanation: 'Font enumeration uses a CSS side-channel to detect which fonts are installed on your system. Your font list is a surprisingly unique fingerprint — the combination of fonts you have is almost certainly unique. Being unable to detect fonts is a privacy win.',
          deduction: 0
        };
      }

      const count = available.length;

      if (count < 8) {
        return {
          key: 'fonts',
          status: 'blocked',
          title: 'Font Enumeration',
          summary: `Only ${count} common fonts detected — likely privacy-protected.`,
          details: { detectedCount: count, fonts: available },
          explanation: 'When only a minimal set of fonts is detectable, the browser (or a privacy addon) is likely limiting font enumeration. This reduces the uniqueness of your font fingerprint.',
          deduction: 0
        };
      }

      return {
        key: 'fonts',
        status: count > 15 ? 'exposed' : 'warning',
        title: 'Font Enumeration',
        summary: `${count} system fonts detected. Your font profile is ${count > 20 ? 'highly' : 'moderately'} identifying.`,
        details: { detectedCount: count, fonts: available },
        explanation: `Your system has ${count} detectable fonts. The combination of installed fonts (especially rare or specialized ones) creates a surprisingly strong fingerprint — Panopticlick studies show that even common font sets can reduce anonymity sets dramatically. Trackers use this to complement canvas and WebGL fingerprints.`,
        remediation: 'Firefox with privacy.resistFingerprinting=true limits font enumeration to system defaults. Brave restricts font list exposure to 5-6 common fonts. Tor Browser allows zero font detection. The Font Fingerprint Defender extension randomizes font metrics per session.',
        deduction: count > 20 ? 5 : count > 15 ? 3 : 2
      };
    } catch (e) {
      return {
        key: 'fonts',
        status: 'blocked',
        title: 'Font Enumeration',
        summary: 'Font detection failed entirely — privacy protection.',
        explanation: 'CSS-based font enumeration was completely blocked. This removes an important side-channel for font profiling.',
        deduction: 0,
        error: e.message
      };
    }
  };

})(window.PrivacyTester);
