import api from '../../renderer/src/api'
import axios from 'axios'

export function extractRenderDetailID(fileName) {
  const match = fileName.match(/^(\d+)/)
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

export async function updatePath(payload) {
  let result
  const response = await axios.patch('http://192.163.8.244:70/api/updatePath', {
    ID: payload.ID,
    DocumentPath: payload.DocumentPath
  })

  result = `Patient ${response.data.data.patient} results have been uploaded.`

  return result
}
