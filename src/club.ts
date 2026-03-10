import { SpondBase, requireAuthentication, JSONDict } from './base';

export class SpondClub extends SpondBase {
    private static readonly API_BASE_URL = "https://api.spond.com/club/v1/";
    public transactions: JSONDict[] | null = null;

    constructor(username: string, password: string) {
        super(username, password, SpondClub.API_BASE_URL);
    }

    /**
     * Retrieves a list of transactions/payments for a specified club.
     *
     * @param clubId Identifier for the club. Note that this is different from the Group ID used in the core API.
     * @param skip This endpoint only returns 25 transactions at a time (page scrolling).
     * @param maxItems The maximum number of transactions to retrieve. Defaults to 100.
     * @returns A list of transactions, each represented as a dictionary.
     */
    @requireAuthentication
    async getTransactions(clubId: string, skip: number | null = null, maxItems: number = 100): Promise<JSONDict[]> {
        if (this.transactions === null) {
            this.transactions = [];
        }

        const url = `${this.apiUrl}transactions`;
        const params: any = skip === null ? {} : { skip };
        const headers = { ...this.authHeaders, "X-Spond-Clubid": clubId };

        try {
            const response = await this.client.get(url, { headers, params });
            
            if (response.status === 200) {
                const t: JSONDict[] = response.data;
                if (t.length === 0) {
                    return this.transactions;
                }

                this.transactions.push(...t);

                if (this.transactions.length < maxItems) {
                    const nextSkip = (skip === null ? 0 : skip) + t.length;
                    return await this.getTransactions(clubId, nextSkip, maxItems);
                }
            }
        } catch (error) {
            // Handle error or rethrow
            console.error(error);
        }

        return this.transactions;
    }
}
