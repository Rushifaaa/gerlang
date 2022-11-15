import { Readable } from "stream";
import { EOF } from "./EOF";
import { Token, TokenType } from "./Token";
import { TokenStream } from "./TokenStream";
import "./utils";

const wordPattern = /[A-Za-zÄäÖöÜüẞß][A-Za-z0-9ÄäÖöÜüẞß]*/;

function tryLexToken(str: string, end: false): Token | null;
function tryLexToken(str: string, end: true): Token;
function tryLexToken(str: string, end: boolean): Token | null;
function tryLexToken(str: string, end: boolean): Token | null {
	const wordMatch: RegExpMatchArray | null = str.match(wordPattern);

	if(!(wordMatch instanceof Array)) {
		return new Token(TokenType.INVALID, str);
	}

	if(wordMatch.index !== 0) {
		return new Token(TokenType.INVALID, str.substring(0, wordMatch.index));
	}

	if(wordMatch[0].length === str.length && !end) {
		// if the entire string is matched and we're not at the end of the stream, then there might be more data coming
		// that's part of the word
		return null;
	}

	return new Token(TokenType.WORD, wordMatch[0]);
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
