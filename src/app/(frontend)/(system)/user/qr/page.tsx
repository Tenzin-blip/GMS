'use client'
import React, { useEffect, useRef, useState } from 'react'

export default function QRScanner() {
  const [result, setResult] = useState('')
  const [status, setStatus] = useState('Initializing camera...')
  const [copied, setCopied] = useState(false)
  const readerRef = useRef(null)
  const html5QrCodeRef = useRef(null)

  useEffect(() => {
    const loadScanner = async () => {
      // Dynamically load the html5-qrcode library
      if (!window.Html5Qrcode) {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js'
        script.async = true
        document.body.appendChild(script)
        await new Promise((resolve) => {
          script.onload = resolve
        })
      }

      const Html5Qrcode = window.Html5Qrcode
      let lastResult = ''

      const onScanSuccess = async (decodedText) => {
        if (decodedText !== lastResult) {
          lastResult = decodedText
          setResult(decodedText)
          setStatus('QR Code detected! Marking attendance...')

          if (navigator.vibrate) {
            navigator.vibrate(200)
          }

          // Auto mark attendance
          try {
            const today = new Date().toISOString().split('T')[0]
            const url = `${decodedText}${today}`

            const response = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            })

            const data = await response.json()

            if (data.success) {
              setStatus('Attendance marked successfully!')
              setCopied(true)
            } else {
              setStatus('' + data.message)
            }
          } catch (err) {
            setStatus('Failed to mark attendance')
          }
        }
      }

      const onScanFailure = () => {
        // Scanning, no need to log
      }

      try {
        const html5QrCode = new Html5Qrcode('reader')
        html5QrCodeRef.current = html5QrCode

        const cameras = await Html5Qrcode.getCameras()

        if (cameras && cameras.length) {
          const backCamera = cameras.find(
            (cam) =>
              cam.label.toLowerCase().includes('back') || cam.label.toLowerCase().includes('rear'),
          )

          const cameraId = backCamera ? backCamera.id : cameras[0].id

          await html5QrCode.start(
            cameraId,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            onScanSuccess,
            onScanFailure,
          )

          setStatus('Point camera at QR code')
        } else {
          setStatus('No camera found')
        }
      } catch (err) {
        setStatus('Camera error: ' + err.message)
      }
    }

    loadScanner()

    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {})
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-5">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">QR Code Scanner</h1>
        <div id="reader" ref={readerRef} className="rounded-xl overflow-hidden mb-5"></div>
        <div className="text-center text-gray-600 text-sm mb-4">{status}</div>
        {/* {result && (
          <div className="bg-gray-50 rounded-xl p-5 mt-5">
            <h3 className="text-purple-600 font-semibold mb-3">Scanned Content:</h3>
            <div className="bg-white p-4 rounded-lg font-mono text-sm text-gray-800 max-h-48 overflow-y-auto break-all">
              {result}
            </div>
          </div>
        )} */}
      </div>
    </div>
  )
}
