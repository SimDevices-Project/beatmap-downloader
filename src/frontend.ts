import { app, ipcRenderer } from 'electron'
import { GLOBAL_CONFIG } from './global'
import { matchProtocols } from './Utils/url'

window.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.on('external-link', (event, ...args) => {
    const externalLink: string = <string>args[0]
    console.log(externalLink)
    const matchStats = matchProtocols(externalLink)
    if (matchStats.matched) {
      const [type, id] = externalLink.substr(matchStats.protocol.length + 3).split('/')
      let requestURL: string
      let apiVersion = 2
      switch (apiVersion) {
        default:
        case 2:
          switch (type) {
            // Beatmapset
            case 's':
              requestURL = `https://api.sayobot.cn/v2/beatmapinfo?K=${id}`
              break
            // Beatmap
            case 'b':
              requestURL = `https://api.sayobot.cn/v2/beatmapinfo?K=${id}&T=1`
              break
            default:
              return
          }
          break
      }
      fetch(requestURL, {
        headers: {
          'user-agent': GLOBAL_CONFIG.HttpUserAgent,
          'content-type': 'application/json',
        },
        method: 'GET',
        mode: 'cors',
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status !== 0) {
            return
          }
          const fileName: string = `${data.data.sid}.osz`
          const fileRequrestURL = `https://txy1.sayobot.cn/download/osz/${data.data.sid}`
          ipcRenderer.send('download-file', {
            name: fileName,
            url: fileRequrestURL,
          })
        })
    } else {
      return
    }
  })
  // 通知就绪
  ipcRenderer.send('main-window-ready')
})
