// Test serialization logic identical to apiRequest
function prepareRequest(options = {}) {
  const headers = new Headers(options.headers || {})

  let body = options.body
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    body = JSON.stringify(body)
  }

  if (body && !headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  return { headers, body }
}

// Case 1: Plain JS Object
const req1 = prepareRequest({
  body: {
    title: '10K Steps',
    points: 50
  }
})

console.log('Case 1 Content-Type:', req1.headers.get('Content-Type'))
console.log('Case 1 Body Type:', typeof req1.body)
console.log('Case 1 Body Value:', req1.body)
if (req1.body !== '{"title":"10K Steps","points":50}') {
  throw new Error('Case 1 failed!')
}

// Case 2: Already stringified JSON
const req2 = prepareRequest({
  body: JSON.stringify({
    title: '10K Steps',
    points: 50
  })
})
console.log('Case 2 Content-Type:', req2.headers.get('Content-Type'))
console.log('Case 2 Body Type:', typeof req2.body)
console.log('Case 2 Body Value:', req2.body)
if (req2.body !== '{"title":"10K Steps","points":50}') {
  throw new Error('Case 2 failed!')
}

// Case 3: FormData
const formData = new FormData()
formData.append('key', 'val')
const req3 = prepareRequest({ body: formData })
console.log('Case 3 Content-Type:', req3.headers.get('Content-Type'))
console.log('Case 3 Body instanceof FormData:', req3.body instanceof FormData)
if (req3.headers.has('Content-Type')) {
  throw new Error('Case 3 failed! Content-Type should not be set for FormData')
}

console.log('All apiRequest serialization tests passed!')
