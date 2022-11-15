import { Readable } from "stream";
import { EOF } from "./EOF";
import { Token, TokenType } from "./Token";
import { TokenStream } from "./TokenStream";
import "./utils";

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
