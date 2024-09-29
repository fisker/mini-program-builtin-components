import fs from 'node:fs/promises'
import * as cheerio from 'cheerio'
import writePrettierFile from 'write-prettier-file'

const COMPONENTS_PAGE_URL =
  'https://developers.weixin.qq.com/miniprogram/dev/component/'

const CACHE_FILE = new URL('../.cache/components.html', import.meta.url)
const SCRIPT_FILE = new URL('../index.js', import.meta.url)

const fetchHtml = async (url) => {
  const response = await fetch(url)
  const html = await response.text()
  return `<!-- Downloaded from ${url} @${new Date()} -->\n\n${html}`
}

async function getHtml() {
  let stat

  try {
    stat = await fs.stat(CACHE_FILE)
  } catch {}

  if (stat) {
    if (Date.now() - stat.ctimeMs < /* 10 hours */ 10 * 60 * 60 * 1000) {
      return fs.readFile(CACHE_FILE, 'utf8')
    }

    await fs.rm(CACHE_FILE)
  }

  const html = await fetchHtml(COMPONENTS_PAGE_URL)

  await fs.mkdir(new URL('./', CACHE_FILE), {recursive: true})
  await fs.writeFile(CACHE_FILE, html)

  return html
}

async function getComponents() {
  const html = await getHtml()
  const $ = cheerio.load(html)

  const components = ['page']
  for (let anchor of $('td:nth-child(2) > a')) {
    anchor = $(anchor)
    const href = anchor.attr('href')
    const textContent = anchor.text()

    if (href !== `${textContent}.html`) {
      throw new Error('Unexpected data')
    }
    components.push(textContent)
  }
  return components
}

const components = await getComponents()

await writePrettierFile(
  SCRIPT_FILE,
  `
// Generated script, do not edit

export default ${JSON.stringify(components.toSorted())};
`,
)
