import { RefCallback, useCallback, useRef } from 'react'
import { fabric } from 'fabric'
import { useRefState } from 'synced-hooks'

export type FabricHook = {
	canvas: fabric.Canvas | null
	ref: RefCallback<HTMLCanvasElement>
	reset(): void
}

/** Hook for a `fabric.Canvas`
 * 
 * ```
 * const { ref, canvas, reset } = useFabric({ background: 'red', ... })
 * 
 * function doSomeWithCanvas() {
 *    if (!canvas)
 *      return
 *    canvas.add(...)
 *    canvas.renderAll(...)
 * }
 * 
 * return (
 *   <>
 *   	<button onClick={reset}>Reset</button>
 *   	<canvas ref={ref} />
 *   </>
 * )
 * ```
 */
export function useFabric(config?: fabric.ICanvasOptions): FabricHook {
	const nodeRef = useRef<HTMLCanvasElement|null>(null)
	const started = useRef(false)
	const [canvas, setCanvas, canvasRef] = useRefState<fabric.Canvas | null>(null)

	const init = useCallback((node: HTMLCanvasElement) => {
		nodeRef.current = node
		const parent = node.parentElement
		const newCanvas = new fabric.Canvas(node, {
			width: parent?.clientWidth, height: parent?.clientHeight,
			...config
		})
		setCanvas(newCanvas)
	}, [config, setCanvas])

	const ref = useCallback((node: HTMLCanvasElement | null) => {
		if (!node || started.current)
			return
		started.current = true
		init(node)
	}, [init])

	const reset = useCallback(() => {
		if (canvasRef.current) {
      try { canvasRef.current.dispose() } catch { null }
			setCanvas(null)
		}
		setTimeout(() => {
			if (nodeRef.current)
				init(nodeRef.current)
		}, 0);
	}, [setCanvas, init, canvasRef])

	return { canvas, reset, ref }
}
