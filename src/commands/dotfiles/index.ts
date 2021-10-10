import fs from 'fs';
import path from 'path';

import { createCommand } from '../../command';

const TEMPLATES_PATH = path.join(__dirname, './templates');
const availableDotfiles = fs.readdirSync(TEMPLATES_PATH);

export const createDotFiles = createCommand({
	usage: 'dotfiles [dotfiles]',
	description: 'Create dotfiles',
	flags: {
		dotfiles: {
			flagType: 'positional',
			description: `One of the following dotfiles: ${availableDotfiles.join(', ')}`,
			type: 'string',
		},
	},
	async main({ fs, prompt, step, say }, flags) {
		const dotfiles = flags.dotfiles ?
			flags.dotfiles.split(/,\s?/) :
			await prompt({
				message: 'Which dotfiles I should create',
				type: 'checkbox',
				choices: availableDotfiles,
			});

		dotfiles.forEach(dotfile => {
			if (!availableDotfiles.includes(dotfile)) {
				throw new Error(`Unknown dotfile ${dotfile}`);
			}
		});

		step('Copying dotfiles', () => Promise.allSettled(
			dotfiles.map(dotfile => fs.copyFile(
				path.join(TEMPLATES_PATH, dotfile),
				path.join(process.cwd(), dotfile),
			)),
		));

		await Promise.allSettled(dotfiles.map(dotfile => fs.copyFile(
			path.join(TEMPLATES_PATH, dotfile),
			path.join(process.cwd(), dotfile),
		)));

		say('Dotfiles successfully created');
	},
});
