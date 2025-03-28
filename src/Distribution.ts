export interface Distribution {
    pdf(x: number): number
    cdf(x: number): number
}

export const gompertz =
(a: number, b: number): Distribution => ({
    pdf: x => a * Math.exp(x*b-a/b*(Math.expm1(x*b))),
    cdf: x => Math.exp(-a/b*(Math.expm1(x*b))),
})
