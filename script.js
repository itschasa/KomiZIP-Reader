var settings = {
    LeftToRight: {
        enabled: true
    },
    DoublePageView: {
        enabled: false,
        offsetPage: false,
        current: false // if on first page and offsetPage is enabled, then true
    }
}

var chapter_data = {
    id: window.location.href.split('?')[1],
    page_count: null,
    pages: {}
}

const changePage = function(direction) {
    console.log(direction)
    // direction: "+", "-"
}

const handlePageClick = function(event){
    if (!event.target.classList.contains('m-hidden')) {
        
        quarter_width = event.target.clientWidth / 4
        
        if (settings.DoublePageView.current) {
            if (!isImageOnLeft(event.target.classList['page'])) {
                if (event.offsetX > quarter_width * 3) {
                    if (settings.LeftToRight) {
                        changePage("-")
                    } else {
                        changePage("+")
                    }
                }
            } else {
                if (event.offsetX < quarter_width) {
                    if (settings.LeftToRight) {
                        changePage("+")
                    } else {
                        changePage("-")
                    }
                }
            }
        } else {
            if (event.offsetX < quarter_width) {
                if (settings.LeftToRight) {
                    changePage("-")
                } else {
                    changePage("+")
                }
            } else if (event.offsetX > quarter_width * 3) {
                if (settings.LeftToRight) {
                    changePage("+")
                } else {
                    changePage("-")
                }
            }
        }

        // console.log(`(x:${event.offsetX}/${event.target.clientWidth}, y:${event.offsetY}/${event.target.clientHeight})`)

    }
}

const addLeadingZero = function(number) {
    if (number < 10) {
        return "0" + number.toString();
    } else {
        return number.toString();
    }
}

const reverseImageOrder = function() {
    $('.manga-area').append($('.manga-area img').get().reverse());
}

function isImageOnLeft(pagenum) {
    const imgElements = $('.manga-area img:not(.m-hidden)');
    return imgElements.index(`[page="${pagenum}"]`) == 0
}

const init = function() {
    axios.head(`https://cdn.komi.zip/cdn/${chapter_data.id}-01.jpg`)
        .then(response => {
            chapter_data.page_count = parseInt(response.headers['x-page-count']);
            
            for (let i = 1; i <= chapter_data.page_count; i++) {
                var imgElement = $('<img>');
                var imgID = addLeadingZero(i)
                imgElement.attr('src', `https://cdn.komi.zip/cdn/${chapter_data.id}-${imgID}.jpg`);
                imgElement.attr('class', 'manga-image m-hidden')
                imgElement.on('click', handlePageClick)
                imgElement.attr('page', i)
                $('.manga-area').append(imgElement);
            }
            
        })
        .catch(error => {
            console.error('Error occurred during the request:', error);
        });
}

init()