window.PrivacyTester = window.PrivacyTester || {};
(function(ns) {
  ns.tests = ns.tests || {};

  ns.tests.testWebAudio = async function() {
    let audioCtx = null;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) {
        return {
          key: 'webaudio',
          status: 'blocked',
          title: 'WebAudio API Fingerprinting',
          summary: 'AudioContext not available — privacy protection active.',
          explanation: 'WebAudio fingerprinting exploits subtle hardware-level differences in how your system processes audio signals (oscillator harmonics, compressor dynamics, DAC output). When blocked, this sophisticated tracking vector is eliminated.',
          deduction: 0
        };
      }

      audioCtx = new AC();

      if (audioCtx.state === 'suspended') {
        return {
          key: 'webaudio',
          status: 'blocked',
          title: 'WebAudio API Fingerprinting',
          summary: 'AudioContext suspended, requires user gesture — privacy protection.',
          explanation: 'Modern browsers now require user interaction to start AudioContexts, preventing silent audio fingerprinting in the background. This is an important privacy safeguard.',
          deduction: 0
        };
      }

      const sampleRate = audioCtx.sampleRate;
      const oscillator = audioCtx.createOscillator();
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);

      const compressor = audioCtx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-50, audioCtx.currentTime);
      compressor.knee.setValueAtTime(40, audioCtx.currentTime);
      compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
      compressor.attack.setValueAtTime(0, audioCtx.currentTime);
      compressor.release.setValueAtTime(0.25, audioCtx.currentTime);

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;

      oscillator.connect(compressor);
      compressor.connect(analyser);
      oscillator.start(0);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      oscillator.stop(0);
      oscillator.disconnect();
      compressor.disconnect();
      analyser.disconnect();

      const hasNonZero = dataArray.some(v => v > 0);
      if (!hasNonZero) {
        await audioCtx.close();
        return {
          key: 'webaudio',
          status: 'blocked',
          title: 'WebAudio API Fingerprinting',
          summary: 'Audio data returned all zeros — audio stack is faked/blocked.',
          explanation: 'Privacy-focused browsers like Brave may return zeroed-out audio data to prevent frequency-response fingerprinting. This neutralizes the audio-based tracking vector.',
          deduction: 0
        };
      }

      let usedValues;
      if (dataArray.length > 200) {
        usedValues = dataArray.slice(0, 200);
      } else {
        usedValues = Array.from(dataArray);
      }

      const hash = await ns.hash.hashAudioData(usedValues);

      await audioCtx.close();

      return {
        key: 'webaudio',
        status: 'exposed',
        title: 'WebAudio API Fingerprinting',
        summary: 'Audio fingerprint hash generated. Your audio stack produces a unique signature.',
        details: {
          hash,
          sampleRate,
          fftSize: 2048,
          frequencyBins: dataArray.length
        },
        explanation: 'WebAudio fingerprinting captures micro-variations in your system\'s audio processing pipeline — the DAC, audio drivers, sample rate conversion, and compressor dynamics. Combined with canvas fingerprinting, this creates a highly stable, cross-session device ID that is extremely difficult to spoof.',
        remediation: 'Brave Browser zeroes-out audio frequency data by default. Firefox with privacy.resistFingerprinting=true blocks AudioContext. Tor Browser disables AudioContext entirely. Avoid Chromium-based browsers without privacy patches.',
        deduction: 8
      };
    } catch (e) {
      if (audioCtx) {
        try { await audioCtx.close(); } catch (ex) {}
      }
      return {
        key: 'webaudio',
        status: 'blocked',
        title: 'WebAudio API Fingerprinting',
        summary: 'WebAudio API threw an error — privacy protection active.',
        explanation: 'If AudioContext construction or oscillator processing is blocked, trackers cannot build your audio fingerprint. This eliminates a sophisticated hardware-level tracking vector.',
        deduction: 0,
        error: e.message
      };
    }
  };

})(window.PrivacyTester);
