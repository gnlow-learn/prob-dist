import "https://esm.sh/adorable-css@1.6.2"
import { html, render, ref } from "./src/deps.ts"

import * as Plot from "https://esm.sh/@observablehq/plot@0.6.17"

import { gompertz } from "./src/Distribution.ts"

const probDieAt =
(a: number, b: number) =>
(age: number) =>
    gompertz(a, b).pdf(age) / gompertz(a, b).cdf(age)

const popAliveUntil =
(a: number, b: number) =>
(age: number) =>
    gompertz(a, b).cdf(age)

const popDieAt =
(a: number, b: number) =>
(age: number) =>
    gompertz(a, b).pdf(age)

const arr =
(length: number) =>
    Array.from({ length }).map((_, i) => i)

const useDrag =
(f: (dx: number, dy: number) => void) =>
(_el: HTMLElement | SVGElement) => {
    const el = _el as HTMLElement

    let isDragging = false
    let startX = 0
    let startY = 0

    const onDown = (e: PointerEvent) => {
        isDragging = true
        startX = e.clientX
        startY = e.clientY
        el.setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
        if (isDragging) {
            const dx = e.clientX - startX
            const dy = e.clientY - startY
            f(dx, dy)
            startX = e.clientX
            startY = e.clientY
        }
    }
    const onUp = () => {
        isDragging = false
    }

    el.addEventListener("pointerdown", onDown)
    el.addEventListener("pointermove", onMove)
    el.addEventListener("pointerup", onUp)
}

const refOnce =
(f: (el: Element) => void) => {
    return ref(el => {
        if (el) {
            // deno-lint-ignore no-explicit-any
            if ((el as any).i) return
            // deno-lint-ignore no-explicit-any
            (el as any).i = true
            f(el)
        }
    })
}

const Graph = (
    a: number,
    b: number,
    onUpdate = (a: number, b: number) => {},
) => html`
<graph
    class="
        flex(1/1/400px)
        w(400~1000)
        b(2) r(10) p(5)
    "
    ${refOnce(el => {
        useDrag((dx, dy) => {
            a -= dx * 0.000002
            b -= dy * 0.0001
            onUpdate(a, b)
        })(el as HTMLElement)
    })}
    ${ref(el => {
        console.log(el?.clientHeight)
    })}
>${(() => {
    const plot = Plot.plot({
        marks: [
            Plot.lineY(arr(100).map(probDieAt(a, b)), {
                stroke: "oklch(.9 .1 0)",
                strokeWidth: 2,
            }),
            Plot.lineY(arr(100).map(popAliveUntil(a, b)), {
                stroke: "oklch(.9 .1 90)",
                strokeWidth: 2,
            }),
            Plot.lineY(arr(100).map(i => 20*popDieAt(a, b)(i)), {
                stroke: "oklch(.9 .1 180)",
                strokeWidth: 2,
            }),
        ],
        y: { domain: [0, 1] },
        width: 500,
        height: 250,
    }) as SVGSVGElement
    plot.style.width = "100%"
    plot.style.height = "100%"

    return plot
})()}<h2 class="font(32)">title</h2></graph>
`

const refresh = (a = 0.00015, b = 0.1) => render(html`
<app class="
    hbox(center) wrap
    gap(20)
    p(20)
    line-height(0.9)
">
    <h1 class="w(100%) 700 font(64)">prob-dist</h1>
    ${Graph(a, b, refresh)}
    ${Graph(a, b, refresh)}
</app>
`, document.body)

refresh()
