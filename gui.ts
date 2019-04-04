const { Screenshooter, imgExtension } = require('./screenshooter')

function collectInputs() {
  return {
    url: (document.getElementById('url-input') as HTMLInputElement).value,
    args: {
      width: Number((document.getElementById('w-input') as HTMLInputElement).value),
      height: Number((document.getElementById('h-input') as HTMLInputElement).value),
      ext: (document.getElementById('ext-input') as HTMLInputElement).value,
      scrollFirst: (document.getElementById('scroll-first-input') as HTMLInputElement).checked,
      output: (document.getElementById('file-input') as HTMLInputElement).value || undefined,
      headful: (document.getElementById('headful-input') as HTMLInputElement).checked,
      verbose: undefined,
      disableSandboxing: (document.getElementById('disable-sandbox-input') as HTMLInputElement)
        .checked
    },
    pause: (document.getElementById('pause-input') as HTMLInputElement).checked
  }
}
;(document.querySelector('form') as HTMLFormElement).addEventListener('submit', async e => {
  e.preventDefault()
  ;(document.getElementById('submit') as HTMLInputElement).disabled = true
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

function errorExit(...e: any[]): never {
  console.error(e)
  alert(e)
  return process.exit(1)
}
