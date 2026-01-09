#!/usr/bin/env node

/**
 * PDF Generation Script for NATpaper
 * Uses Puppeteer to render the print-optimized page and generate a PDF
 * 
 * Usage: node scripts/generate-pdf.js [--dev]
 * 
 * Options:
 *   --dev    Use local dev server (http://localhost:5173) instead of building first
 */

import puppeteer from 'puppeteer'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, mkdirSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

const isDev = process.argv.includes('--dev')
const BASE_URL = isDev ? 'http://localhost:5173' : 'http://localhost:4173'
const OUTPUT_PATH = join(projectRoot, 'public', 'natpaper.pdf')

async function waitForServer(url, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url)
      if (response.ok) return true
    } catch {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  throw new Error(`Server at ${url} did not become available`)
}

async function startPreviewServer() {
  console.log('Starting preview server...')
  const server = spawn('npm', ['run', 'preview'], {
    cwd: projectRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true
  })

  server.stdout.on('data', (data) => {
    const output = data.toString()
    if (output.includes('Local:')) {
      console.log('Preview server started')
    }
  })

  server.stderr.on('data', (data) => {
    console.error(`Server error: ${data}`)
  })

  return server
}

async function generatePDF() {
  let server = null
  let browser = null

  try {
    // Ensure public directory exists
    const publicDir = join(projectRoot, 'public')
    if (!existsSync(publicDir)) {
      mkdirSync(publicDir, { recursive: true })
    }

    // Start server if not in dev mode
    if (!isDev) {
      console.log('Building project...')
      const build = spawn('npm', ['run', 'build'], {
        cwd: projectRoot,
        stdio: 'inherit',
        shell: true
      })

      await new Promise((resolve, reject) => {
        build.on('close', (code) => {
          if (code === 0) resolve()
          else reject(new Error(`Build failed with code ${code}`))
        })
      })

      server = await startPreviewServer()
    }

    // Wait for server to be ready
    console.log(`Waiting for server at ${BASE_URL}...`)
    await waitForServer(BASE_URL)
    console.log('Server is ready')

    // Launch Puppeteer
    console.log('Launching browser...')
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

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
      timeout: 60000
    })

    // Wait for pdfReady signal
    console.log('Waiting for page to signal ready...')
    await page.waitForFunction(
      () => (window).pdfReady === true,
      { timeout: 30000 }
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
        await delay(100)
      }
      
      // Scroll back to top
      window.scrollTo(0, 0)
      await delay(500)
    })

    // Generate PDF
    console.log('Generating PDF...')
    await page.pdf({
      path: OUTPUT_PATH,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="width: 100%; font-size: 10px; padding: 0 15mm; color: #666; text-align: center;">
          NATpaper - natgmi.com
        </div>
      `,
      footerTemplate: `
        <div style="width: 100%; font-size: 10px; padding: 0 15mm; color: #666; text-align: center;">
          Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `
    })

    console.log(`PDF generated successfully: ${OUTPUT_PATH}`)

  } catch (error) {
    console.error('Error generating PDF:', error)
    process.exit(1)
  } finally {
    if (browser) {
      await browser.close()
    }
    if (server) {
      server.kill()
    }
  }
}

generatePDF()
