import { StreamItem } from "./StreamItem";
import { Token } from "./Token";

export abstract class TokenStream {

	abstract getNextToken(): Promise<StreamItem<Token>>;

	async getRemainingTokens(): Promise<Token[]> {
		const tokens: Token[] = [];

		// eslint-disable-next-line no-constant-condition
		while(true) {
			const tokenItem: StreamItem<Token> = await this.getNextToken();

			if(tokenItem.eof) {
				break;
			}

			tokens.push(tokenItem.value);
		}

		return tokens;
	}
}
