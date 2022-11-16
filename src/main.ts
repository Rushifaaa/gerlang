// TODO

import { Token } from "./Token";
import { Tokenizer } from "./Tokenizer";

const separator = "-".repeat(80);

const tokenizer = Tokenizer.newOfStdin();

async function readAndPrintTokens(printSeparator: boolean) {
	const tokens: Token[] = await tokenizer.getRemainingTokens();

	if(printSeparator) {
		console.error(separator);
	}

	console.log("tokens:", tokens);
}

if(!process.stdin.isTTY || !process.stderr.isTTY) {
	readAndPrintTokens(false);
} else {
	console.error("Enter expression:\n" + separator);
	readAndPrintTokens(true);
}
