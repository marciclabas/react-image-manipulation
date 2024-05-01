import React, { CSSProperties, Ref } from 'react';
import { Modal } from 'framer-animations';

export type View = 'correct' | 'loading' | 'preview'

export type CorrectionProps = {
  view: View
  canvasRef: Ref<HTMLCanvasElement>
  preview?: string
  styles?: {
    container?: CSSProperties
    canvas?: CSSProperties
    preview?: CSSProperties
    modal?: CSSProperties
  }
  animations: {
    showModal: boolean
    loader: JSX.Element
  }
  className?: string
}
export function Correction({ view, canvasRef, animations, preview, className, styles }: CorrectionProps) {
  return (
    <div className={className} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', ...styles?.container }}>
      <div style={{ display: view === 'preview' ? 'none' : undefined, height: '100%', width: '100%', ...styles?.canvas }}>
        <canvas height='100%' width='100%' ref={canvasRef} />
      </div>
      {preview && view === 'preview' && <img src={preview} style={{ height: '100%', maxWidth: '100%', ...styles?.preview}}  />}
      <Modal show={animations.showModal} style={styles?.modal}>
        {animations.loader}
      </Modal>
    </div>
  )
}

export default Correction