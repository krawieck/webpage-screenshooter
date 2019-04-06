const { Screenshooter, imgExtension } = require('./screenshooter')
const fs = require('fs')
const YAML = require('yaml')
const path = require('path')
const cp = require('child_process')
const format = require('string-template')
const { pad } = require('./helpers')
const os = require('os')

function openSettings() {
  if (process.platform === 'win32') {
    cp.exec('start "" ./defaults.yml')
  } else {
    cp.exec('xdg-open ./defaults.yml')
  }
}

function collectInputs() {
  return {
    url: (document.getElementById('url-input') as HTMLInputElement).value,
    args: {
      width: Number((document.getElementById('w-input') as HTMLInputElement).value),
      height: Number((document.getElementById('h-input') as HTMLInputElement).value),
      ext: (document.getElementById('file-input') as HTMLInputElement).value.slice(-4),
      scrollFirst: (document.getElementById('scroll-first-input') as HTMLInputElement).checked,
      output:
        (document.getElementById('file-input-label') as HTMLLabelElement).innerHTML || undefined,
      headful: (document.getElementById('pause-input') as HTMLInputElement).checked || (document.getElementById('headful-input') as HTMLInputElement).checked,
      verbose: undefined,
      disableSandboxing: (document.getElementById('disable-sandbox-input') as HTMLInputElement)
        .checked,
      overwriteIfExists: (document.getElementById('overwrite-if-exists-input') as HTMLInputElement).checked
    },
    pause: (document.getElementById('pause-input') as HTMLInputElement).checked
  }
}
;(document.querySelector('form') as HTMLFormElement).addEventListener('submit', async e => {
  e.preventDefault()
  ;(document.getElementById('submit') as HTMLInputElement).disabled = true
  console.log(collectInputs())
  await doTheScreenshot(collectInputs())
})

async function doTheScreenshot({
  url,
  args,
  pause
}: {
  url: string
  args: Object
  pause: boolean
}): Promise<void> {
  let submit = document.getElementById('submit') as HTMLInputElement
  const sc = new Screenshooter(url, args)

  await sc.prepare()
  if (pause) {
    let resumeButton = document.createElement('input')
    resumeButton.type = 'button'
    resumeButton.value = 'Resume'

    let pauseWrapper = document.getElementById('pause-wrapper') as HTMLSpanElement
    pauseWrapper.appendChild(resumeButton)
    resumeButton.addEventListener('click', async () => {
      await sc.fire()
      await sc.finish()
      submit.disabled = false
      pauseWrapper.removeChild(resumeButton)
    })
  } else {
    await sc.fire()
    await sc.finish()
    submit.disabled = false
  }
}

function readDefaults(): void {
  try {
    let f = fs.readFileSync('./defaults.yml', 'utf8')
    let defaults: {
      url: string
      path: string
      nameTemplate: string
      width: number
      height: number
      scrollFirst: boolean
      headful: boolean
      pauseBefore: boolean
      noSandbox: boolean,
      overwriteIfExists: boolean
    } = YAML.parse(f)
    const d = new Date()
    const template = {
      Y: d.getFullYear(),
      m: pad(String(d.getMonth())),
      d: pad(String(d.getDate())),
      H: d.getHours(),
      i: d.getMinutes(),
      s: d.getSeconds(),
      home: os.homedir()
    }

    const file: string = path.join(
      format(defaults.path, template),
      format(defaults.nameTemplate, template)
    )
    console.log({ defaults, file })
    ;(document.getElementById('url-input') as HTMLInputElement).value = defaults.url
    ;(document.getElementById('w-input') as HTMLInputElement).value = String(defaults.width)
    ;(document.getElementById('h-input') as HTMLInputElement).value = String(defaults.height)
    ;(document.getElementById('scroll-first-input') as HTMLInputElement).checked =
      defaults.scrollFirst
    ;(document.getElementById('file-input-label') as HTMLLabelElement).innerHTML = file
    ;(document.getElementById('headful-input') as HTMLInputElement).checked = defaults.headful
    ;(document.getElementById('disable-sandbox-input') as HTMLInputElement).checked =
      defaults.noSandbox
    ;(document.getElementById('pause-input') as HTMLInputElement).checked = defaults.pauseBefore
    ;(document.getElementById('overwrite-if-exists-input') as HTMLInputElement).checked = defaults.overwriteIfExists
  } catch (e) {
    console.log('error:', e)
  }
}

;(document.querySelector('#file-input') as HTMLInputElement).addEventListener('change', (e: Event) => {
  let val = (document.querySelector('#file-input') as HTMLInputElement).value
  ;(document.querySelector('#file-input-label') as HTMLInputElement).innerHTML = val
})

function errorExit(...e: any[]): never {
  console.error(e)
  alert(e)
  return process.exit(1)
}

readDefaults()
