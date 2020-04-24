// 该工具库用于主线程而非渲染线程

import { GLOBAL_CONFIG } from '../global'
import * as fs from 'fs'
import * as path from 'path'
import * as childProcess from 'child_process'
import fetch from 'electron-fetch'

// 获取资源
export async function fetchFile(url: string, encoding = 'binary') {
  const resp = await fetch(url, {
    headers: {
      'User-Agent': GLOBAL_CONFIG.HttpUserAgent,
    },
  })
  return (await resp.buffer()).toString(encoding)
}

// fs.mkdir 的 Promise 形式
export function mkdirPromise(dirname: string) {
  return new Promise((resolve, reject) => {
    fs.mkdir(dirname, (err) => {
      if (err) {
        reject(err)
      }
      resolve()
    })
  })
}

// fs.stst 的 Promise 形式
export function statPromise(dirname: string): Promise<fs.Stats> {
  return new Promise((resolve, reject) => {
    fs.stat(dirname, (err, stats) => {
      if (err) {
        reject(err)
      }
      resolve(stats)
    })
  })
}

// 递归创建目录，异步方法
export async function mkdirs(dirname: string): Promise<void> {
  try {
    await statPromise(dirname)
  } catch (e) {
    await mkdirs(path.dirname(dirname))
    await mkdirPromise(dirname).catch(() => {})
  }
}

// 写入本地文件
export async function writeFile(to: string, data: Buffer | string, encoding = 'binary'): Promise<void> {
  await mkdirs(path.dirname(to))
  return new Promise((resolve, reject) => {
    fs.writeFile(to, data, encoding, (err) => {
      if (err) {
        reject(err)
      }
      resolve()
    })
  })
}

// 读取本地文件
export function readFile(filepath: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data)
    })
  })
}

export function encodeData(data: Buffer | string, encoding: BufferEncoding = 'binary') {
  if (typeof data === 'string') {
    return Buffer.from(data as string, encoding)
  } else {
    return Buffer.from(data as Buffer)
  }
}

// 同步删除文件夹
export function removeDirSync(dir: string) {
  let command = ''
  if (process.platform === 'win32') {
    command = `rmdir /s/q "${dir}"`
  } else {
    command = `rm -rf "${dir}"`
  }
  childProcess.execSync(command)
}
