# Browser Privacy Scanner

A **100% client-side** browser fingerprinting and privacy analysis tool. Runs entirely in your browser — zero data is sent to any server.

## Features

- **13 Privacy Tests** across 4 categories:
  - **Hardware & Silicon Blueprint** — Canvas, WebAudio, WebGL, Fonts, Hardware
  - **Network & Environment** — WebRTC, Network, Locale
  - **Software & Automation** — Browser, Bot Detection, APIs
  - **Tracking & Permissions** — Storage, Permissions
- **Live Scan** with progress bar and per-test status updates
- **Risk Assessment** with gradient score bar and threat level classification
- **Test Result Details** — expandable drawer with raw data, explanations, and remediation steps
- **Save Report as Image** — canvas-rendered PNG export (no external libraries)
- **Dark Theme UI** — professional security audit interface
- **Zero Dependencies** — no frameworks, no CDN, no build step, works from `file://`

## Usage

Open `index.html` in any modern browser and click **Start Test**.

## Privacy

All tests execute locally via JavaScript. No data is ever transmitted — the network test only checks if WebRTC leaks your local IP, and does not contact any external server.

## License

MIT
