// scripts/checkNumericKeys.js
const fs = require('fs')
const path = require('path')

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file)
    if (fs.statSync(full).isDirectory()) return walk(full)
    if (full.endsWith('.json')) {
      const lines = fs.readFileSync(full, 'utf8').split(/\r?\n/)
      lines.forEach((l, i) => {
        if (/^\s*\d+:/.test(l)) {
          console.log(`${full}:${i+1}: ${l.trim()}`)
        }
      })
    }
  })
}

// Вкажи тут правильний шлях до твоїх локалей:
const localesDir = path.resolve(__dirname, 'src/locales');
walk(localesDir)
