/* eslint-env jquery */
var animals = ['frog', 'dog', 'hawk']
var offset = 0
var animalIndex = 0

var localAnimals = window.localStorage.getItem('animals')
if (localAnimals) { animals = JSON.parse(localAnimals) }
window.localStorage.setItem('animals', animals)

renderButtons(animals)
$('#animal-pictures').empty()

// dynamic button list/render
$(document.body).on('keyup', '#animal-text', function (event) {
  if (event.keyCode === 13) { $('#add-button').trigger('click') }
})
$('#add-button').on('click', function (event) {
  var inputElement = $('#animal-text')
  var inputString = $(inputElement).val().trim().toLowerCase()
  $(inputElement).val('')
  if (inputString) {
    animals.push(inputString)
    window.localStorage.setItem('animals', JSON.stringify(animals))
    renderButtons(animals)
  }
})

// make ajax call for tag
// if not current animal, clear and render new, else prepend
// if ctrlKey down, remove button
$(document.body).on('click', '.animal-button', function (event) {
  var thisIndex = animals.indexOf(this.textContent)
  var container = $('#animal-pictures')
  if (event.ctrlKey) {
    animals.splice(thisIndex, 1)
    if (animals.length) {
      window.localStorage.setItem('animals', JSON.stringify(animals))
    } else { window.localStorage.clear() }
    renderButtons(animals)
    return
  }
  if (animalIndex !== thisIndex) {
    offset = 0
    animalIndex = thisIndex
    container.empty()
    $('#animal-name').text(animals[animalIndex])
  }
  requestNewGifs(this.textContent, 10, 10 * offset)
    .done(resp => {
      var gifs = resp.data
      gifs.forEach(i => {
        newGifThumbnail(i).prependTo(container)
      })
    })
  offset++
})

$(document.body).on('click', '.animal-thumbnail .thumbnail img', function (event) {
  togglePlay(this)
})

function newAnimalButton (name) {
  return $('<button>')
    .addClass('btn btn-default')
    .addClass('animal-button')
    .attr('data-name', name)
    .text(name)
}

function renderButtons (buttons) {
  var container = $('.buttons').empty()
  buttons.forEach(function (btnName) {
    container.append(newAnimalButton(btnName))
  })
}

// load new gifs/display gifs
function requestNewGifs (tag, limit = 10, offset = 0) {
  var query = `?api_key=anuSbPHllXnvdZgrWhEewXY2xTXhnRYY&q=${tag}&limit=${limit}&offset=${offset}&lang=en`
  return $.ajax({
    url: 'https://api.giphy.com/v1/gifs/search' + query,
    method: 'GET'
  })
}

function newGifThumbnail (obj) {
  var still = obj.images.fixed_height_still.url
  var animated = obj.images.fixed_height.url
  var width = obj.images.fixed_height.width
  var height = obj.images.fixed_height.height
  var rating = obj.rating

  var container = $('<div>')
    .addClass('col-xs-12 col-sm-6 col-md-4 col-lg-3')
    .addClass('animal-thumbnail')
  var link = $('<a>')
    .attr('class', 'thumbnail')
  var img = $('<img>')
    .attr('src', still)
    .addClass('still')
    .addClass('animal-picture')
    .attr('width', width)
    .attr('height', height)
    .attr('data-still', still)
    .attr('data-animated', animated)
  link.append(img)
  container.append(link)
  container.append($('<span>').text(`Rating: ${rating}`))
  return container
}

function togglePlay (imgElem) {
  var swap
  if ($(imgElem).hasClass('still')) {
    swap = $(imgElem).attr('data-animated')
    $(imgElem)
      .removeClass('still')
      .attr('src', swap)
  } else {
    swap = $(imgElem).attr('data-still')
    $(imgElem)
      .addClass('still')
      .attr('src', swap)
  }
}
