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
