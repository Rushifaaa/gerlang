import { inspect } from "util";

class Token {
	constructor(
		readonly type: Token.Type,
		readonly value: string
	) { }

	public get 0(): Token.Type {
		return this.type;
	}
	public get 1(): string {
		return this.value;
	}

	toString(): string {
		return `[${Token.Type[this.type]}, ${inspect(this.value)}]`;
	}

	[inspect.custom](): object {
		const tokenType = Token.Type[this.type];
		const tokenValue = this.value;
		return new class Token {
			type = tokenType;
			value = tokenValue;
		};
	}

	toJSON(): [string, string] {
		return [Token.Type[this.type], this.value];
	}
}

namespace Token {
	export enum Type {
		// TODO different token types

		INVALID
	}

	export class Builder {
		type = Type.INVALID;
		value = "";

		setType(type: Type): Builder {
			this.type = type;
			return this;
		}
		setValue(value: string): Builder {
			this.value = value;
			return this;
		}

		build(): Token {
			return new Token(this.type, this.value);
		}
	}
}

export default Token;
