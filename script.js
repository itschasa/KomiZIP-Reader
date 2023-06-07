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
            if (event.target.classList.contains('m-right')) {
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

const loadImageCount = function() {
    axios.head(`https://cdn.komi.zip/cdn/${chapter_data.id}-01.jpg`)
    .then(response => {
        chapter_data.page_count = parseInt(response.headers['x-page-count']);
    })
    .catch(error => {
        console.error('Error occurred during the request:', error);
    });
}



var mangaImages = document.getElementsByClassName("manga-image");
for (var i = 0; i < mangaImages.length; i++) {
  mangaImages[i].addEventListener("click", handlePageClick);
}

loadImageCount()