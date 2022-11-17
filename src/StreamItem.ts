export interface EofItem {
	readonly eof: true;
}

export interface NextItem<T extends NonNullable<unknown>> {
	readonly eof: false;
	readonly value: T;
}

export type StreamItem<T extends NonNullable<unknown>> = NextItem<T> | EofItem;

export namespace StreamItem {

	class EofItemImpl implements EofItem {
		readonly eof = true;
	}

	class NextItemImpl<T extends NonNullable<unknown>> implements NextItem<T> {

		readonly eof = false;
		readonly value: T;

		constructor(value: T) {
			this.value = value;
		}
	}

	export function eof<T extends NonNullable<unknown> = never>(): StreamItem<T> {
		return new EofItemImpl();
	}

	export function next<T extends NonNullable<unknown>>(value: T): StreamItem<T> {
		return new NextItemImpl(value);
	}
}
