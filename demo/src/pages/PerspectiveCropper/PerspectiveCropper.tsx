import { useCropper } from 'use-cropper'
import { useCropperAnimation } from 'use-cropper/animation'
import { prepareWorker } from 'opencv-tools/workers/correct'
import { useEffect, useRef, useState } from "react"
import { managedPromise } from "@haskellian/async/promises/single"

const worker = new Worker(new URL('correct-worker.ts', import.meta.url), { type: 'module' })
const api = prepareWorker(worker)

function PerspectiveCropper() {

  const src = `${import.meta.env.BASE_URL}sheet.jpg`

  const { ref, animate, getCoords } = useCropper(src, {
    pads: {l: 0.1, r: 0.1, t: 0.1, b: 0.05 }
  })
  const { animation, run } = useCropperAnimation(animate, {
    modalProps: {style: {background: '#0004'}}
  })

  const [corrected, setCorrected] = useState<null|string>(null)

  const posted = useRef(managedPromise<void>())

  useEffect(() => {
    api.postImg(src).then(() => posted.current.resolve())
  }, [])

  async function correct() {
    const blob = await api.correct(src, getCoords())
    if (blob)
      setCorrected(URL.createObjectURL(blob))
  }

  return (
    <div style={{height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'gray', overflow: 'hidden'}}>
      <div style={{ height: '80%', width: '40vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {corrected && <img src={corrected} style={{maxHeight: '100%'}} />}
      </div>
      <div style={{ height: '80%', width: '30vw', position: 'relative'}}>
        <canvas ref={ref} />
        {animation}
      </div>
      <button style={{margin: '1rem', padding: '1rem', fontSize: '1.5rem'}} onClick={() => run(getCoords())}>Animate</button>
      <button style={{margin: '1rem', padding: '1rem', fontSize: '1.5rem'}} onClick={correct}>Correct</button>
    </div>
  )
}

export default PerspectiveCropper
