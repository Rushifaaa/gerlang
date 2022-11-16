// TODO

import { promisify } from "util";
import { Token, TokenType } from "./Token";
import { Tokenizer } from "./Tokenizer";

const separator = "-".repeat(80);

const tokenizer = Tokenizer.newOfStdin();

function terminalEmulatorSupportsColor(term: string): boolean {
	return /^xterm-(xcolor|kitty)|.+-256color$/.test(term);
}

const stdoutIsColorAllowedTerminalEmulator = process.stdout.isTTY &&
	terminalEmulatorSupportsColor(process.env["TERM"] ?? "") &&
	(process.env["NO_COLOR"]?.length ?? 0) === 0;

async function readAndPrintTokens(printSeparator: boolean) {
	const tokens: Token[] = await tokenizer.getRemainingTokens();

	if(printSeparator) {
		console.error(separator);
	}

	if(!stdoutIsColorAllowedTerminalEmulator) {
		console.log(tokens);
		return;
	}

	const colorCodes: Partial<Record<TokenType, string>> = {
		[TokenType.SHEBANG]: "34",

		[TokenType.COMMENT_LINE]: "32",
		[TokenType.COMMENT_BLOCK]: "32",

		[TokenType.LITERAL_BOOLEAN]: "35",
		[TokenType.LITERAL_NUMBER]: "33",
		[TokenType.LITERAL_INTEGER]: "33",

		[TokenType.WORD]: "36",

		[TokenType.INVALID]: "31",
	};
	const write = promisify(process.stdout.write.bind(process.stdout));
	for(const token of tokens) {
		const colorCode = colorCodes[token.type];
		if(typeof colorCode === "string") {
			await write(`\x1B[${colorCode}m`);
		}
		await write(token.value);
		await write("\x1B[0m");
	}
	await write("\n");
}

if(!process.stdin.isTTY || !process.stderr.isTTY) {
	readAndPrintTokens(false);
} else {
	console.error("Enter expression:\n" + separator);
	readAndPrintTokens(true);
}
