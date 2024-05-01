import { RefCallback, useCallback, useRef, useState } from 'react'
import { fabric } from 'fabric'

export type FabricHook = {
	canvas: fabric.Canvas | null
	ref: RefCallback<HTMLCanvasElement>
	reset(): void
}

/** Hook for a `fabric.Canvas`
 * 
 * ```
 * const { ref, canvas } = useFabric({ background: 'red', ... })
 * 
 * function doSomeWithCanvas() {
 *    if (!canvas)
 *      return
 *    canvas.add(...)
 *    canvas.renderAll(...)
 * }
 * 
 * return <canvas ref={ref} />
 * ```
 */
export function useFabric(config?: fabric.ICanvasOptions): FabricHook {
	const canvasRef = useRef<HTMLCanvasElement|null>(null)
	const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)

	const init = useCallback((node: HTMLCanvasElement | null) => {
		if (!node || canvas !== null)
			return
		canvasRef.current = node
		const parent = node.parentElement
		const newCanvas = new fabric.Canvas(node, {
			width: parent?.clientWidth, height: parent?.clientHeight,
			...config
		})
    newCanvas.add
		setCanvas(newCanvas)
	}, [config, canvas])
	
	const reset = useCallback(() => {
		if (canvas) {
			canvas.dispose()
			setCanvas(null)
		}
		setTimeout(() => init(canvasRef.current), 0);
	}, [canvas, init])

	return { canvas, reset, ref: init }
}
