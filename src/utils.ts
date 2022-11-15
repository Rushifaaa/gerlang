// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface String {
	isEmpty(): boolean;
	isNotEmpty(): boolean;
}

String.prototype.isEmpty = function(this: string): boolean {
	return this.length === 0;
};

String.prototype.isNotEmpty = function(this: string): boolean {
	return this.length > 0;
};
