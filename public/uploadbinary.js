const manuSelect = document.getElementById('select-manuracturer')
const batchSelect = document.getElementById('select-batches')
const getBatchesUrl = location.origin + '/api/v1/getBatchesforManufacturer'
const createOptionNode = (optionString, value) => {
  const node = document.createElement("option")
  node.innerHTML = optionString
  node.value = value
  return node
}
const handleBatchSelect = (batches) => {
  if (batches.length === 0) {
    return
  }
  batchSelect.disabled = true
  batchSelect.innerHTML = null
  batches.forEach(element => {
    batchSelect.appendChild(createOptionNode(element.name, element._id))
  })
  batchSelect.disabled = false
}

manuSelect.addEventListener('click', async (e) => {
  batchSelect.disabled = true
  const toBeSent = {
    manufacturerId: e.target.value
  }
  const searchParams = new URLSearchParams(toBeSent)
  const response = await fetch(`${getBatchesUrl}?${searchParams.toString()}`, {
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    method: 'GET',
  })
  if (response.ok) {
    const resJson = await response.json()
    handleBatchSelect(resJson.body)
  } else {
    console.error(response.status)
  }
})
