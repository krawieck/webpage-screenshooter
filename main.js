const puppeteer = require('puppeteer')
const argv = require('yargs')
  .usage('Usage: $0 <url> [options]')
  .option('w', {
    alias: 'width',
    default: 1920,
    describe: 'sets width of the screenshot',
    type: 'number'
  })
  .option('h', {
    alias: 'height',
    default: 1080,
    describe:
      "sets height of browser's viewport. useful for short websites, e.g. https://google.com",
    type: 'number'
  })
  .option('ext', { default: 'png', describe: 'extension of the image', choices: ['jpeg', 'jpg', 'png'] })
  .option('scroll-first', {
    default: false,
    describe:
      'First scroll through the page before taking a screenshot. Useful or even ' +
      'necessary for some websites where content is generated as user scrolls',
    type: 'boolean'
  })
  .option('output', {
    default: `webpage_screenshot_${getFormatedDate()}`,
    describe: 'output name',
    type: 'string'
  })
  .option('headful', { default: false, describe: 'turns headless mode off', type: 'boolean' })
  .option('verbose', {
    default: false,
    describe: 'Print various debugging information',
    type: 'boolean'
  })
  .option('disable-sandbox', {
    deafult: false,
    describe: 'turn sandboxing in chrome off, may be needed on some linux distros',
    type: 'boolean'
  })
  .argv


if (argv.verbose) console.log(argv)

// Parse args
if (!argv._[0]) {
  console.log('url as q first positional argument is required!')
  process.exit(1)
}

const url = argv._[0]
const ext = argv.ext
const width = Number(argv.w) || 1920
const height = Number(argv.h) || 1080
const headless = !argv.headful
const scrollFirst = argv.scrollFirst

const output = argv.output.endsWith(ext) ? argv.output : `${argv.output}.${ext}`

const args = argv.disableSandbox ? ['--no-sandbox'] : []

// Do the screenshooting
;(async () => {
  const browser = await puppeteer
    .launch({ args, headless })
    .catch(e =>
      errorExit(
        e + '======================================',
        "\nseems like somethig went wrong when launching chromium, if you're on",
        'linux you might wanna try running this tool with "--linux-workaround" flag,',
        'but BEWARE, IT DISABLES SANDBOXING WHICH MIGHT LEAD TO SOME BAD STUFF WITH',
        "SOME DODGY WEBSITES\n\noh, also read the puppeteer's error message above"
      )
    )
  const page = await browser
    .newPage()
    .catch(e =>
      errorExit(
        "couln't open new page, here's the error msg,",
        'if u wanna figure out what went wrong:\n',
        e
      )
    )

  await page
    .goto(url, { waitUntil: 'networkidle2' })
    .catch(e =>
      errorExit(
        "couldn't go to desired page, check the url",
        "and make sure it has the 'http' part, also",
        "here's the puppeteer's error message:",
        e
      )
    )

  await page.setViewport({ width, height })

  if (scrollFirst) {
    // scrolls through page to make sure everything has loaded
    await page.evaluate(
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

  await page
    .screenshot({ path: output, fullPage: true })
    .catch(e => errorExit("couldn't take screenshot, here's puppeteer's error msg:\n", e))

  await browser.close()
})()

function errorExit(...e) {
  console.log(...e)
  process.exit(1)
}

function getFormatedDate() {
  const date = new Date()
  return `${date.getFullYear()}-${pad(date.getMonth())}-${pad(date.getDate())}\
_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`
}

function pad(str, num = 2) {
  let out = String(str)
  while (out.length < num) {
    out = `0${out}`
  }
  return out
}
