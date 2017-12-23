var adInfoRow = ['שכונה:', 'קומה:', 'גודל במ"ר:', 'ישוב:', 'כתובת:']

var convertToCSV = (objArray) => {
  var data = JSON.parse(objArray)
  var temp = Object.keys(data)[0]
  var header = Object.keys(data[temp]).join(';') + '\r\n'
  var str = header
  Object.keys(data).forEach((item) => {
    var line = ''
    Object.values(data[item]).forEach((cell) => {
      if (line != '') line += ';'
      line += cell
    })
    str += line + '\r\n'
  })
  return str
}

var exportCSVFile = () => {
  var jsonObject = localStorage.livnatDataSet
  var csv = convertToCSV(jsonObject)
  var exportedFilenmae = 'appartements' + '.csv' || 'export.csv'

  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  var link = document.createElement("a")
  if (link.download !== undefined) { 
    // Browsers that support HTML5 download attribute
    var url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", exportedFilenmae)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

var updateLocalStorage = (key, obj) => {
  var oldObj = JSON.parse(localStorage.getItem('livnatDataSet'))
  var trArray = key.split('_')
  var id = trArray[trArray.length - 1]
  if (!oldObj) {
    localStorage.setItem('livnatDataSet', JSON.stringify({ [id]: obj }))
    return
  }
  oldObj[id] = obj
  localStorage.setItem('livnatDataSet', JSON.stringify(oldObj))
}

var getRowInfo = (row) => {
  indexes = { 4: 'סוג הנכס',6: 'אזור',10: 'מחיר', 12: 'חדרים', 18: 'תאריך' }
  cells = Array.from(row.cells)
  return Object.keys(indexes).reduce((allRowData, index) => { 
    allRowData[indexes[index]] = cells[index].innerText.trim()
    return allRowData
  }, {})
}

var createSquereMeterElement = (squereMeter) => {
  var tr = document.createElement('tr')
  var td = document.createElement('td')
  td.innerText = 'מחיר למ״ר:'
  tr.appendChild(td)
  var td2 = document.createElement('td')
  td2.innerText = squereMeter
  tr.appendChild(td2)
  return tr
}

var storeInLine = (row, rowDetails) => {
  var td = row.querySelector('div.ad_favorite').parentElement
  var div = document.createElement('div')
  div.innerText = JSON.stringify(rowDetails)
  div.style.display = 'none'
  div.id = 'store_line'
  td.appendChild(div)
}

var createClickHandler = function(row) { 
  return () => {
    setTimeout(() => {
      var rowDetails = getRowInfo(row)
      adInfoRow.forEach((key) => rowDetails[key] = '')
      var idName = row.id.replace('Ad', 'iframe').replace('tr', 'ad')
      var ad_iframe = document.querySelector('#' + idName)
      dataTable = ad_iframe.contentDocument.body.querySelector('.innerDetailsDataGrid')
      Array.from(dataTable.rows).forEach((dataRow) => { 
        adInfoRow.forEach((item) => {
          var re = new RegExp(item); 
          var matchItem = dataRow.innerText.match(re)
          var onlyData = dataRow.innerText.replace(re, '')
          if (matchItem) rowDetails[item] = onlyData.trim()
        })
      })
      var squereMeter = parseInt(Number(rowDetails['מחיר'].replace(/[^0-9\.-]+/g,""))/ rowDetails['גודל במ"ר:'])
      dataTable.appendChild(createSquereMeterElement(squereMeter))
      rowDetails['מחיר למ״ר'] = squereMeter
      storeInLine(row, rowDetails)
    }, 4000) 
  }
}

var addToStore = (event) => {
  // event.currentTarget.className += " ad_favorite_marked";
  tdParent = event.currentTarget.parentElement
  row = tdParent.parentElement
  var rowDetails = tdParent.querySelector('#store_line')
  if (rowDetails) updateLocalStorage(row.id, JSON.parse(rowDetails.innerText))
  // event.stopPropagation()
}

var createExportElement = () => {
  var exportLink = document.createElement('a')
  exportLink.innerText = 'export to csv'
  exportLink.addEventListener("click", exportCSVFile, false)
  document.querySelectorAll('.show_results_from')[0].appendChild(exportLink)
}

var main = () => {
  alert('Ready')
  createExportElement()
  
  var rows = document.querySelectorAll('tr.showPopupUnder')
  for (i = 0; i < rows.length; i++) {
    var currentRow = rows[i]
    currentRow.onclick = createClickHandler(currentRow)
  }

  document.querySelectorAll('div.ad_favorite').forEach((td) => {
    td.addEventListener("click", addToStore, false)
  })
}

main()