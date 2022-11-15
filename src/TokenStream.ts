import { EOF } from "./EOF";
import { Token } from "./Token";

export abstract class TokenStream {

	abstract getNextToken(): Promise<Token | EOF>;

	async getRemainingTokens(): Promise<Token[]> {
		const tokens: Token[] = [];

		// eslint-disable-next-line no-constant-condition
		while(true) {
			const token: Token | EOF = await this.getNextToken();

			if(token === EOF) {
				break;
			}

			tokens.push(token);
		}

		return tokens;
	}
}
