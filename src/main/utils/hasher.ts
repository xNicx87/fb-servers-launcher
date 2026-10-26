import fs from 'node:fs'
import crypto from 'node:crypto'

export async function calculateFileSha256(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256')
    const stream = fs.createReadStream(filePath)

    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('hex').toLowerCase()))
    stream.on('error', (err) => reject(err))
  })
}

export async function verifyChecksum(filePath: string, expectedSha256: string): Promise<boolean> {
  try {
    if (!fs.existsSync(filePath)) return false
    const actual = await calculateFileSha256(filePath)
    return actual.toLowerCase() === expectedSha256.toLowerCase()
  } catch (err) {
    console.error(`Error verifying checksum for ${filePath}:`, err)
    return false
  }
}
