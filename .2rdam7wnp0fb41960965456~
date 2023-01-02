// variables
var loadedJSON

// export budget
function exportJSON() {
  var blob = new Blob([JSON.stringify(budjutOBJ)], {type: "application/json;charset=utf-8"});
  saveAs(blob, renderDate(str) + "_Budjut.json");
}

// load file
function loadJSON() {
  // detect version
  if (parseFloat(loadedJSON.version) <= 0.1) {
    swal({
      title: 'Warning!',
      text: "This project is using a version of Budjut that's no longer supported.",
      type: 'warning',
    })
  } else 
  if (parseFloat(budjutOBJ.version) > parseFloat(loadedJSON.version)) {
    swal({
      title: 'Warning!',
      text: "This project is using an older version of Budjut. Some features may not work!",
      type: 'warning',
    })
  }

  // apply loaded js object project to current js object project
  budjutOBJ = loadedJSON
  updateBudget()
  updateCharts()

  alertify.success('File loaded successfully!');
}

// load file via input[type=file]
openfile.addEventListener("change", function(e) {
  console.log(openfile.files[0])
  var reader = new FileReader()
  reader.readAsText(openfile.files[0])
  reader.onload = function() {
    loadedJSON = JSON.parse(reader.result)
    loadJSON()
  }
}, false)

// load json file on drop
document.addEventListener("dragover", function(e) {
  e.preventDefault()
})
document.addEventListener("drop", function(e) {
	e.preventDefault()
	var reader = new FileReader()
	reader.onload = function(e) {
    loadedJSON = JSON.parse(reader.result)
    loadJSON()
	}
	reader.readAsText(e.dataTransfer.files[0])
})