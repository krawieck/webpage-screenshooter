const puppeteer = require('puppeteer')
const argv = require('minimist')(process.argv.slice(2))
if (argv.verbose) console.log(argv)

// Parse args
if (!argv._[0]) {
  console.log('url as positional argument is required!')
  process.exit(1)
}

const url = argv._[0]
const width = Number(argv.w) || 1920
const height = Number(argv.h) || 1080
const headless = !argv.headful
const scrollFirst = argv['scroll-first'] || false
let o = argv.o || `webpage_screenshot_${new Date().toLocaleString('pl')}.png`

const output = o.endsWith('.png') || o.endsWith('.jpg') || o.endsWith('.jpeg') ? o : `${o}.png`

const args = argv['linux-workaround'] ? ['--no-sandbox', '--disable-setuid-sandbox'] : []

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
