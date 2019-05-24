const TL = 0.00001;

function EQ_0(num: number) {
    return num < TL && num > -TL;
}

function EQ(a: number, b: number) {
    return a - b < TL && a - b > -TL;
}

function LE(a: number, b: number) {
    return a - b <= TL;
}

function GE(a: number, b: number) {
    return a - b >= TL;
}

export const Comparator = {
    EQ_0,
    EQ,
    LE,
    GE
};
