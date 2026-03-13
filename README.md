# Check `package.json`
`spond` is a package for interacting with the Spond API using TypeScript. This project is configured to be deployed as a Google Apps Script library.

## Installation

```bash
npm install
```

## Development & Building

This project uses **Vite** to bundle the TypeScript code into a format compatible with Google Apps Script (GAS). The build is split into two parts: a *vendor* bundle and an *app* bundle. This separation prevents large vendor files from being rebuilt constantly and makes debugging your application logic easier.

- **`dist/spond.js`**: Your application logic.
- **`dist/vendor.js`**: Bundled dependencies (axios, tough-cookie, etc.).

### Build Commands

- **Build for Development** (includes tests):
  ```bash
  npm run build:dev
  ```

- **Build for Production** (excludes tests):
  ```bash
  npm run build:prod
  ```

## Deployment to Google Apps Script

Deployments are managed via `clasp` and a custom `deploy.js` script. Configuration for deployments (Script IDs, Version numbers) is stored in `config.js`.

### Prerequisite
1. Install dependencies: `npm install`
2. Log in to Clasp: `npx clasp login`

### Configuration (`config.js`)
Update `config.js` with your specific **Deployment IDs** for `dev` and `prod` environments.

```javascript
module.exports = {
  dev: {
    version: 'SNAPSHOT-0.1.0',
    deploymentId: 'YOUR_DEV_DEPLOYMENT_ID',
  },
  prod: {
    version: 'RELEASE-1.0.0',
    deploymentId: 'YOUR_PROD_DEPLOYMENT_ID',
  }
};
```

### Deploy Commands

- **Deploy to Development**:
  ```bash
  npm run deploy:dev
  ```
  *   Builds the project (including `tests/`).
  *   Pushes code to the GAS project.
  *   Updates the 'dev' deployment to point to the latest version.

- **Deploy to Production**:
  ```bash
  npm run deploy:prod
  ```
  *   Builds the project (excluding `tests/`).
  *   Pushes code to the GAS project.
  *   Updates the 'prod' deployment.

## Usage in Apps Script

Since the code is bundled as an IIFE (Immediately Invoked Function Expression), the classes are available via the global `SpondJS` object.

```javascript
// in your Google Apps Script file (e.g. Code.gs)

function myFunction() {
  const spond = new SpondJS.Spond('username', 'password');
  // ...
}
```

## Local Usage

```typescript
import { Spond } from './src/spond';

const username = 'your-email@example.com';
const password = 'your-password';

const client = new Spond(username, password);

(async () => {
  try {
    const profile = await client.getProfile();
    console.log('Profile:', profile);

    const groups = await client.getGroups();
    console.log('Groups:', groups);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

## Features

- Authentication handling
- Fetch user profile
- Fetch groups
- Support for event templates (implied by file structure)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
