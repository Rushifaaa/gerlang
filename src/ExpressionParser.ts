import { Readable } from "stream";
import { Tokenizer } from "./Tokenizer";

export class ExpressionParser {

	readonly #tokenizer: Tokenizer;

	constructor(tokenizer: Tokenizer);
	constructor(sourceInputStream: Readable, sourceName: string);
	constructor(tokenizerOrSourceInputStream: Tokenizer | Readable, sourceName?: string) {
		if(tokenizerOrSourceInputStream instanceof Tokenizer) {
			this.#tokenizer = tokenizerOrSourceInputStream;
			return;
		}

		this.#tokenizer = new Tokenizer(tokenizerOrSourceInputStream, sourceName as string);
	}

	static newOfStdin(): ExpressionParser {
		const stdinTokenizer: Tokenizer = Tokenizer.newOfStdin();
		return new ExpressionParser(stdinTokenizer);
	}
}
