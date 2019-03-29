// import { Screenshooter, imgExtension } from "./screenshooter";

const { Screenshooter, imgExtension } = require('./screenshooter')

function collectInputs() {
  return {
    url: (document.getElementById('url-input') as HTMLInputElement).value,
    args: {
      width: Number((document.getElementById('w-input') as HTMLInputElement).value),
      height: Number((document.getElementById('h-input') as HTMLInputElement).value),
      ext: (document.getElementById('ext-input') as HTMLInputElement).value,
      scrollFirst: (document.getElementById('scroll-first-input') as HTMLInputElement).checked,
      output: undefined, // @TODO
      headful: (document.getElementById('headful-input') as HTMLInputElement).checked,
      verbose: undefined,
      disableSandboxing: (document.getElementById('disable-sandbox-input') as HTMLInputElement)
        .checked
    },
    pause: (document.getElementById('pause-input') as HTMLInputElement).checked
  }
}
;(document.querySelector('form') as HTMLFormElement).addEventListener('submit', e => {
  doTheScreenshot(collectInputs())
  e.preventDefault()
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
  const sc = new Screenshooter(url, args)

  await sc.prepare()
  await sc.fire()
  await sc.finish()
}

function errorExit(...e: any[]): never {
  console.error(e)
  alert(e)
  return process.exit(1)
}
