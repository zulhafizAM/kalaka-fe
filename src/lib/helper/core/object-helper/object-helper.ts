// ===============================================================
// Object Helper Functions
// ===============================================================

export class ObjectHelper {
    static clone(obj: unknown) {
        const clone = JSON.stringify(obj);
        return JSON.parse(clone);
    }
}
