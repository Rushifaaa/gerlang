import { inspect } from "util";

export enum TokenType {
	// TODO different token types

	INVALID,
}

export class Token {

	readonly #type: TokenType;
	readonly #value: string;

	constructor(
		type: TokenType,
		value: string
	) {
		this.#type = type;
		this.#value = value;
	}

	get type(): TokenType {
		return this.#type;
	}
	get value(): string {
		return this.#value;
	}

	toString(): string {
		return `[${TokenType[this.#type]}, ${inspect(this.#value)}]`;
	}

	[inspect.custom](): object {
		const tokenType: string = TokenType[this.#type];
		const tokenValue = this.#value;
		return new class Token {
			type = tokenType;
			value = tokenValue;
		};
	}

	toJSON(): [string, string] {
		return [TokenType[this.#type], this.#value];
	}
}
