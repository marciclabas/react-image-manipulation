import { useCallback, useRef, useState } from 'react'
import { Config as CropperConfig, Corners, useCropper, DEFAULT_CORNERS } from 'use-cropper'
import { CorrectionProps, Correction, View } from './ui.js'
import { useLoader, useNotifiedState } from 'framer-animations'
import { CorrectAPI } from 'opencv-tools/workers/correct'
import { isclose } from '@haskellian/isclose'
import { managedPromise } from '@haskellian/async/promises/single/managed.js'
import { delay } from '@haskellian/async/promises/single/time.js'
import { Either, Right, left, right } from '@haskellian/either'

export type CorrectOk = { corners: Corners } & ({
  modified: true
  img: Blob
} | {
  modified: false
})

export type Hook = {
	Correction(props: CorrectionProps): JSX.Element // trick!
	correctionProps: CorrectionProps
	view: View
  actions: {
    togglePreview(): Promise<void>
    correct(): Promise<Either<void, CorrectOk>>
    corners(): Corners
    reset(): Promise<void>
  }
}

export type Config = {
  cropperProps?: CropperConfig
  startCoords?: Corners
}

export function useCorrection(src: string, api: CorrectAPI | null, config?: Config): Hook {

  const [view, setView] = useState<View>('correct')

  const { ref, animate, getCoords } = useCropper(src, {
    pads: { l: 0.05, r: 0.05, t: 0.05, b: 0.1 },
    lazyCoords: true, topBias: 0.2, startCoords: config?.startCoords, canvasOptions: {
      selection: false, hoverCursor: 'pointer'
    },
    cornerOptions: { stroke: 'green', radius: 10, selectedRadius: 30, fill: 'transparent', strokeWidth: 2 },
    contourOptions: { stroke: 'green', strokeWidth: 2, fill: '#0402', objectCaching: false },
    ...config?.cropperProps
  })

  const [modal, setModal] = useNotifiedState(false)
  const { loader, animate: animateLoader } = useLoader()

  const [lastCorrected, setCorrected] = useState<{ url: string, blob: Blob, corners: Corners } | null>(null)
  const previewing = useRef<Corners | null>(null)

  const failAnimation = useCallback(async () => {
    await setModal(true)
    animateLoader('fail')
    await setModal(false)
  }, [setModal, animateLoader])

  const togglePreview = useCallback(async () => {
    if (view === 'preview')
      return setView('correct')

    if (!api)
      return failAnimation()
  
    const corners = getCoords()
    if (lastCorrected?.corners && isclose(lastCorrected.corners, corners))
      return setView('preview')
    // anti-spam
    if (previewing.current && isclose(previewing.current, corners)) {
      console.log('Oops')
      return
    }
    previewing.current = corners

    const blobPromise = api.correct(src, getCoords())
    await setModal(true)
    animateLoader('load')
    const blob = await blobPromise
    console.log('Blob', blob)
    if (!blob) {
      previewing.current = null
      animateLoader('fail')
      return await setModal(false)
    }
    animateLoader('succeed')
    setCorrected({ url: URL.createObjectURL(blob), blob, corners })
    setModal(false)
    setView('preview')
  }, [animateLoader, api, getCoords, lastCorrected?.corners, setModal, src, view, failAnimation])

  const reset = useCallback(async () => {
    if (!animate.loaded) return
    if (!isclose(getCoords(), DEFAULT_CORNERS))
      return await animate(DEFAULT_CORNERS, { duration: 200 })

    // little animation to show what this does
    const d = 0.04
    await animate({ tl: [d, d], tr: [1 - d, d], br: [1 - d, 1 - d], bl: [d, 1 - d] }, { duration: 200 })
    await animate(DEFAULT_CORNERS, { duration: 200 })
  }, [animate, getCoords])

  const result = useRef(managedPromise<Either<void, CorrectOk>>())
  const correcting = useRef<Corners|null>(null)

  const correct = useCallback(async (): Promise<Either<void, CorrectOk>> => {
    const newCoords = getCoords()

    // anti-spam
    if (correcting.current && isclose(correcting.current, newCoords))
      return result.current

    if (!api)
      return left(await failAnimation())
    
    correcting.current = newCoords

    if (config?.startCoords && isclose(config.startCoords, newCoords)) {
      setTimeout(() => correcting.current = null, 1e3)
      const res: Right<CorrectOk> = right({ corners: config.startCoords, modified: false })
      result.current.resolve(res)
      return res
    }
    else if (lastCorrected?.corners && isclose(lastCorrected?.corners, newCoords)) {
      setTimeout(() => correcting.current = null, 1e3)
      const res: Right<CorrectOk> = right({ modified: true, corners: lastCorrected.corners, img: lastCorrected.blob })
      result.current.resolve(res)
      return res
    }

    setModal(true)
    await delay(0.4)
    animateLoader('load')
    const cropped = await api.correct(src, getCoords())
    if (cropped) {
      animateLoader('succeed')
      await delay(0.4)
      setModal(false)
      correcting.current = null
      const res = right({ modified: true, img: cropped, corners: getCoords() })
      result.current.resolve(res)
      return res
    }
    else {
      animateLoader('fail')
      setModal(false)
      correcting.current = null
      const res = left<void>({} as any)
      result.current.resolve(res)
      return res
    }
  }, [animateLoader, api, config?.startCoords, getCoords, lastCorrected, setModal, src, failAnimation])

  const correctionProps: CorrectionProps = {
    view, preview: lastCorrected?.url, canvasRef: ref, animations: {
      showModal: modal, loader
    }
  }

  return { Correction, correctionProps, view, actions: { togglePreview, corners: getCoords, correct, reset } }
}