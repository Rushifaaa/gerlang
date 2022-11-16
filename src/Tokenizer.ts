import assert from "assert";
import { Readable } from "stream";
import { EOF } from "./EOF";
import { SourceLocation } from "./SourceLocation";
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

interface TokenPattern {
	type: TokenType;
	pattern: RegExp;
}

const tokenPatterns: readonly Readonly<TokenPattern>[] = [
	{ type: TokenType.COMMENT_LINE, pattern: /\/\/.*(\r?\n|$)/ },
	{ type: TokenType.COMMENT_BLOCK, pattern: /\/\*.*(\*\/|$)/ },

	{ type: TokenType.WHITESPACE, pattern: /\s+/ },

	{ type: TokenType.LITERAL_BOOLEAN, pattern: /(Wahr|Falsch)/ },
	{ type: TokenType.LITERAL_NUMBER, pattern: /[0-9]+(_[0-9]+)*\.[0-9]+(_[0-9]+)*[kl]?n?/ },
	{ type: TokenType.LITERAL_INTEGER, pattern: /0b[01]+(_[01]+)*([bykgl]|[kl]?n)?|0o[0-7]+(_[0-7])*([bykgl]|[kl]?n)?|(0d)?[0-9]+(_[0-9])*([bykgl]|[kl]?n)?|0x[0-9A-Fa-f]+(_[0-9A-Fa-f])*([ykgl]|[kl]?n)?/ },

	{ type: TokenType.WORD, pattern: /[A-Za-zÄäÖöÜüẞß][A-Za-z0-9ÄäÖöÜüẞß]*/ },
	{ type: TokenType.OPERATOR, pattern: operatorSignsRegExp },
	{ type: TokenType.SEPARATOR, pattern: /[(),.]/ },
];

function tryLexToken(str: string, currentSourceLocation: SourceLocation, end: false): Token | null;
function tryLexToken(str: string, currentSourceLocation: SourceLocation, end: true): Token;
function tryLexToken(str: string, currentSourceLocation: SourceLocation, end: boolean): Token | null;
function tryLexToken(str: string, currentSourceLocation: SourceLocation, end: boolean): Token | null {
	let invalidEndIndex = str.length;

	for(const tokenPattern of tokenPatterns) {
		const match: RegExpMatchArray | null = str.match(tokenPattern.pattern);

		if(typeof match?.index === "number") {
			if(match.index === 0) {
				const operatorStr: string = match[0];

				if(operatorStr.length === str.length && !end) {
					// if the entire string is matched and we're not at the end of the stream, then there might be more
					// data coming that's part of the token
					return null;
				}

				return new Token(tokenPattern.type, operatorStr, currentSourceLocation);
			}

			invalidEndIndex = Math.min(match.index, invalidEndIndex);
		}
	}

	return new Token(TokenType.INVALID, str.substring(0, invalidEndIndex), currentSourceLocation);
}

/**
 * aka "Lexer"
 */
export class Tokenizer extends TokenStream {

	readonly #inputStream: Readable;

	#currentSourceLocation: SourceLocation;

	#backlogStr: string;
	#eof: boolean;

	constructor(sourceInputStream: Readable, sourceName: string) {
		super();

		this.#inputStream = sourceInputStream;

		this.#currentSourceLocation = new SourceLocation(sourceName);

		this.#backlogStr = "";
		this.#eof = false;
	}

	static newOfStdin(): Tokenizer {
		return new Tokenizer(process.stdin, SourceLocation.NAME_STDIN);
	}

	getNextToken(): Promise<Token | EOF> {
		if(this.#backlogStr.isNotEmpty()) {
			const token: Token | null = tryLexToken(this.#backlogStr, this.#currentSourceLocation, this.#eof);

			if(token instanceof Token) {
				// store any data not consumed back into the backlog
				this.#backlogStr = this.#backlogStr.substring(token.value.length);

				this.#advanceCurrentSourceLocation(token.value);
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

				const token: Token = tryLexToken(this.#backlogStr, this.#currentSourceLocation, true);

				// store any data not consumed back into the backlog
				this.#backlogStr = this.#backlogStr.substring(token.value.length);

				this.#advanceCurrentSourceLocation(token.value);
				resolve(token);
			};

			const dataListener = (chunk: string | Buffer) => {
				const chunkStr = chunk.toString();
				const str = this.#backlogStr + chunkStr;

				const token: Token | null = tryLexToken(str, this.#currentSourceLocation, false);

				if(!(token instanceof Token)) {
					// entire string could not be consumed, store it into the backlog
					this.#backlogStr = str;
					return;
				}

				finish();
				this.#advanceCurrentSourceLocation(token.value);
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

	#advanceCurrentSourceLocation(str: string) {
		const lastNewlineIndex = str.lastIndexOf("\n");

		if(lastNewlineIndex >= 0) {
			const newlineCount = str.substring(0, lastNewlineIndex).count("\n") + 1;

			this.#currentSourceLocation =
				new SourceLocation(
					this.#currentSourceLocation.name,
					this.#currentSourceLocation.lineno + newlineCount,
					str.substring(lastNewlineIndex).length,
				);

			return;
		}

		this.#currentSourceLocation =
			new SourceLocation(
				this.#currentSourceLocation.name,
				this.#currentSourceLocation.lineno,
				this.#currentSourceLocation.column + str.length,
			);
	}
}
