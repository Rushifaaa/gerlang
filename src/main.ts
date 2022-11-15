// TODO

import { Tokenizer } from "./Tokenizer";

const tokenizer = new Tokenizer(process.stdin);

process.stderr.write(
	"enter expression: ",
	(error) => {
		if(error !== undefined) {
			throw error;
		}

		tokenizer.getRemainingTokens()
			.then(console.log.bind(console, "tokens:"));
	}
);
