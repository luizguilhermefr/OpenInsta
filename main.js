const fileinput = document.getElementById('fileinput')

const canvas = document.getElementById('canvas')

const ctx = canvas.getContext('2d')

const red = document.getElementById('red')
const green = document.getElementById('green')
const blue = document.getElementById('blue')

const srcImage = new Image

let imgData = null

let sourcePixels = null

const R_OFFSET = 0
const G_OFFSET = 1
const B_OFFSET = 2

function getIndex(x, y) {
  return (x + y * srcImage.width) * 4
}

function clamp(value) {
  return Math.max(0, Math.min(Math.floor(value), 255))
}

function addRed(x, y, value) {
  const index = getIndex(x, y) + R_OFFSET
  const currentValue = sourcePixels[index]
  imgData.data[index] = clamp(currentValue + value)
}

function addGreen(x, y, value) {
  const index = getIndex(x, y) + G_OFFSET
  const currentValue = sourcePixels[index]
  imgData.data[index] = clamp(currentValue + value)
}

function addBlue(x, y, value) {
  const index = getIndex(x, y) + B_OFFSET
  const currentValue = sourcePixels[index]
  imgData.data[index] = clamp(currentValue + value)
}

function rerender() {
  ctx.putImageData(imgData, 0, 0, 0, 0, srcImage.width, srcImage.height)
}

function applyFilter(filter) {
  for (let i = 0; i < srcImage.height; i++) {
    for (let j = 0; j < srcImage.width; j++) {
      filter(j, i)
    }
  }

  rerender()
}

fileinput.onchange = function (e) {
  if (e.target.files && e.target.files.item(0)) {
    srcImage.src = URL.createObjectURL(e.target.files[0])
  }
}

srcImage.onload = function () {
  canvas.width = srcImage.width
  canvas.height = srcImage.height
  ctx.drawImage(srcImage, 0, 0, srcImage.width, srcImage.height)
  imgData = ctx.getImageData(0, 0, srcImage.width, srcImage.height)
  sourcePixels = imgData.data.slice()
}

red.onchange = function (e) {
  applyFilter(function (x, y) {
    addRed(x, y, Number(e.target.value))
  })
}

green.onchange = function (e) {
  applyFilter(function (x, y) {
    addGreen(x, y, Number(e.target.value))
  })
}

blue.onchange = function (e) {
  applyFilter(function (x, y) {
    addBlue(x, y, Number(e.target.value))
  })
}
