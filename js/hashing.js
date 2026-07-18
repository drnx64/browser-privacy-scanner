window.PrivacyTester = window.PrivacyTester || {};

(function(ns) {

  async function sha256(message) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      return fnv1a(message);
    }
  }

  async function sha256Buffer(buffer) {
    try {
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      const str = Array.from(new Uint8Array(buffer)).map(b => String.fromCharCode(b)).join('');
      return fnv1a(str);
    }
  }

  function fnv1a(str) {
    let hash = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619) >>> 0;
    }
    return hash.toString(16).padStart(8, '0');
  }

  function fnv1a64(str) {
    let h1 = 2166136261 >>> 0;
    let h2 = 16777619 >>> 0;
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      h1 ^= c;
      h2 ^= i;
      h1 = Math.imul(h1, 16777619) >>> 0;
      h2 = Math.imul(h2, 16777619) >>> 0;
    }
    const h = (BigInt ? (BigInt(h2) << 32n | BigInt(h1)) : (h2.toString(16) + h1.toString(16).padStart(8, '0')));
    return typeof h === 'bigint' ? h.toString(16).padStart(16, '0') : h;
  }

  async function hashCanvas(canvas) {
    try {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) {
        const dataUrl = canvas.toDataURL();
        return fnv1a(dataUrl);
      }
      const buffer = await blob.arrayBuffer();
      return await sha256Buffer(buffer);
    } catch (e) {
      try {
        const dataUrl = canvas.toDataURL();
        return fnv1a(dataUrl);
      } catch (e2) {
        return null;
      }
    }
  }

  async function hashAudioData(dataArray) {
    const str = Array.from(dataArray).map(b => b.toString(16).padStart(2, '0')).join('');
    return await sha256(str);
  }

  ns.hash = {
    sha256,
    sha256Buffer,
    fnv1a,
    fnv1a64,
    hashCanvas,
    hashAudioData
  };

})(window.PrivacyTester);
