/* eslint-env jquery */
var animals = ['frog', 'dog', 'hawk']
var offset = 0
var animalIndex = false

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
$(document.body).on('click', '.animal-button', function getNewGifsOrRemoveButton (event) {
  var thisIndex = animals.indexOf(this.textContent)
  var container = $('<div class="responsive-columns">')
  // $('#animal-pictures')
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
    $('#animal-pictures').empty()
    $('#animal-name').text(animals[animalIndex])
  }
  requestNewGifs(this.textContent, 8, offset)
    .done(resp => {
      var gifs = resp.data
      gifs.forEach(i => {
        newGifThumbnail(i).prependTo(container)
      })
      container.prependTo($('#animal-pictures'))
    })
  offset = offset + 12
})

// infinite scroll
$(document).on('scroll', function addGifsToContainer (event) {
  var container = $('<div class="responsive-columns">')
  if ($(this).scrollTop() + $(window).height() === $(this).height()) {
    offset = offset + 12
    requestNewGifs(animals[animalIndex], 12, offset)
      .done(resp => {
        var gifs = resp.data
        if (gifs.length) {
          gifs.forEach(i => {
            newGifThumbnail(i).appendTo(container)
          })
          container.appendTo($('#animal-pictures'))
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

  var container = $('<div>')
    .addClass('animal-thumbnail')
  var link = $('<a>')
    .attr('class', 'thumbnail')
  var img = $('<img>')
    .addClass('still')
    .addClass('animal-picture')
    .addClass('img-responsive')
    .attr('width', width)
    .attr('height', height)
    .attr('data-still', still)
    .attr('data-animated', animated)
    .attr('src', still)
  var caption = $('<div>')
    .addClass('caption')
    .append($('<h4>').html(`Rating: <small>${rating.toUpperCase()}</small>`))
  link.append(img)
  link.append(caption)
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
