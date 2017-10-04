/* eslint-env jquery */
var animals = ['frog', 'dog', 'hawk']
var images = {}
var offset = 0
var animalIndex = false

var localAnimals = window.localStorage.getItem('animals')
if (localAnimals) { animals = JSON.parse(localAnimals) }
window.localStorage.setItem('animals', JSON.stringify(animals))

renderButtons(animals)

// dynamic button list/render
$(document.body).on('keyup', '#animal-text', function buttonOnEnterKey (event) {
  if (event.keyCode === 13) { $('#add-button').trigger('click') }
})
$('#add-button').on('click', function (event) {
  var inputElement = $('#animal-text')
  var inputString = $(inputElement).val().trim().toLowerCase()
  inputElement.val('')
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
  var heldImages = images[animals[thisIndex]]
  if (event.ctrlKey) {
    console.log('deleting..', heldImages)
    delete images[animals[thisIndex]] //remove all held image data
    if (animalIndex === thisIndex) { 
      $('#animal-name').empty() //empty container if deleting current page
      columns.container.empty()
    }
    animals.splice(thisIndex, 1)
    if (animals.length) {
      window.localStorage.setItem('animals', JSON.stringify(animals))
    } else { window.localStorage.clear() }
    renderButtons(animals)
    return
  }
  if (animalIndex !== thisIndex) {
    offset = heldImages.length || 0
    animalIndex = thisIndex
    columns.container.empty()
    columns.initColumns()
    $('#animal-name').text(animals[animalIndex])
    if (offset) {
      heldImages.forEach(function (i) { 
        newGifThumbnail(i).appendTo(columns.getShortest())
      })
    }
  }
  offset += 12
  requestNewGifs(this.textContent, 12, offset)
    .done(resp => {
      var gifs = resp.data
      gifs.forEach(i => {
        heldImages.push(i)
        newGifThumbnail(i).prependTo(columns.getShortest())
      })
    })
})

$(window).on('resize', function reRenderImages (event) {
  console.log(columns.maxColumns !== columns.getMaxColumns())
  if (columns.maxColumns !== columns.getMaxColumns()) {
    let heldImages = images[animals[animalIndex]]
    columns.container.empty()
    columns.initColumns()
    if (heldImages.length) {
      heldImages.forEach(i => {
        newGifThumbnail(i).appendTo(columns.getShortest())
      })
    }
  } 
})

// infinite scroll
$(document).on('scroll', function addGifsToContainer (event) {
  var container = $('<div class="responsive-columns">')
  if ($(this).scrollTop() + $(window).height() === $(this).height()) {
    offset += 4
    requestNewGifs(animals[animalIndex], 4, offset)
      .done(resp => {
        var gifs = resp.data
        if (gifs.length) {
          gifs.forEach(i => {
            images[animals[animalIndex]].push(i)
            newGifThumbnail(i).appendTo(columns.getShortest())
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
    if (!images[btnName]) { images[btnName] = []} // initalize image array for button
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

var columns = {
  container: $('#animal-pictures'),
  colWidth: 406,

  getMaxColumns: function getMaxColumns () {
    return Math.floor(this.container[0].parentElement.clientWidth / this.colWidth)
  },

  initColumns: function initializeColumns () {
    this.maxColumns = this.getMaxColumns()
    console.log(this.maxColumns)
    for (var i = 0; i < this.maxColumns; i++) {
      $('<div class="responsive-columns">')
        .appendTo(this.container)
    }
    this.container.width(this.maxColumns * this.colWidth)
    this.columns = this.container.children('.responsive-columns')
    return this
  },

  getShortest: function getShortestColumn () {
    var arr = Array.from(this.columns)
    return arr.reduce(function (acc, item) {
      if (acc.clientHeight <= item.clientHeight) {
        return acc
      } else return item
    })
  }
}
