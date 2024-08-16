import { Rectangle, useGridSelector } from 'use-grid-selector'
import { grid, reify, ReifiedModel } from 'scoresheet-models'
import { ButtonGroup, Button, HStack, Image, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { prepareWorker } from 'use-grid-selector/worker'
import { managedPromise } from '@haskellian/async/promises/single'
import { Vec2 } from '@haskellian/vec2'

function* range(from: number, to: number, delta = 1) {
  for (let i = from; i < to; i += delta)
    yield i
}

const printVec = ([x, y]: Vec2, precision = 2) => `(${x.toFixed(precision)}, ${y.toFixed(precision)})`

const worker = new Worker(new URL('extract-worker.ts', import.meta.url), { type: 'module' })
const api = prepareWorker(worker, console.debug.bind(console))

const startCoords: Rectangle = {
  tl: [0.04, 0.195],
  size: [0.95, 0.67]
}

const model: ReifiedModel = reify({
  boxWidth: 0.15,
  rows: 20,
  columns: [null, 0.05, null, 0.05, null]
})

const src = `${import.meta.env.BASE_URL}fia-corrected-512.png`

function GridSelector() {
  const g = useMemo(() => grid(model), [])
  const { ref, coords } = useGridSelector(src, g, {
    startCoords,
    canvas: { selection: false, hoverCursor: 'pointer' },
    pads: { l: 0.1, r: 0.1, t: 0.1, b: 0.1 },
    cornerOptions: { stroke: 'green' },
    grid: { line: { stroke: 'green' } },
    templateOptions: { backgroundColor: '#0402' },
  })
  const [{ tl, size }, setCoords] = useState<Rectangle>(startCoords)
  const [imgs, setImgs] = useState<string[]>([])
  const ready = useRef(managedPromise<void>())

  useEffect(() => console.log('Images: ', imgs), [imgs])

  async function prepare() {
    await api.postImg(src)
    ready.current.resolve()
  }

  useEffect(() => { prepare() }, [])

  async function extract() {
    console.log('Extracting...')
    setImgs([])
    const config = { coords: coords(), model }
    let results: string[] = []
    await ready.current
    console.time('Extract')
    for (const i of range(0, 120, 6)) {
      await Promise.all([...range(i, i+6)].map(async (i) => {
        const blob = await api.extract(src, i, config).catch(() => null)
        if (blob) {
          const url = URL.createObjectURL(blob)
          results.push(url)
        }
      }))
      const mod = 12
      if (i % mod === mod-1) {
        const newResults = [...results]
        setImgs(ims => {
          return [...ims, ...newResults]
        })
        results = []
      }
    }
    console.timeEnd('Extract')
    setImgs(ims => [...ims, ...results])
  }

  return (
    <VStack h='100vh' w='100vw' align='center' justify='center'>
      <Text>Top Left: {printVec(tl)}. Size: {printVec(size)}</Text>
      <HStack h='80%' w='100%'>
        <VStack h='100%' w='50%' align='center' justify='center'>
          <canvas ref={ref} />
          <ButtonGroup>
            <Button onClick={() => setCoords(coords())}>Update coords</Button>
            <Button onClick={extract}>Extract</Button>
          </ButtonGroup>
        </VStack>
        <SimpleGrid h='100%' w='50%' columns={2} spacing='2rem' overflow='auto'>
          {imgs.map((src, i) => (
            <HStack key={i}>
              <Text>{i}</Text>
              <Image src={src} />
            </HStack>
          ))}
        </SimpleGrid>
      </HStack>
    </VStack>
  )
}

export default GridSelector
