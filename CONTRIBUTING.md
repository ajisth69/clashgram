# Contributing to Clashgram

Thank you for your interest in contributing to Clashgram! We appreciate your help in making Clashgram a faster, more secure, and privacy-focused Telegram client.

Please take a few moments to review this guide before you start contributing. It helps us keep the project organized and ensures a smooth contribution process.

---

## Our Development Principles

When contributing, please align your changes with Clashgram's core pillars:
1. **Absolute Privacy:** Never introduce telemetry, analytics, trackers, or cloud logging. All configurations and states must be kept completely client-side.
2. **Performance:** Clashgram is designed to be lightweight. Keep bundle sizes minimal, avoid heavy NPM packages, and ensure UI interactions are hardware-accelerated and smooth.
3. **Clean Code:** Use TypeScript features appropriately, document complex algorithms, and write simple, self-explanatory code.

---

## How to Help

### 1. Reporting Bugs & Requesting Features
* Search existing issues to verify your bug or request hasn't already been discussed.
* Use the provided GitHub issue templates to create your report.
* **Important Safeguard:** Never post sensitive information—such as Telegram API IDs/hashes, phone numbers, auth tokens, or private chat histories—in public issues or screenshots.

### 2. Setting Up Locally
To set up Clashgram for local development, follow these steps:
1. Fork and clone the repository.
2. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
3. Insert your Telegram API credentials in `.env` (obtainable from [my.telegram.org](https://my.telegram.org)).
4. Install dependencies:
   ```bash
   npm install
   ```
5. Launch the Webpack dev server:
   ```bash
   npm run dev
   ```

### 3. Submitting Changes
1. Create a descriptive branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-name
   ```
2. Verify that the code passes linting and TypeScript checks:
   ```bash
   npm run check
   ```
3. To automatically fix lint errors:
   ```bash
   npm run fix
   ```
4. Run the unit test suite:
   ```bash
   npm run test
   ```
5. Open a Pull Request (PR) against the `main` branch.
6. Fill out the PR template completely to explain what changes you made and how you verified them.

---

If you have any questions, feel free to open a GitHub Discussion or reach out to the project maintainers at `ajisth007@gmail.com`.
