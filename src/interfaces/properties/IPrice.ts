import { ECurrency } from "../ECurrency";


export interface IPrice {
    rent: {
        per_month: number,
        currency: ECurrency
    },
    sale: {
        price: number,
        currency: ECurrency
    },
    includes_VAT: boolean,
    details: string,
}
