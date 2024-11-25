import api from '../../renderer/src/api'
import axios from 'axios'

export function extractRenderDetailID(fileName) {
  // const match = fileName.match(/^(\d+)/)
  const match = fileName.match(/\d+/)
  return match ? match[1] : null
}

export function extractPatientNumber(fileName) {
  const match = fileName.match(/^(.*?)/)
  return match ? match[1] : null
}

export function extractTransactionNumber(fileName) {
  const match = fileName.match(/&([^&]+)&/)
  return match ? match[1] : null
}

export function extractPatientName(fileName) {
  const match = fileName.match(/&([^&]+)&([^&]+)&/)
  return match ? match.slice(1).join(', ').replace(/\^/g, ' ') : null
}

export function extractRenderNumber(fileName) {
  const match = fileName.match(/&([^&]+)&([^&]+)&([^&]+)&([^&]+)\.pdf/)
  return match ? match[4] : null
}

export function finalizeDocPath(inputString) {
  const regexPattern = /:(.+)/
  const matchResult = inputString.match(regexPattern)

  if (matchResult && matchResult[1]) {
    return matchResult[1]
  } else {
    return null
  }
}

export async function updatePath(payload, endpoint) {
  let result
  const response = await axios.patch(`${endpoint}/updatePath`, {
    ID: payload.ID,
    DocumentPath: payload.DocumentPath
  })

  result = `Patient ${response.data.data.patient} results have been uploaded.`

  return result
}

export async function checkApi(endpoint) {
  let results
  try {
    const response = await axios.get(`${endpoint}/checkAPI`)
    results = response.data.data
  } catch (error) {
    results = error.response.statusText
  }
  console.log('electron console', results)
  return results
}

export function isNumericFileName(fileName) {
  if (isNaN(fileName)) return false
  return true
}


export function isErrorFileName(filename) {
  return filename.includes('JBL')
}
