import { readFileSync, readdirSync, writeFileSync } from 'fs'

const types = {
  png: {},
  ogg: {},
}

async function getNames() {
  const dir = await readdirSync('./public/')
  for (let i of dir) {
    const [name, type] = i.split('.')
    if (!type) continue
    if (!types[type]) {
      types[type] = {}
    }
    types[type][name] = name
  }

  const sheetsDir = await readdirSync('./public/sheets/')
  types['sheets'] = {}
  for (let i of sheetsDir) {
    const [name, type] = i.split('.')
    const [dims, spacing] = name.split('_')[1].split('s')
    const [width, height] = dims.split('x')
    types['sheets'][name] = {
      name: name.split('_')[0],
      width: Number(width),
      height: Number(height),
      spacing: Number(spacing),
    }
  }

  writeFileSync(
    './src/assets.js',
    `${Object.keys(types)
      .map(key => {
        return `export const ${key} = ${JSON.stringify(types[key], null, 2)}`
      })
      .join('\n')}`,
    'utf-8'
  )
}

getNames()
