import puppeteer from 'puppeteer'
import os from 'os'
import fs from 'fs'
import { getFormatedDate, pad, errorExit } from './helpers'

export type imgExtension = 'jpg' | 'jpg' | 'png'

export class Screenshooter {
  public width: number
  public height: number
  public ext: imgExtension
  public scrollFirst: boolean
  public output: string
  public headful: boolean
  public verbose: boolean
  public disableSandboxing: boolean
  public overwriteIfExists: boolean

  public browser?: puppeteer.Browser
  public page?: puppeteer.Page

  constructor(
    public url: string,
    {
      width = 1920,
      height = 200,
      ext = 'png',
      scrollFirst = false,
      output = `${os.homedir()}/Pictures/${getFormatedDate()}`,
      headful = false,
      verbose = false,
      disableSandboxing = false,
      overwriteIfExists = false
    }: {
      width?: number
      height?: number
      ext?: imgExtension
      scrollFirst?: boolean
      output?: string
      headful?: boolean
      verbose?: boolean
      disableSandboxing?: boolean
      overwriteIfExists?: boolean
    } = {
      width: 1920,
      height: 200,
      ext: 'png',
      scrollFirst: false,
      output: `${os.homedir()}/Pictures/${getFormatedDate()}`,
      headful: false,
      verbose: true,
      disableSandboxing: false,
      overwriteIfExists: false
    }
  ) {
    this.width = width
    this.height = height
    this.ext = ext
    this.scrollFirst = scrollFirst
    this.output = output.endsWith(ext) ? output : `${output}.${ext}`
    this.headful = headful
    this.verbose = verbose
    this.disableSandboxing = disableSandboxing
    this.overwriteIfExists = overwriteIfExists
  }

  async prepare(): Promise<boolean> {
    const args = this.disableSandboxing ? ['--no-sandbox'] : []
    const headless = !this.headful
    this.browser = await puppeteer.launch({ args, headless }).catch(Promise.reject)

    this.page = await this.browser.newPage().catch(Promise.reject)
    await this.page.goto(this.url, { waitUntil: 'networkidle2' }).catch(Promise.reject)

    await this.page.setViewport({ width: this.width, height: this.height })

    if (this.scrollFirst) {
      // scrolls through page to make sure everything has loaded
      await this.page.evaluate(
        async () =>
          new Promise((resolve, reject) => {
            try {
              const maxScroll = Number.MAX_SAFE_INTEGER
              let lastScroll = 0
              const interval = setInterval(() => {
                window.scrollBy(0, 200)
                const scrollTop = document.documentElement.scrollTop
                if (scrollTop === maxScroll || scrollTop === lastScroll) {
                  clearInterval(interval)
                  resolve()
                } else {
                  lastScroll = scrollTop
                }
              }, 100)
            } catch (err) {
              reject(err)
            }
          })
      )
    }

    return true
  }

  async fire(): Promise<void> {
    
    let finalOutput = this.output
    
    if (!this.overwriteIfExists) {

      let { groups } = /(?<name>.*)\.(?<ext>\w+)$/.exec(this.output) as RegExpExecArray
      let ext = groups!.ext
      let name = groups!.name 
      let suffix = 0
      
      
      while (fs.existsSync(finalOutput)) {
        
        finalOutput = `${name}_${++suffix}.${ext}`
      }
    }
    
    await this.page!.screenshot({ path: finalOutput, fullPage: true }).catch(Promise.reject)
  }

  async finish(): Promise<void> {
    return this.browser!.close()
  }
}
