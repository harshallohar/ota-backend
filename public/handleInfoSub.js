//globals
let inpEleCount = 1
const addMoreBut = document.querySelector('#addMore')
const inputContainer = document.querySelector('#imp-components')
// const subSelectContainer = document.querySelector('#manufacturer-select-container')
const mainFieldSelect = document.querySelector('#field-select')
const submitBut = document.querySelector('#submit')
let selectedField = 'm'
const jsonHeader = {
  'content-type': 'application/json'
}
const htmlIds = {
  batchSelect: 'batch-select',
  manufacturerSelect: 'manufacturer-select',
  manufacturerSelectContainer: 'manufacturer-select-container',
  batchSelectContainer: 'batch-select-container'
}
const manufacturerUrl = '/api/v1/getAllManufacturers'
const batchUrl = '/api/v1/getBatchesforManufacturer'
const placeholderVals = {
  m: 'manufacturer name',
  e: 'esp name',
  b: 'batch name',
  p: 'pic ID'
}

const postUrls = {
  'm': '/api/v1/addSingleManufacturer',
  'e': '/api/v1/addSingleEsp',
  'b': '/api/v1/addSingleBatch',
  'p': '/api/v1/addSinglePic',
}

//utility functions
function customFetch(url, headers, method, body, otherFields) {
  return fetch(url, {
    ...otherFields,
    method,
    headers,
    body
  })
}

const createOptionNode = (optionString, value) => {
  const node = document.createElement('option')
  node.innerHTML = optionString
  node.value = value
  return node
}

const createMenufromList = async (url, id, container) => {
  //url: to fetch menu items
  //id: for select element
  //container in which menu is added
  const res = await customFetch(url, jsonHeader, 'GET')
  const resObj = await res.json()
  if (resObj.success) {
    const selectElement = document.createElement('select')
    selectElement.id = id || 'select-2'
    if (resObj.body.length !== 0) {
      resObj.body.forEach((obj) => {
        selectElement.appendChild(createOptionNode(obj.name, obj._id))
      })
      container.appendChild(selectElement)
    }
  } else {
    console.error(resObj.error)
  }
  return resObj
}

//dynamic event handlers
document.addEventListener('click', (e) => {
  //remove element on delete
  if (e.target && e.target.id.startsWith('dlt-')) {
    e.target.parentElement.parentElement.remove()
  }
})

document.addEventListener('change', async (e) => {
  //change batch select depending on the value of manufacturer select
  if (e.target && e.target.id === htmlIds.manufacturerSelect) {
    if (mainFieldSelect.value === 'p') {
      //remove existing batch field
      console.log('removed')
      document.getElementById(`${htmlIds.batchSelect}`)?.remove()
      await createMenufromList(batchUrl + '?' + new URLSearchParams({ manufacturerId: e.target.value }), htmlIds.batchSelect, document.querySelector(`#${htmlIds.batchSelectContainer}`))
    }
  }
})
//static event handlers
//submit button
submitBut.addEventListener('click', () => {
  const allInpContainers = document.querySelectorAll('.inpCon')
  if (allInpContainers.length === 0) {
    alert('add fields by pressing add more button')
    return
  }
  //array to hold all input values
  const toBeSent = []
  let send = true
  for (let ele of allInpContainers) {
    //a container is valid if all inp elements has some valid input
    let validContainer = true
    const obj = {}
    for (let child of ele.children) {
      if (child.tagName === 'INPUT') {
        if (child.value.trim() === '') {
          child.classList.add('redBorder')
          send = false
          validContainer = false
        } else {
          obj[child.getAttribute('name')] = child.value
        }
      }
    }
    if (validContainer) {
      toBeSent.push({ ...obj, id: ele.id })
    }
  }
  if (toBeSent.length !== 0 && send) {
    processVals(toBeSent)
  }
})

mainFieldSelect.addEventListener('change', async e => {
  selectedField = e.target.value
  //remove all input containers
  inputContainer.textContent = ''
  // remove previously added options lists
  //manufacturers
  document.querySelector('#manufacturer-select-container > select')?.remove()
  //batches
  document.querySelector('#batch-select-container > select')?.remove()
  addMoreBut.click()
  switch (e.target.value) {
    case 'b':
      {
        //remove batch select if present
        document.querySelector(`#${htmlIds.batchSelect}`)?.remove()
        await createMenufromList(manufacturerUrl, htmlIds.manufacturerSelect, document.querySelector(`#${htmlIds.manufacturerSelectContainer}`))
      }
      break
    case 'e':
      {
        //remove batch select if present
        document.querySelector(`#${htmlIds.batchSelect}`)?.remove()
        await createMenufromList(manufacturerUrl, htmlIds.manufacturerSelect, document.querySelector(`#${htmlIds.manufacturerSelectContainer}`))
      }
      break
    case 'p':
      {
        const manufacturers = await createMenufromList(manufacturerUrl, htmlIds.manufacturerSelect, document.querySelector(`#${htmlIds.manufacturerSelectContainer}`))
        if (manufacturers.success && manufacturers.body.length !== 0) {
          await createMenufromList(batchUrl + '?' + new URLSearchParams({
            manufacturerId: manufacturers.body[0]._id
          }), htmlIds.batchSelect, document.querySelector(`#${htmlIds.batchSelectContainer}`))
        }
      }
      break
    default:
      {
        //remove batch select if present
        document.querySelector(`#${htmlIds.batchSelect}`)?.remove()
        //remove manufacturer select if present
        document.querySelector(`#${htmlIds.manufacturerSelect}`)?.remove()
      }
      break
  }
})
//add more fields
addMoreBut.addEventListener('click', () => {
  const inpCon = document.createElement('div')
  inpCon.classList.add('conForError')
  if (selectedField === 'e') {
    inpCon.innerHTML = `<div class="inpCon flex" id="div-${++inpEleCount}"><input type="text" name="name" placeholder="${placeholderVals[selectedField]}" class="manuName inp" id="in-${inpEleCount}"> <input type="text" name="espId" placeholder="espId" class="inp" id="insec-${inpEleCount}"><button class='dlt btn-danger' id="dlt-${inpEleCount}">Delete</button></div>`
  }
  else {
    inpCon.innerHTML = `<div class="inpCon flex" id="div-${++inpEleCount}"><input type="text" name="name" placeholder="${placeholderVals[selectedField]}" class="manuName inp" id="in-${inpEleCount}"><button class='dlt btn-danger' id="dlt-${inpEleCount}">Delete</button></div>`
  }
  inputContainer.appendChild(inpCon)
  document.getElementById('inpArea').scrollTop = document.getElementById('inpArea').scrollHeight
})

//specific functions
//processes an array of input divs
//adds spinner and sends network reqs
function processVals(valsArray) {
  valsArray.forEach((ele) => {
    const inpEleCon = document.querySelector(`#${ele.id}`)
    //adds spinner if it hasn't any
    if (!inpEleCon.hasSpinner) {
      const spinner = document.createElement('div')
      spinner.classList.add('loading')
      inpEleCon.appendChild(spinner)
      inpEleCon.hasSpinner = true
      //adding this prop for removing the spinner later
      inpEleCon.spinner = spinner
    }
    const manufacturerSelect = document.querySelector(`#${htmlIds.manufacturerSelect}`)
    const batchSelect = document.querySelector(`#${htmlIds.batchSelect}`)
    //send real network req
    handleNetworkReq(postUrls[mainFieldSelect.value], inpEleCon, {
      ...ele,
      manufacturerId: manufacturerSelect?.value,
      batchId: batchSelect?.value,
    })
  })
}

//send network request
async function handleNetworkReq(url, container, body) {
  const res = await customFetch(url, jsonHeader, 'POST', JSON.stringify(body))
  const responseObj = await res.json()
  container.spinner.remove()
  container.hasSpinner = false
  if (responseObj.success) {
    container.classList.add('green')
    setTimeout(() => {
      container.parentElement.remove()
    }, 500)
  } else {
    //creating and updating error element
    const errorEle = document.createElement('div')
    errorEle.classList.add('errorDiv')
    errorEle.innerHTML = responseObj.error
    //removing existing error element if any
    container.parentElement.errorEle?.remove()
    container.parentElement.errorEle = errorEle
    container.parentElement.appendChild(errorEle)
  }
}

addMoreBut.click()
