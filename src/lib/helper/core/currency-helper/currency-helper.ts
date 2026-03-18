// ===============================================================
// Currency Helper Functions
// ===============================================================

export class CurrencyHelper {
    static formatCurrency(amount: number) {
        if (amount !== 0 || undefined) {
            const formatter = new Intl.NumberFormat('ms-MY', {
                style: 'currency',
                currency: 'MYR',
            });
            return formatter.format(Number(amount)).toString();
        } else {
            return '-';
        }
    }
}
