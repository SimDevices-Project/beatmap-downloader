import { app, remote } from 'electron'
import * as os from 'os'

export const GLOBAL_CONFIG = {
  HttpUserAgent: `Mozilla/5.0 (${os.type()} ${os.release()}; ${os.arch()}) SimBeatmapDownloader/${
    app?.getVersion() || remote.app.getVersion()
  } Chrome/${process.versions.chrome}`,
  Protocol: 'osu://',
}
