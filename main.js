const puppeteer = require('puppeteer')
const argv = require('minimist')(process.argv.slice(2))
if (argv.verbose) console.log(argv)

if (!argv._[0]) {
	console.log('url as positional argument is required!')
	process.exit(1)
}

const url = argv._[0]
const width = Number(argv.w) || 1920
const height = Number(argv.h) || 1080
const headless = !argv.headful
const scrollFirst = argv['scrol-first'] || false
let o = argv.o || `webpage_screenshot_${new Date().toLocaleString('pl')}.png`

const output = o.endsWith('.png') || o.endsWith('.jpg') || o.endsWith('.jpeg') ? o : `${o}.png`

const args = argv['linux-workaround'] ? ['--no-sandbox', '--disable-setuid-sandbox'] : []
;(async () => {
	const browser = await puppeteer.launch({ args, headless }).catch(e => {
		console.log(
			e +
				'======================================\n' +
				"seems like somethig went wrong when launching chromium, if you're on " +
				'linux you might wanna try running this tool with "--linux-workaround" flag, ' +
				'but BEWARE, IT DISABLES SANDBOXING WHICH MIGHT LEAD TO SOME BAD STUFF WITH ' +
				"SOME DODGY WEBSITES\n\noh, also read the puppeteer's error message above"
		)
		process.exit()
	})
	const page = await browser.newPage().catch(e => {
		console.log(
			"couln't open new page, here's the error msg, if u wanna figure out what went wrong:\n",
			e
		)
		process.exit(1)
	})
	await page.goto(url, { waitUntil: 'networkidle0' }).catch(e => {
		console.log(
			"couldn't go to desired page, check the url and make sure it has the 'http' part, also here's the puppeteer's error message:",
			e
		)
		process.exit(1)
	})
  await page.setViewport({ width, height })

	if (scrollFirst) {
		await page.evaluate(
			async () =>
				new Promise((resolve, reject) => {
					try {
						const maxScroll = Number.MAX_SAFE_INTEGER
						let lastScroll = 0
						const interval = setInterval(() => {
							window.scrollBy(0, 100)
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

	await page.screenshot({ path: output, fullPage: true }).catch(e => {
		console.log("couldn't take screenshot, here's puppeteer's error msg:\n", e)
		process.exit(1)
	})

	await browser.close()
})()
