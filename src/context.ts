import inquirer, { DistinctQuestion } from 'inquirer';
import * as zx from 'zx';

export type CommandContext = ReturnType<typeof getCommandContext>;

export function getCommandContext() {
	return {
		...zx,
		prompt,
		question,
		say,
		step,
	};
}

async function question(message: string, defaultValue?: string) {
	const answer = await zx.question([
		message,
		defaultValue === undefined ? '' : ` (${defaultValue})`,
		': ',
	].join(''));

	return answer || defaultValue || '';
}

async function step(message: string, fn: () => Promise<unknown>) {
	// eslint-disable-next-line no-console
	console.log(`\n${zx.chalk.yellow('● ')}${message}`);
	await fn();
}

function say(message: string) {
	// eslint-disable-next-line no-console
	console.log(message);
}

type PromptAnswerTypeMap<T extends DistinctQuestion['type']> = (
	T extends 'input' ? string :
	T extends 'number' ? number :
	T extends 'password' ? string :
	T extends 'list' ? string[] :
	T extends 'expand' ? string :
	T extends 'checkbox' ? string[] :
	T extends 'confirm' ? boolean :
	T extends 'editor' ? string :
	T extends 'rawlist' ? string[] :
	string
);

async function prompt<T extends Omit<DistinctQuestion, 'name'>>(question: T) {
	const { answer } = await inquirer.prompt({ ...question, name: 'answer' });

	return answer as PromptAnswerTypeMap<T['type']>;
}
