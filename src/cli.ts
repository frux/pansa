#!/usr/bin/env node

import Yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { createDotFiles } from './commands/dotfiles';
// import { helloCommand } from './commands/hello.js';
import { exportGPGKeys, importGPGKeys } from './commands/gpg';
import { objectForEach } from './utils/object-foreach';

const commands = [
	exportGPGKeys,
	importGPGKeys,
	createDotFiles,
];

// eslint-disable-next-line new-cap
const yargs = Yargs(hideBin(process.argv));

commands.forEach(command => {
	yargs.command(
		command.usage,
		command.description,
		yargs => {
			objectForEach(command.flags, (flagName, flag) => {
				if (flag) {
					if (flag.flagType === 'option') {
						yargs.option(flagName, flag);
					} else {
						yargs.positional(flagName, flag);
					}
				}
			});
		},
		args => command.main(args),
	);
});

// eslint-disable-next-line no-unused-expressions
yargs.argv;
