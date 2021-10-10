import { createCommand } from '../../command';

const PUBLIC_KEYS = 'public_keys';
const PRIVATE_KEYS = 'private_keys';
const OWNERTRUST = 'ownertrust';
const BACKUP = `${Date.now()}.gpg-backup.panza.tar.gz`;
const TEMP = `${Date.now()}.temp.panza`;

export const exportGPG = createCommand({
    usage: 'gpg-export',
    description: 'Export GPG keys',
    flags: {
        to: {
            flagType: 'option',
            description: 'path to the file where keys should be exported',
            type: 'string',
        },
    },
    async main({ $, fs, path, question, say, step }, flags) {
        const defaultPath = process.cwd();
        const exportPath = flags.to || await question('Where should I save exported keys', defaultPath);

        const normalizedPath = path.resolve(process.cwd(), exportPath);

        await fs.mkdirp(normalizedPath);
        await step('Exporting public keys', () => $`gpg --export --output ${path.join(normalizedPath, PUBLIC_KEYS)}`);
        await step('Exporting private keys', () => $`gpg --export-secret-keys --output ${path.join(normalizedPath, PRIVATE_KEYS)}`);
        await step('Exporting ownertrust', () => $`gpg --export-ownertrust > ${path.join(normalizedPath, OWNERTRUST)}`);
        await step('Packing all exported files into archive', () => $` cd ${normalizedPath} && tar --create --verbose --file ${BACKUP} ${[
            PUBLIC_KEYS,
            PRIVATE_KEYS,
            OWNERTRUST,
        ]}`);
        await step('Removing temporary files', () => Promise.all([
            path.join(normalizedPath, PUBLIC_KEYS),
            path.join(normalizedPath, PRIVATE_KEYS),
            path.join(normalizedPath, OWNERTRUST),
        ].map(file => fs.remove(file))));

        say(`Backup of your GPG keys is at ${path.join(normalizedPath, BACKUP)}`);
    },
});

export const importGPG = createCommand({
    usage: 'gpg-import',
    description: 'import GPG keys from backup',
    flags: {
        from: {
            flagType: 'option',
            description: 'path to the GPGP keys backup',
            type: 'string',
        },
    },
    async main({ $, fs, path, question, say, step }, flags) {
        const defaultPath = process.cwd();
        const backupPath = flags.from || await question('Where is a backup of your GPG keys?', defaultPath);
 
        const normalizedBackupPath = path.resolve(process.cwd(), backupPath);
        const normalizedTempDir = path.join(path.dirname(normalizedBackupPath), TEMP);

        await step('Unpacking backup into temporary directory', async () => {
            await fs.mkdirp(normalizedTempDir);
            await $`cd ${normalizedTempDir} && tar --extract --file ${normalizedBackupPath}`;
        });
        await step('Importing public keys', () => $`gpg --import ${path.join(normalizedTempDir, PUBLIC_KEYS)}`);
        await step('Importing private keys', () => $`gpg --allow-secret-key-import --import ${path.join(normalizedTempDir, PRIVATE_KEYS)}`);
        await step('Importing ownertrust', () => $`gpg --import-ownertrust ${path.join(normalizedTempDir, OWNERTRUST)}`);
        await step(`Removing temporary directory ${normalizedTempDir}`, () => fs.remove(normalizedTempDir));

        say('All your keys sucessfuly restored from backup');
    },
});
