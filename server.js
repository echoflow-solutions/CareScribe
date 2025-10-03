const { createServer } = require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')
const path = require('path')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0' // Listen on all interfaces
const port = process.env.PORT || 3000
const httpsPort = process.env.HTTPS_PORT || 3443

// Initialize Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Function to check if certificates exist
const certsExist = () => {
  const certPath = path.join(__dirname, 'certificates', 'localhost+1.pem')
  const keyPath = path.join(__dirname, 'certificates', 'localhost+1-key.pem')
  return fs.existsSync(certPath) && fs.existsSync(keyPath)
}

// Create HTTPS options if certificates exist
const getHttpsOptions = () => {
  if (!certsExist()) {
    console.log('\n⚠️  No HTTPS certificates found.')
    console.log('\n📋 To enable HTTPS for microphone access on local network:')
    console.log('1. Install mkcert: brew install mkcert (macOS) or check mkcert docs for other OS')
    console.log('2. Install local CA: mkcert -install')
    console.log('3. Create certificates directory: mkdir certificates')
    console.log('4. Generate certificates: cd certificates && mkcert localhost 192.168.20.78 ::1 127.0.0.1')
    console.log('5. The files should be named localhost+1.pem and localhost+1-key.pem\n')
    return null
  }

  return {
    key: fs.readFileSync(path.join(__dirname, 'certificates', 'localhost+1-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'certificates', 'localhost+1.pem'))
  }
}

app.prepare().then(() => {
  const httpsOptions = getHttpsOptions()
  
  if (httpsOptions) {
    // Create HTTPS server
    createServer(httpsOptions, async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true)
        await handle(req, res, parsedUrl)
      } catch (err) {
        console.error('Error occurred handling', req.url, err)
        res.statusCode = 500
        res.end('internal server error')
      }
    }).listen(httpsPort, (err) => {
      if (err) throw err
      console.log(`\n✅ HTTPS Server ready`)
      console.log(`🔒 https://localhost:${httpsPort}`)
      console.log(`🔒 https://127.0.0.1:${httpsPort}`)
      
      // Get local network IP
      const { networkInterfaces } = require('os')
      const nets = networkInterfaces()
      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          if (net.family === 'IPv4' && !net.internal) {
            console.log(`🔒 https://${net.address}:${httpsPort}`)
          }
        }
      }
      console.log('\n✨ Microphone access will work on all these URLs!\n')
    })
  } else {
    // Fallback to HTTP server with warning
    const { createServer } = require('http')
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true)
        await handle(req, res, parsedUrl)
      } catch (err) {
        console.error('Error occurred handling', req.url, err)
        res.statusCode = 500
        res.end('internal server error')
      }
    }).listen(port, (err) => {
      if (err) throw err
      console.log(`\n⚠️  HTTP Server ready (Microphone access limited to localhost)`)
      console.log(`🌐 http://localhost:${port}`)
      console.log(`🌐 http://127.0.0.1:${port}`)
      console.log('\n❌ Microphone access will NOT work on local network IPs over HTTP')
      console.log('💡 Follow the instructions above to enable HTTPS\n')
    })
  }
})