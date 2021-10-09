#!/usr/bin/env node

import Yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
// import { helloCommand } from './commands/hello.js';
import { exportGPG, importGPG } from './commands/gpg';
import { objectForEach } from './utils/object-foreach';

const commands = [
    exportGPG,
    importGPG,
];

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

yargs.argv;
