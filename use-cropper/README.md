# Use Cropper

> Simple, mobile-friendly, animatable, customizable perspective cropper

Mobile-friendly dragging            |  Programmatic animating
:-------------------------:|:-------------------------:
![Cropper in action](media/cropper.gif)  |  ![Cropper animation](media/cropper-animation.gif)

- [Live Demo](https://marciclabas.github.io/react-image-manipulation/)

## Usage

### UI

```jsx
import { useCropper } from 'use-cropper'

const { ref, coords } = useCropper('/path/to/image.png')
// or, for slightly better performance:
const { ref, getCoords } = useCropper('/path/to/image.png', {lazyCoords: true})

return (
  <div>
    <canvas style={{height: '100%', width: '100%' }} ref={ref} />
  </div>
)
```

### Correcting

- `worker.ts`:

  ```jsx
  import cv from "opencv-ts"; // or importScripts to a custom opencv.js, or whatever
  import { onMessage } from 'opencv-tools/workers/correct'
  onmessage = onMessage(cv)
  ```

- `MyCropper.tsx`

  ```jsx
    import { prepareWorker } from 'opencv-tools/workers/correct'

    const worker = new Worker('/path/to/worker.ts')
    const api = prepareWorker(worker)

    const img = '/image.jpg'

    function MyCropper() {

      const { ref, getCoords } = useCropper(img, {lazyCoords: true})

        function initialize() {
          api.postImg(img) // not necessary, but makes subsequent calls faster
        }

        async function correct() {
          const blob = await api.correct(img, getCoords())
          ...
        }
      }
    ```

### Animating
```jsx
import { fabric } from 'fabric' // optionally, for predefined easing functions

const { ref, animate } = useCropper('/path/to/image.png')

async function runAnimation() {
  if (!animate.loaded)
    return
  await animate({ tl: [0.1, 0.1], tr: [0.9, 0.1] }, { easing: fabric.util.ease.easeOutExpo })
  await new Promise(r => setTimeout(r, 200))
  await animate({ tl: [0, 0], tr: [1, 0] })
}
```

### Hint/Animation

Optionally, you can install [`framer-animations`](https://www.npmjs.com/package/framer-animations) to add this animation (useful as a simple guide for users)

![User hint animation](media/cropper-hint.gif)

```bash
npm i framer-animations
```

```bash
yarn add framer-animations
```

```jsx
import { useCropper } from 'use-cropper'
import { useCropperAnimation } from 'use-cropper/animation'

const { ref, animate } = useCropper('/image.jpg')
const { animation, run } = useCropperAnimation(animate)

return (
  ...
  <div style={{position: 'relative'}}>
    <canvas style={{height: '100%', width: '100%' }} ref={ref} />
    {animation}
  </div>
  <button onClick={run}>Help</button>
  ...
)
```