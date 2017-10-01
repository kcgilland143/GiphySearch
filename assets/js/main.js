/* eslint-env jquery */
var animals = ['frog', 'dog', 'hawk']
var offset = 0
var animalIndex = 0

var localAnimals = window.localStorage.getItem('animals')
if (localAnimals) { animals = JSON.parse(localAnimals) }
window.localStorage.setItem('animals', JSON.stringify(animals))

renderButtons(animals)
$('#animal-pictures').empty()

// dynamic button list/render
$(document.body).on('keyup', '#animal-text', function buttonOnEnterKey (event) {
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
  requestNewGifs(this.textContent, 10, offset)
    .done(resp => {
      var gifs = resp.data
      offset = offset + 10
      gifs.forEach(i => {
        newGifThumbnail(i).prependTo(container)
      })
    })
})

// infinite scroll
$(document).on('scroll', function addGifsToContainer (event) {
  var container = $('#animal-pictures')
  if ($(this).scrollTop() + $(window).height() === $(this).height()) {
    requestNewGifs(animals[animalIndex], 4, offset)
      .done(resp => {
        var gifs = resp.data
        if (gifs.length) {
          offset = offset + 4
          gifs.forEach(i => {
            newGifThumbnail(i).appendTo(container)
          })
        } else {
          console.log('no more gifs :(')
        }
      })
  }
})

$(document.body).on('click', '.animal-picture', function (event) {
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
  var still = obj.images.original_still.url
  var animated = obj.images.original.url
  var width = obj.images.original.width
  var height = obj.images.original.height
  var rating = obj.rating
  console.log(obj)

  var container = $('<div>')
    .addClass('col-xs-12 col-sm-6 col-md-4 col-lg-3')
    .addClass('pull-left')
    .addClass('animal-thumbnail')
  var link = $('<a>')
    .attr('class', 'thumbnail')
  var img = $('<img>')
    .attr('src', still)
    .addClass('still')
    .addClass('animal-picture')
    .addClass('img-responsive')
    .attr('width', width)
    .attr('height', height)
    .attr('data-still', still)
    .attr('data-animated', animated)
  link.append(img)
  link.append($('<span>').text(`Rating: ${rating}`))
  container.append(link)
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
