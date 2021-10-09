import * as zx from 'zx';

export type CommandContext = ReturnType<typeof getCommandContext>;

export function getCommandContext() {
    return {
        ...zx,
        question,
        say,
        step,
    };
}

async function question(message: string, defaultValue?: string) {
    const answer = await zx.question([
        message,
        defaultValue !== undefined ? ` (${defaultValue})` : '',
        ': '
    ].join(''));

    return answer || defaultValue || '';
}

async function step(message: string, fn: () => Promise<unknown>) {
    console.log(`\n${zx.chalk.yellow('● ')}${message}`);
    await fn();
}

function say(message: string) {
    console.log(message);
}
