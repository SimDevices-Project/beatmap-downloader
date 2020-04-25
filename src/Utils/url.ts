import { GLOBAL_CONFIG } from '../global'

export const matchProtocols = (url: string) => {
  for (let i = 0; i < GLOBAL_CONFIG.Protocols.length; i++) {
    if (url.startsWith(GLOBAL_CONFIG.Protocols[i] + '://')) {
      return {
        matched: true,
        protocol: GLOBAL_CONFIG.Protocols[i],
      }
    }
  }
  return {
    matched: false,
    protocol: '',
  }
}
