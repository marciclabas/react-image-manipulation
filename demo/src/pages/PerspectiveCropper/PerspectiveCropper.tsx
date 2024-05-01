import { useCropper } from 'use-cropper'
import { useCropperAnimation } from 'use-cropper/animation'
import { prepareWorker } from 'opencv-tools/workers/correct'
import { useEffect, useRef, useState } from "react"
import { managedPromise } from "@haskellian/async/promises/single"
import { Button, Center, HStack, VStack } from '@chakra-ui/react'

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
    <HStack h='100vh' w='100vw' align='center' justify='center'>
      <Center w='40%' pos='relative' h='80%'>
        {corrected && <img src={corrected} style={{maxHeight: '100%'}} />}
      </Center>
      <VStack w='30vw' pos='relative' h='80%'>
        <canvas ref={ref} />
        {animation}
      </VStack>
      <VStack w='20%'>
        <Button onClick={() => run(getCoords())}>Animate</Button>
        <Button onClick={correct}>Correct</Button>
      </VStack>
    </HStack>
  )
}

export default PerspectiveCropper
