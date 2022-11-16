declare global {
	interface String {
		isEmpty(): boolean;
		isNotEmpty(): boolean;
	}
}

String.prototype.isEmpty = function(this: string): boolean {
	return this.length === 0;
};

String.prototype.isNotEmpty = function(this: string): boolean {
	return this.length > 0;
};


export function escapeRegExp(str: string): string {
	return str.replace(/[$()*+.?[\\\]^{|}]/g, "\\$&");
}
