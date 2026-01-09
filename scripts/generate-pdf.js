#!/usr/bin/env node

// Force exit after 3 minutes no matter what (safety net for CI)
setTimeout(() => {
  console.error('⏰ Build timeout reached (3 minutes), forcing exit')
  process.exit(1)
}, 180000)

/**
 * PDF Generation Script for NATpaper
 * Uses Puppeteer to render the print-optimized page and generate a PDF
 * 
 * This script is designed to work in Netlify's CI environment:
 * - Uses 'serve' package instead of 'vite preview' for reliability
 * - Does NOT run build (assumes build already completed)
 * - Outputs PDF to dist/ folder for deployment
 * - Uses Netlify-compatible Puppeteer launch arguments
 * 
 * Usage: 
 *   npm run build && npm run generate-pdf   (production - serves from dist/)
 *   npm run generate-pdf:dev                (development - uses running dev server)
 */

import puppeteer from 'puppeteer'
import chromium from '@sparticuz/chromium'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

const isDev = process.argv.includes('--dev')
const PORT = isDev ? 5173 : 4173
const BASE_URL = `http://localhost:${PORT}`

// In production, output to dist/ so it gets deployed
// In dev mode, output to public/ for testing
const OUTPUT_PATH = isDev 
  ? join(projectRoot, 'public', 'natpaper.pdf')
  : join(projectRoot, 'dist', 'natpaper.pdf')

// Longer timeout for Netlify's slower environment
const SERVER_TIMEOUT_SECONDS = 60
const PAGE_LOAD_TIMEOUT = 120000
const PDF_READY_TIMEOUT = 60000

async function waitForServer(url, maxAttempts = SERVER_TIMEOUT_SECONDS) {
  console.log(`Waiting for server at ${url} (max ${maxAttempts} seconds)...`)
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        console.log(`Server responded after ${i + 1} seconds`)
        return true
      }
    } catch (err) {
      // Server not ready yet - this is expected
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
    if ((i + 1) % 10 === 0) {
      console.log(`Still waiting... ${i + 1}/${maxAttempts} seconds`)
    }
  }
  throw new Error(`Server at ${url} did not become available after ${maxAttempts} seconds`)
}

function startServer() {
  console.log('Starting static file server with serve package...')
  console.log(`Serving from: ${join(projectRoot, 'dist')}`)
  console.log(`Port: ${PORT}`)
  
  // Use serve package with SPA mode (-s flag) for client-side routing
  const serverProcess = spawn('npx', ['serve', 'dist', '-l', String(PORT), '-s'], {
    cwd: projectRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false
  })

  serverProcess.stdout.on('data', (data) => {
    const output = data.toString()
    console.log(`[serve] ${output.trim()}`)
  })

  serverProcess.stderr.on('data', (data) => {
    const output = data.toString()
    // serve outputs info to stderr, not all are errors
    if (output.includes('ERROR') || output.includes('error')) {
      console.error(`[serve error] ${output.trim()}`)
    } else {
      console.log(`[serve] ${output.trim()}`)
    }
  })

  serverProcess.on('error', (err) => {
    console.error('Failed to start server:', err)
  })

  return serverProcess
}

async function generatePDF() {
  let serverProcess = null
  let browser = null

  try {
    // Verify dist directory exists (build should have already run)
    if (!isDev) {
      const distDir = join(projectRoot, 'dist')
      if (!existsSync(distDir)) {
        throw new Error(`dist/ directory not found. Run 'npm run build' first.`)
      }
      console.log('dist/ directory found, proceeding with PDF generation...')
    }

    // Start server if not in dev mode
    if (!isDev) {
      serverProcess = startServer()
      // Give the server a moment to initialize
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    // Wait for server to be ready
    await waitForServer(BASE_URL)
    console.log('Server is ready')

    // Launch Puppeteer with Netlify-compatible arguments
    console.log('Launching browser...')
    
    // Detect if running in CI/serverless environment
    const isCI = process.env.CI || process.env.NETLIFY
    
    const launchOptions = {
      headless: 'new',
      args: isCI ? chromium.args : [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer'
      ]
    }

    // Use @sparticuz/chromium in CI environment, otherwise use local Puppeteer
    if (isCI) {
      launchOptions.executablePath = await chromium.executablePath()
      console.log(`Using @sparticuz/chromium at: ${launchOptions.executablePath}`)
    } else if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH
      console.log(`Using Chromium at: ${process.env.PUPPETEER_EXECUTABLE_PATH}`)
    } else {
      console.log('Using local Puppeteer Chromium')
    }

    browser = await puppeteer.launch(launchOptions)
    console.log('Browser launched successfully')

    const page = await browser.newPage()

    // Set viewport for consistent rendering
    await page.setViewport({
      width: 1200,
      height: 800,
      deviceScaleFactor: 2
    })

    // Navigate to print page
    const printUrl = `${BASE_URL}/natpaper-print`
    console.log(`Navigating to ${printUrl}...`)
    
    await page.goto(printUrl, {
      waitUntil: 'networkidle0',
      timeout: PAGE_LOAD_TIMEOUT
    })
    console.log('Page loaded')

    // Wait for pdfReady signal
    console.log('Waiting for page to signal ready (window.pdfReady)...')
    await page.waitForFunction(
      () => window.pdfReady === true,
      { timeout: PDF_READY_TIMEOUT }
    )
    console.log('Page is ready for PDF generation')

    // Scroll through page to trigger any lazy content
    console.log('Scrolling through page to load all content...')
    await page.evaluate(async () => {
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
      const scrollHeight = document.body.scrollHeight
      const viewportHeight = window.innerHeight
      
      for (let y = 0; y < scrollHeight; y += viewportHeight) {
        window.scrollTo(0, y)
        await delay(150)
      }
      
      // Scroll back to top
      window.scrollTo(0, 0)
      await delay(500)
    })
    console.log('Scrolling complete')

    // Wait for any images to load
    console.log('Waiting for images to load...')
    await page.evaluate(async () => {
      const images = Array.from(document.images)
      await Promise.all(images.map(img => {
        if (img.complete) return Promise.resolve()
        return new Promise((resolve) => {
          img.onload = resolve
          img.onerror = resolve
          // Timeout after 5 seconds per image
          setTimeout(resolve, 5000)
        })
      }))
    })
    console.log('Images loaded')

    // Generate PDF
    console.log(`Generating PDF to: ${OUTPUT_PATH}`)
    await page.pdf({
      path: OUTPUT_PATH,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '25mm',
        right: '15mm',
        bottom: '25mm',
        left: '15mm'
      },
      displayHeaderFooter: false
    })

    console.log(`✓ PDF generated successfully: ${OUTPUT_PATH}`)

  } catch (error) {
    console.error('========================================')
    console.error('ERROR generating PDF:')
    console.error(error.message)
    console.error('Stack trace:', error.stack)
    console.error('========================================')
    process.exit(1)
  } finally {
    // Clean up resources
    if (browser) {
      console.log('Closing browser...')
      try {
        await browser.close()
      } catch (e) {
        console.log('Browser already closed')
      }
    }
    if (serverProcess) {
      console.log('Stopping server...')
      try {
        serverProcess.kill('SIGKILL') // Force kill
        // Also try killing process group
        try {
          process.kill(-serverProcess.pid, 'SIGKILL')
        } catch (e) {
          // Ignore - process may already be dead
        }
      } catch (e) {
        console.log('Server already stopped')
      }
    }
    console.log('Cleanup complete, exiting...')
    process.exit(0) // Force exit to prevent hanging
  }
}

generatePDF()
