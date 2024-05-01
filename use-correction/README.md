# Use Correction

> High-level abstraction over use-cropper. With preview, animations and actually correcting images

## Usage

### With ChakraUI

Requires ChakraUI

```bash
yarn add @chakra-ui/react @emotion/react @emotion/styled framer-motion
```

```bash
npm add @chakra-ui/react @emotion/react @emotion/styled framer-motion
```

```jsx
import { useCorrection } from 'use-correction'
import Correction from 'use-correction/chakra'
import { prepareWorker } from "opencv-tools/workers/correct"

// see opencv-tools for details
const worker = new Worker(new URL('correct-worker.ts', import.meta.url), { type: 'module' })
const workerApi = prepareWorker(worker)

const { correctionProps, actions, view } = useCorrection('/path/to/my-image.jpg', workerApi)

async function correct() {
  const result = await actions.correct()
  // ...
}

return (
  <div>
    {/* ... */}
    <Correction {...correctionProps} />
    <button onClick={actions.preview}>Preview</button>
    <button onClick={actions.reset}>Reset corners</button>
    <button onClick={correct}>Correct image</button>
  </div>
)
```

### Without ChakraUI
  
```jsx
import { useCorrection } from 'use-correction'
import { prepareWorker } from "opencv-tools/workers/correct"

// see opencv-tools for details
const worker = new Worker(new URL('correct-worker.ts', import.meta.url), { type: 'module' })
const workerApi = prepareWorker(worker)

const { Correction, correctionProps, actions, view } = useCorrection('/path/to/my-image.jpg', workerApi)

return (
  <Correction {...correctionProps} />
)
```