import { inspect } from "util";

export class SourceLocation {

	static readonly NAME_UNKNOWN = "<unknown>";
	static readonly NAME_STDIN = "<stdin>";

	readonly #name: string;
	readonly #lineno: number;
	readonly #column: number;

	constructor(name: string, lineno: number, column: number);
	constructor(name: string);
	constructor(lineno: number, column: number);
	constructor();
	constructor(nameOrLineno?: string | number, linenoOrColumn?: number, column?: number) {
		if(typeof nameOrLineno === "string") {
			this.#name = nameOrLineno;
			this.#lineno = linenoOrColumn || 1;
			this.#column = column || 1;
			return;
		}

		this.#name = SourceLocation.NAME_UNKNOWN;
		this.#lineno = nameOrLineno || 1;
		this.#column = linenoOrColumn || 1;
	}

	get name(): string {
		return this.#name;
	}

	get lineno(): number {
		return this.#lineno;
	}

	get column(): number {
		return this.#column;
	}

	toString(): string {
		return `${this.#name}:${this.#lineno}:${this.#column}`;
	}

	[inspect.custom](): object {
		const name = this.#name;
		const lineno = this.#lineno;
		const column = this.#column;
		return new class SourceLocation {
			name = name;
			lineno = lineno;
			column = column;
		};
	}

	toJSON(): { name: string, lineno: number, column: number } {
		return {
			name: this.#name,
			lineno: this.#lineno,
			column: this.#column,
		};
	}
}
