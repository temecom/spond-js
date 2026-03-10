import { Spond } from './src';
import * as fs from 'fs';
import * as path from 'path';

// Load secrets from .secrets.json
const secretsPath = path.resolve(__dirname, '.secrets.json');
if (!fs.existsSync(secretsPath)) {
    console.error(`Error: Secrets file not found at ${secretsPath}`);
    process.exit(1);
}

const secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf-8'));
const { username, password } = secrets;

if (!username || !password) {
    console.error("Error: 'username' and 'password' must be set in .secrets.json");
    process.exit(1);
}

async function main() {
    const spond = new Spond(username, password);
    await spond.login();
    const groups = await spond.getGroups();
    console.log(groups);
}
main();