import { Arguments, InferredOptionTypes, Options, PositionalOptions } from 'yargs';
import { CommandContext, getCommandContext } from './context';

type OptionDeclaration = Options & {
    flagType: 'option',
};

type PositionalDeclaration = PositionalOptions & {
    flagType: 'positional',
};

type FlagDeclaration = OptionDeclaration | PositionalDeclaration;

type FlagsDeclaration = Record<string, FlagDeclaration>;

interface CommandConfig<TFlags extends FlagsDeclaration> {
    usage: string;
    description: string;
    flags: TFlags;
    main: (ctx: CommandContext, flags: Arguments<InferredOptionTypes<TFlags>>) => void | Promise<void>;
}

export interface Command extends Omit<CommandConfig<FlagsDeclaration>, 'main'> {
    main: (flags: Arguments<InferredOptionTypes<FlagsDeclaration>>) => void | Promise<void>;
}

export function createCommand<TFlags extends FlagsDeclaration>(command: CommandConfig<TFlags>): Command {
    return {
        ...command,
        main: (flags: Arguments<InferredOptionTypes<any>>) => command.main(getCommandContext(), flags),
    };
}