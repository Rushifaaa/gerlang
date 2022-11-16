import { inspect } from "util";
import { SourceLocation, SourceLocationJson } from "./SourceLocation";

export enum TokenType {
	// TODO different token types

	SHEBANG,

	COMMENT_LINE,
	COMMENT_BLOCK,

	WHITESPACE,

	LITERAL_BOOLEAN,
	LITERAL_NUMBER,
	LITERAL_INTEGER,

	WORD,
	OPERATOR,
	SEPARATOR,

	INVALID,
}

export class Token {

	readonly #type: TokenType;
	readonly #value: string;
	readonly #sourceLocation: SourceLocation;

	constructor(
		type: TokenType,
		value: string,
		sourceLocation: SourceLocation,
	) {
		this.#type = type;
		this.#value = value;
		this.#sourceLocation = sourceLocation;
	}

	get type(): TokenType {
		return this.#type;
	}
	get value(): string {
		return this.#value;
	}
	get sourceLocation(): SourceLocation {
		return this.#sourceLocation;
	}

	toString(): string {
		return `${this.#sourceLocation}: [${TokenType[this.#type]}, ${inspect(this.#value)}]`;
	}

	[inspect.custom](): object {
		const tokenType: string = TokenType[this.#type];
		const tokenValue = this.#value;
		const sourceLocation = this.#sourceLocation;
		return new class Token {
			type = tokenType;
			value = tokenValue;
			sourceLocation = sourceLocation;
		};
	}

	toJSON(): { type: string, value: string, sourceLocation: SourceLocationJson } {
		return {
			type: TokenType[this.#type],
			value: this.#value,
			sourceLocation: this.#sourceLocation.toJSON(),
		};
	}
}
