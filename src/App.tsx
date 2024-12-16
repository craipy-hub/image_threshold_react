import { useState, useEffect, useRef } from 'react'
import { Upload, Slider, Row, Col } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import './App.css'

function App() {
  const [image, setImage] = useState<string | null>(null)
  const [thresholds, setThresholds] = useState({ r: [0, 255], g: [0, 255], b: [0, 255] })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (image && canvasRef.current && imgRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.src = image
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
        if (imageData) {
          const thresholdedData = applyThreshold(imageData)
          ctx?.putImageData(thresholdedData, 0, 0)
          imgRef.current!.src = canvas.toDataURL()
        }
      }
    }
  }, [image, thresholds])

  // 处理文件上传
  const handleUpload = (info: any) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setImage(e.target?.result as string)
    }
    reader.readAsDataURL(info.file)
  }

  // 处理滑块变化
  const handleSliderChange = (channel: 'r' | 'g' | 'b', type: 'min' | 'max', value: number) => {
    setThresholds({
      ...thresholds,
      [channel]: type === 'min' ? [value, thresholds[channel][1]] : [thresholds[channel][0], value]
    })
  }

  // 应用阈值处理图像数据
  const applyThreshold = (imageData: ImageData) => {
    const { data } = imageData
    for (let i = 0; i < data.length; i += 4) {
      const r = (data[i] >= thresholds.r[0] && data[i] <= thresholds.r[1]) || (thresholds.r[0] > thresholds.r[1] && (data[i] <= thresholds.r[1] || data[i] >= thresholds.r[0])) ? 255 : 0
      const g = (data[i + 1] >= thresholds.g[0] && data[i + 1] <= thresholds.g[1]) || (thresholds.g[0] > thresholds.g[1] && (data[i + 1] <= thresholds.g[1] || data[i + 1] >= thresholds.g[0])) ? 255 : 0
      const b = (data[i + 2] >= thresholds.b[0] && data[i + 2] <= thresholds.b[1]) || (thresholds.b[0] > thresholds.b[1] && (data[i + 2] <= thresholds.b[1] || data[i + 2] >= thresholds.b[0])) ? 255 : 0
      const avg = (r + g + b) / 3
      data[i] = data[i + 1] = data[i + 2] = avg
    }
    return imageData
  }

  return (
    <>
      <Upload beforeUpload={() => false} onChange={handleUpload}>
        <button>
          <UploadOutlined /> Click to Upload
        </button>
      </Upload>
      {image && (
        <>
          <Row gutter={24}>
            <Col span={8}>
              <img src={image} alt="Uploaded" style={{ maxWidth: '100%' }} />
            </Col>
            <Col span={4}>
              <Slider
                min={0}
                max={255}
                value={thresholds.r[0]}
                onChange={(value) => handleSliderChange('r', 'min', value)}
              />
              <p>Red Min Threshold: {thresholds.r[0]}</p>
              <Slider
                min={0}
                max={255}
                value={thresholds.g[0]}
                onChange={(value) => handleSliderChange('g', 'min', value)}
              />
              <p>Green Min Threshold: {thresholds.g[0]}</p>
              <Slider
                min={0}
                max={255}
                value={thresholds.b[0]}
                onChange={(value) => handleSliderChange('b', 'min', value)}
              />
              <p>Blue Min Threshold: {thresholds.b[0]}</p>
            </Col>

            <Col span={4}>
              <Slider
                min={0}
                max={255}
                value={thresholds.r[1]}
                onChange={(value) => handleSliderChange('r', 'max', value)}
              />
              <p>Red Max Threshold: {thresholds.r[1]}</p>
              <Slider
                min={0}
                max={255}
                value={thresholds.g[1]}
                onChange={(value) => handleSliderChange('g', 'max', value)}
              />
              <p>Green Max Threshold: {thresholds.g[1]}</p>
              <Slider
                min={0}
                max={255}
                value={thresholds.b[1]}
                onChange={(value) => handleSliderChange('b', 'max', value)}
              />
              <p>Blue Max Threshold: {thresholds.b[1]}</p>
            </Col>
            <Col span={8}>
              <canvas id="thresholdCanvas" ref={canvasRef} style={{ display: 'none' }} />
              <img id="thresholdImage" ref={imgRef} alt="Thresholded" style={{ maxWidth: '100%' }} />
            </Col>
          </Row>
        </>
      )}
    </>
  )
}

export default App
