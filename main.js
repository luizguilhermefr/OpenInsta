/* DOM setup */

const fileinput = document.getElementById('fileinput')

// Used to show the effects of the image edit
const canvas = document.getElementById('canvas')

// Get the 2d (as opposed to "3d") drawing context on the canvas, returns CanvasRenderingContext2D
const ctx = canvas.getContext('2d')

// Editors for the image
const red = document.getElementById('red')
const green = document.getElementById('green')
const blue = document.getElementById('blue')
const brightness = document.getElementById('brightness')
const grayscale = document.getElementById('grayscale')
const contrast = document.getElementById('contrast')

// Set the listener for whenever one of the effect changes
red.onchange = runPipeline
green.onchange = runPipeline
blue.onchange = runPipeline
brightness.onchange = runPipeline
grayscale.onchange = runPipeline
contrast.onchange = runPipeline



/* Variables setup */

// Similar to document.createElement('img') except we don't need it on the document, just need it for processing?
const srcImage = new Image()

let imgData = null
let originalPixels = null
let currentPixels = null



/* DOM functions */

// When user selects a new image
fileinput.onchange = function (e) {

  // If it is valid
  if (e.target.files && e.target.files.item(0)) {

    // Set the src of the new Image() we created in javascript
    srcImage.src = URL.createObjectURL(e.target.files[0])
  }
}

srcImage.onload = function () {

  // Copy the image's dimensions to the canvas, which will show the preview of the edits
  canvas.width = srcImage.width
  canvas.height = srcImage.height

  // draw the image at with no offset (0,0) and with the same dimensions as the image
  ctx.drawImage(srcImage, 0, 0, srcImage.width, srcImage.height)

  // Get an ImageData object representing the underlying pixel data for the area of the canvas
  imgData = ctx.getImageData(0, 0, srcImage.width, srcImage.height)

  // .data gets the array of integers with 0-255 range, .slice returns a copy of the array 
  originalPixels = imgData.data.slice()
}



/* Filter functions */

// Transfers the changes we made to be displayed on the canvas
function commitChanges() {
  
  // Copy over the current pixel changes to the image
  for (let i = 0; i < imgData.data.length; i++) {
    imgData.data[i] = currentPixels[i]
  }

  // Update the 2d rendering canvas with the image we just updated so the user can see
  ctx.putImageData(imgData, 0, 0, 0, 0, srcImage.width, srcImage.height)
}

// Updates the canvas with the all of the filter changes
function runPipeline() {

  // Create a copy of the array of integers with 0-255 range 
  currentPixels = originalPixels.slice()

  // These represent the intensity of the filter, i.e. user wants it to be very red then it is a larger number
  const brightnessFilter = Number(brightness.value)
  const contrastFilter = Number(contrast.value)
  const redFilter = Number(red.value)
  const greenFilter = Number(green.value)
  const blueFilter = Number(blue.value)

  // Binary, should this be grayscaled or not?
  const grayscaleFilter = grayscale.checked

  // For every pixel of the src image
  for (let i = 0; i < srcImage.height; i++) {
    for (let j = 0; j < srcImage.width; j++) {
      
      // Do the effects

      if (grayscaleFilter) {
        setGrayscale(j, i)
      }

      addBrightness(j, i, brightnessFilter)
      addContrast(j, i, contrastFilter)

      if (!grayscaleFilter) {
        addRed(j, i, redFilter)
        addGreen(j, i, greenFilter)
        addBlue(j, i, blueFilter)
      }
    }
  }

  commitChanges()
}



/* Filter effects */

// The image is stored as a 1d array with red first, then green, and blue
const R_OFFSET = 0
const G_OFFSET = 1
const B_OFFSET = 2

function addRed(x, y, value) {
  const index = getIndex(x, y) + R_OFFSET
  const currentValue = currentPixels[index]
  currentPixels[index] = clamp(currentValue + value)
}

function addGreen(x, y, value) {
  const index = getIndex(x, y) + G_OFFSET
  const currentValue = currentPixels[index]
  currentPixels[index] = clamp(currentValue + value)
}

function addBlue(x, y, value) {
  const index = getIndex(x, y) + B_OFFSET
  const currentValue = currentPixels[index]
  currentPixels[index] = clamp(currentValue + value)
}

function addBrightness(x, y, value) {
  addRed(x, y, value)
  addGreen(x, y, value)
  addBlue(x, y, value)
}

function setGrayscale(x, y) {
  const redIndex = getIndex(x, y) + R_OFFSET
  const greenIndex = getIndex(x, y) + G_OFFSET
  const blueIndex = getIndex(x, y) + B_OFFSET

  const redValue = currentPixels[redIndex]
  const greenValue = currentPixels[greenIndex]
  const blueValue = currentPixels[blueIndex]

  const mean = (redValue + greenValue + blueValue) / 3

  currentPixels[redIndex] = clamp(mean)
  currentPixels[greenIndex] = clamp(mean)
  currentPixels[blueIndex] = clamp(mean)
}

function addContrast(x, y, value) {
  const redIndex = getIndex(x, y) + R_OFFSET
  const greenIndex = getIndex(x, y) + G_OFFSET
  const blueIndex = getIndex(x, y) + B_OFFSET

  const redValue = currentPixels[redIndex]
  const greenValue = currentPixels[greenIndex]
  const blueValue = currentPixels[blueIndex]

  // Goes from 0 to 2, where 0 to 1 is less contrast and 1 to 2 is more contrast
  const alpha = (value + 255) / 255 

  const nextRed = alpha * (redValue - 128) + 128
  const nextGreen = alpha * (greenValue - 128) + 128
  const nextBlue = alpha * (blueValue - 128) + 128

  currentPixels[redIndex] = clamp(nextRed)
  currentPixels[greenIndex] = clamp(nextGreen)
  currentPixels[blueIndex] = clamp(nextBlue)
}

/* Filter effects - helpers */

// Given the x, y index, return what position it should be in a 1d array
function getIndex(x, y) {
  return (x + y * srcImage.width) * 4
}

// Ensure value remain in RGB, 0 - 255
function clamp(value) {
  return Math.max(0, Math.min(Math.floor(value), 255))
}