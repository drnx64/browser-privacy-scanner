window.PrivacyTester = window.PrivacyTester || {};
(function(ns) {
  ns.tests = ns.tests || {};

  ns.tests.testWebGL = async function() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

      if (!gl) {
        return {
          key: 'webgl',
          status: 'blocked',
          title: 'WebGL & GPU Unmasking',
          summary: 'WebGL context not available — GPU fingerprinting blocked.',
          explanation: 'WebGL exposes the exact GPU model, driver version, and vendor through its rendering pipeline. This is among the most identifying data points for device fingerprinting. Being blocked is a significant privacy win.',
          deduction: 0
        };
      }

      let vendor = 'Not available';
      let renderer = 'Not available';
      let unmasked = false;

      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL);
        renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
        unmasked = true;
      } else {
        vendor = gl.getParameter(gl.VENDOR);
        renderer = gl.getParameter(gl.RENDERER);
      }

      const isGeneric = (
        renderer.toLowerCase().includes('mesa') ||
        renderer.toLowerCase().includes('swiftshader') ||
        renderer.toLowerCase().includes('llvmpipe') ||
        renderer.toLowerCase().includes('google') ||
        renderer === 'WebKit WebGL' ||
        renderer === 'WebGL Default' ||
        vendor.toLowerCase().includes('webkit') ||
        vendor.toLowerCase().includes('google')
      );

      const maxTexSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      const maxViewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
      const maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
      const shadingLangVer = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
      const glVersion = gl.getParameter(gl.VERSION);

      const extensions = gl.getSupportedExtensions() || [];

      const details = {
        vendor,
        renderer,
        unmasked,
        maxTextureSize: maxTexSize,
        maxViewportWidth: maxViewportDims[0],
        maxViewportHeight: maxViewportDims[1],
        maxVertexAttribs,
        shadingLanguageVersion: shadingLangVer,
        webGLVersion: glVersion,
        extensionsCount: extensions.length
      };

      if (isGeneric || !unmasked) {
        return {
          key: 'webgl',
          status: 'blocked',
          title: 'WebGL & GPU Unmasking',
          summary: renderer ? `Renderer reported as "${renderer}" — appears generic or masked.` : 'WebGL renderer is masked — privacy protection active.',
          details,
          explanation: 'When the GPU vendor and renderer strings are hidden or return generic values (like "Mesa" or "Google SwiftShader"), fingerprinting scripts cannot identify your specific graphics card. This removes a major hardware-level identifying signal.',
          deduction: 0
        };
      }

      return {
        key: 'webgl',
        status: 'exposed',
        title: 'WebGL & GPU Unmasking',
        summary: `Exact GPU model exposed: ${renderer} (${vendor}). This is highly identifying.`,
        details,
        explanation: 'The unmasked WebGL renderer string reveals your exact GPU make, model, and driver version (e.g., "NVIDIA GeForce RTX 3080" or "AMD Radeon RX 6800 XT"). Combined with other signals, this can uniquely identify your device across the entire web. Only a handful of people share your exact GPU/driver combination.',
        remediation: 'Use Brave Browser (masks WebGL renderer strings). Firefox with privacy.resistFingerprinting=true swaps to "Mesa" generic strings. In Chrome, disable WebGL via chrome://flags/#disable-webgl. Tor Browser blocks WebGL debug info extension.',
        deduction: 10
      };
    } catch (e) {
      return {
        key: 'webgl',
        status: 'blocked',
        title: 'WebGL & GPU Unmasking',
        summary: 'WebGL API threw an error — GPU data protected.',
        explanation: 'If accessing WebGL parameters throws an error, the browser is actively protecting GPU-related fingerprinting vectors.',
        deduction: 0,
        error: e.message
      };
    }
  };

})(window.PrivacyTester);
