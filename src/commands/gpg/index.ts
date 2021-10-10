import { createCommand } from '../../command';

const PUBLIC_KEYS = 'public_keys';
const PRIVATE_KEYS = 'private_keys';
const OWNERTRUST = 'ownertrust';
const BACKUP = `${Date.now()}.gpg-backup.tar.gz`;
const TMP = `${Date.now()}.panza.tmp`;

export const exportGPG = createCommand({
    usage: 'gpg-export',
    description: 'Export GPG keys',
    flags: {},
    async main({ $, fs, path, say, step }) {
        const tempDirPath = path.join(process.cwd(), TMP);
        const backupPath = path.join(process.cwd(), BACKUP);

        await fs.mkdirp(tempDirPath);
        await step('Exporting public keys', () => $`gpg --export --output ${path.join(tempDirPath, PUBLIC_KEYS)}`);
        await step('Exporting private keys', () => $`gpg --export-secret-keys --output ${path.join(tempDirPath, PRIVATE_KEYS)}`);
        await step('Exporting ownertrust', () => $`gpg --export-ownertrust > ${path.join(tempDirPath, OWNERTRUST)}`);
        await step('Packing all exported files into archive', () => $`tar czvf ${backupPath} -C ${tempDirPath} ${[
            PUBLIC_KEYS,
            PRIVATE_KEYS,
            OWNERTRUST,
        ]}`);
        await step('Removing temporary files', () => fs.remove(tempDirPath));

        say(`Backup of your GPG keys is at ${backupPath}`);
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
    async main({ $, fs, path, prompt, say, step }, flags) {
        const backupPath = flags.from || await prompt({
            message: 'Where is a backup of your GPG keys?',
            default: process.cwd(),
            type: 'input',
        });
 
        const tempDirPath = path.join(path.dirname(backupPath), TMP);

        await step('Unpacking backup into temporary directory', async () => {
            await fs.mkdirp(tempDirPath);
            await $`tar --extract --file ${backupPath} -C ${tempDirPath}`;
        });
        await step('Importing public keys', () => $`gpg --import ${path.join(tempDirPath, PUBLIC_KEYS)}`);
        await step('Importing private keys', () => $`gpg --allow-secret-key-import --import ${path.join(tempDirPath, PRIVATE_KEYS)}`);
        await step('Importing ownertrust', () => $`gpg --import-ownertrust ${path.join(tempDirPath, OWNERTRUST)}`);
        await step(`Removing temporary directory ${tempDirPath}`, () => fs.remove(tempDirPath));

        say('All your keys sucessfuly restored from backup');
    },
});
