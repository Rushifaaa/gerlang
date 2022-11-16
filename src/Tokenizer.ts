import assert from "assert";
import { Readable } from "stream";
import { EOF } from "./EOF";
import { Token, TokenType } from "./Token";
import { TokenStream } from "./TokenStream";
import { escapeRegExp } from "./utils";

const operatorSigns =
	[
		// arithmetic
		"+", // addition
		"-", // subtraction & negative
		"*", // multiplication
		"/", // division
		"%", // modulo

		// bitwise
		"~",  // complement
		"<<", // left shift
		">>", // right shift
		"&",  // and
		"|",  // or
		"^",  // xor

		// relational
		"==", // equality
		"!=", // inequality
		"<",  // less than
		"<=", // less than or equal
		">",  // greater than
		">=", // greater than or equal

		// logical
		"!",  // not
		"&&", // and
		"||", // or

		// assignment
		"=",
		"+=",  // addition
		"-=",  // subtraction
		"*=",  // multiplication
		"/=",  // division
		"%=",  // modulo
		"<<=", // left shift
		">>=", // right shift
		"&=",  // and
		"|=",  // or
		"^=",  // xor
	]
		.sort((a: string, b: string) => {
			return b.length - a.length;
		});

assert(
	new Set(operatorSigns).size === operatorSigns.length,
	"operatorSigns array contains duplicate items"
);

const operatorSignsRegExp =
	new RegExp(
		operatorSigns.reduce(
			(finalPattern: string, operatorSign: string) => {
				const operatorSignPattern: string = escapeRegExp(operatorSign);
				if(finalPattern.isEmpty()) {
					return "(" + operatorSignPattern + ")";
				}

				return finalPattern + "|(" + operatorSignPattern + ")";
			},
			""
		)
	);

function tryLexToken(str: string, end: false): Token | null;
function tryLexToken(str: string, end: true): Token;
function tryLexToken(str: string, end: boolean): Token | null;
function tryLexToken(str: string, end: boolean): Token | null {
	let invalidEndIndex = str.length;

	{ // whitespace
		const wsMatch: RegExpMatchArray | null = str.match(/\s+/);

		if(typeof wsMatch?.index === "number") {
			if(wsMatch.index === 0) {
				const wsStr: string = wsMatch[0];

				if(wsStr.length === str.length && !end) {
					// if the entire string is matched and we're not at the end of the stream, then there might be more
					// data coming that's part of the token
					return null;
				}

				return new Token(TokenType.WHITESPACE, wsStr);
			}

			invalidEndIndex = Math.min(wsMatch.index, invalidEndIndex);
		}
	}

	{ // word
		const wordMatch: RegExpMatchArray | null = str.match(/[A-Za-zÄäÖöÜüẞß][A-Za-z0-9ÄäÖöÜüẞß]*/);

		if(typeof wordMatch?.index === "number") {
			if(wordMatch.index === 0) {
				const wordStr: string = wordMatch[0];

				if(wordStr.length === str.length && !end) {
					return null;
				}

				return new Token(TokenType.WORD, wordStr);
			}

			invalidEndIndex = Math.min(wordMatch.index, invalidEndIndex);
		}
	}

	{ // literal number
		const literalNumberMatch: RegExpMatchArray | null = str.match(/[0-9]+(_[0-9]+)*\.[0-9]+(_[0-9]+)*[kl]?n?/);

		if(typeof literalNumberMatch?.index === "number") {
			if(literalNumberMatch.index === 0) {
				const literalNumberStr: string = literalNumberMatch[0];

				if(literalNumberStr.length === str.length && !end) {
					return null;
				}

				return new Token(TokenType.LITERAL_NUMBER, literalNumberStr);
			}

			invalidEndIndex = Math.min(literalNumberMatch.index, invalidEndIndex);
		}
	}

	{ // literal integer
		const literalIntegerMatch: RegExpMatchArray | null = str.match(/0b[01]+(_[01]+)*([bykgl]|[kl]?n)?|0o[0-7]+(_[0-7])*([bykgl]|[kl]?n)?|(0d)?[0-9]+(_[0-9])*([bykgl]|[kl]?n)?|0x[0-9A-Fa-f]+(_[0-9A-Fa-f])*([ykgl]|[kl]?n)?/);

		if(typeof literalIntegerMatch?.index === "number") {
			if(literalIntegerMatch.index === 0) {
				const literalIntegerStr: string = literalIntegerMatch[0];

				if(literalIntegerStr.length === str.length && !end) {
					return null;
				}

				return new Token(TokenType.LITERAL_NUMBER, literalIntegerStr);
			}

			invalidEndIndex = Math.min(literalIntegerMatch.index, invalidEndIndex);
		}
	}

	{ // operator
		const operatorMatch: RegExpMatchArray | null = str.match(operatorSignsRegExp);

		if(typeof operatorMatch?.index === "number") {
			if(operatorMatch.index === 0) {
				const operatorStr: string = operatorMatch[0];

				if(operatorStr.length === str.length && !end) {
					return null;
				}

				return new Token(TokenType.OPERATOR, operatorStr);
			}

			invalidEndIndex = Math.min(operatorMatch.index, invalidEndIndex);
		}
	}

	{ // separator
		const separatorMatch: RegExpMatchArray | null = str.match(/[(),.]/);

		if(typeof separatorMatch?.index === "number") {
			if(separatorMatch.index === 0) {
				const separatorStr: string = separatorMatch[0];

				if(separatorStr.length === str.length && !end) {
					return null;
				}

				return new Token(TokenType.SEPARATOR, separatorStr);
			}

			invalidEndIndex = Math.min(separatorMatch.index, invalidEndIndex);
		}
	}

	return new Token(TokenType.INVALID, str.substring(0, invalidEndIndex));
}

/**
 * aka "Lexer"
 */
export class Tokenizer extends TokenStream {

	readonly #inputStream: Readable;

	#backlogStr: string;
	#eof: boolean;


	constructor(inputStream: Readable) {
		super();

		this.#inputStream = inputStream;

		this.#backlogStr = "";
		this.#eof = false;
	}

	getNextToken(): Promise<Token | EOF> {
		if(this.#backlogStr.isNotEmpty()) {
			const token: Token | null = tryLexToken(this.#backlogStr, this.#eof);

			if(token instanceof Token) {
				// store any data not consumed back into the backlog
				this.#backlogStr = this.#backlogStr.substring(token.value.length);

				return Promise.resolve(token);
			}
		} else if(this.#eof) {
			return Promise.resolve(EOF);
		}

		return new Promise((resolve, reject) => {
			// eslint-disable-next-line prefer-const
			let finish: () => void;

			const errorListener = (err: Error) => {
				finish();
				reject(err);
			};

			const endListener = () => {
				this.#eof = true;

				finish();

				if(this.#backlogStr.isEmpty()) {
					resolve(EOF);
					return;
				}

				const token: Token = tryLexToken(this.#backlogStr, true);

				// store any data not consumed back into the backlog
				this.#backlogStr = this.#backlogStr.substring(token.value.length);

				resolve(token);
			};

			const dataListener = (chunk: string | Buffer) => {
				const chunkStr = chunk.toString();
				const str = this.#backlogStr + chunkStr;

				const token: Token | null = tryLexToken(str, false);

				if(!(token instanceof Token)) {
					// entire string could not be consumed, store it into the backlog
					this.#backlogStr = str;
					return;
				}

				finish();
				resolve(token);

				// store any data not consumed into the backlog
				this.#backlogStr = str.substring(token.value.length);
			};

			finish = () => {
				this.#inputStream.off("data", dataListener);
				this.#inputStream.off("end", endListener);
				this.#inputStream.off("error", errorListener);
			};

			this.#inputStream.once("error", errorListener);
			this.#inputStream.once("end", endListener);
			this.#inputStream.on("data", dataListener);
		});
	}
}
