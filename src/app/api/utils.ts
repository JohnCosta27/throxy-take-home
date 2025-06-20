export const DEFAULT_CHUNK_SIZE = 10;

export const chunkRows = <T>(chunkSize: number, data: T[]): T[][] => {
    const chunks: T[][] = [];

    for (let i = 0; i < (data.length / chunkSize); i++) {
        chunks.push(data.slice(i * chunkSize, (i + 1) * chunkSize));
    }

    return chunks;
}

export const zip = <T, K>(arr1: T[], arr2: K[]) => {
    if (arr1.length !== arr2.length) {
        throw new Error("Both arrays should have the same length");
    }

    return arr1.map((x, i) => [x, arr2[i]] as const);
}

export const maybeTrim = (s: string | undefined | null) => s?.trim() ?? null

export const timeout = (delay: number) => new Promise(r => setTimeout(r, delay));
