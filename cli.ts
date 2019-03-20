import { getFormatedDate } from './helpers'
import { Screenshooter, imgExtension } from './screenshooter'

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
  .option('ext', {
    default: 'png',
    describe: 'extension of the image',
    choices: ['jpeg', 'jpg', 'png']
  })
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
  }).argv

if (argv.verbose) console.log(argv)

// Parse args
if (!argv._[0]) {
  console.log('url as q first positional argument is required!')
  process.exit(1)
}

const url: string = argv._[0]
const width: number = argv.w
const height: number = argv.h
const ext: imgExtension = argv.ext
const scrollFirst: boolean = argv.scrollFirst
const output: string = argv.output
const headful: boolean = argv.headful
const verbose: boolean = argv.verbose
const disableSandboxing: boolean = argv.disableSandboxing

let sc = new Screenshooter(url, {
  width,
  height,
  ext,
  scrollFirst,
  output,
  headful,
  verbose,
  disableSandboxing
})
;(async () => {
  await sc.prepare()
  await sc.fire()
  await sc.finish()
})()
