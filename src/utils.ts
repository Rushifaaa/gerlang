declare global {
	interface String {
		isEmpty(): boolean;
		isNotEmpty(): boolean;
		count(substring: string): number;
	}
}

String.prototype.isEmpty = function(this: string): boolean {
	return this.length === 0;
};

String.prototype.isNotEmpty = function(this: string): boolean {
	return this.length > 0;
};

String.prototype.count = function(this: string, substring: string): number {
	let count = 0;

	let index = 0;
	do {
		index = this.indexOf(substring, index);
		if(index >= 0) {
			index += substring.length;
			++count;
		}
	} while(index >= 0);

	return count;
};


export function escapeRegExp(str: string): string {
	return str.replace(/[$()*+.?[\\\]^{|}]/g, "\\$&");
}
