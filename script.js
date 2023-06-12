const settings_version = 'v1'

var settings = localStorage.getItem('view_settings') ? JSON.parse(localStorage.getItem('view_settings')) : '';
if (settings == "" || settings._version != settings_version) {
    var settings = {
        _version: settings_version,
        RightToLeft: {
            enabled: false
        },
        DoublePageView: {
            enabled: false,
            offsetPage: false
        }
    }
}

var chapter_data = {
    id: window.location.href.split('?')[1],
    page_count: null,
    pages: {},
    current: null
}

const handlePageClick = function(event){
    if (!event.target.classList.contains('m-hidden')) {
        
        quarter_width = event.target.clientWidth / 4
        
        if (settings.DoublePageView.current) {
            if (!isImageOnLeft(event.target.classList['page'])) {
                if (event.offsetX > quarter_width * 3) {
                    if (settings.RightToLeft.enabled) {
                        changePage("+")
                    } else {
                        changePage("-")
                    }
                }
            } else {
                if (event.offsetX < quarter_width) {
                    if (settings.RightToLeft.enabled) {
                        changePage("-")
                    } else {
                        changePage("+")
                    }
                }
            }
        } else {
            if (event.offsetX < quarter_width) {
                if (settings.RightToLeft.enabled) {
                    changePage("+")
                } else {
                    changePage("-")
                }
            } else if (event.offsetX > quarter_width * 3) {
                if (settings.RightToLeft.enabled) {
                    changePage("-")
                } else {
                    changePage("+")
                }
            }
        }
    }
}

const addLeadingZero = function(number) {
    if (number < 10) {
        return "0" + number.toString();
    } else {
        return number.toString();
    }
}

const isImageOnLeft = function(pagenum) {
    const imgElements = $('.manga-area img:not(.m-hidden)');
    return imgElements.index(`[page="${pagenum}"]`) == 0
}

const changePage = function(direction) {
    if (settings.DoublePageView.enabled) {
        if (settings.DoublePageView.offsetPage && chapter_data.current == 1) {
            change = 1
        } else {
            change = 2
        }
    } else {
        change = 1
    }
    
    if (direction == "+") {
        if (chapter_data.page_count >= chapter_data.current + change) {
            chapter_data.current += change
        }
    } else {
        if (chapter_data.current - change > 0) {
            chapter_data.current -= change
        } else {
            chapter_data.current = 1
        }
    }
    console.log(direction, change, chapter_data.current)
    updatePages()
}

const selectPage = function(page) {
    return $('.manga-area img[page="' + page.toString() + '"]');
}

const updatePages = function() {
    var allowed_pages = []

    selectPage(chapter_data.current).removeClass('m-hidden')
    allowed_pages.push(chapter_data.current)
    
    if (settings.DoublePageView.enabled) {
        if (!settings.DoublePageView.offsetPage) {
            selectPage(chapter_data.current + 1).removeClass('m-hidden')
            allowed_pages.push(chapter_data.current + 1)
        } else if (chapter_data.current != 1) {
            selectPage(chapter_data.current + 1).removeClass('m-hidden')
            allowed_pages.push(chapter_data.current + 1)
        }
    }


    var all_pages = $('.manga-area img');
    for (var i = 0; i < all_pages.length; i++) {
        if (!all_pages.eq(i).hasClass("m-hidden") && !allowed_pages.includes(parseInt(all_pages.eq(i).attr("page")))) {
            all_pages.eq(i).addClass("m-hidden");
        }
    }
}

const toggleSetting = function(input) {
    if (input == 'rtl') {
        $('.manga-area').append($('.manga-area img').get().reverse());
        
        if (settings.RightToLeft.enabled) {
            settings.RightToLeft.enabled = false
            $('div[setting="rtl"]').addClass("setting-disabled").removeClass("setting-enabled")
        } else {
            settings.RightToLeft.enabled = true
            $('div[setting="rtl"]').addClass("setting-enabled").removeClass("setting-disabled")
        }
    
    } else if (input == "dp") {
        if (settings.DoublePageView.enabled) {
            settings.DoublePageView.enabled = false
            $('div[setting="dp"]').addClass("setting-disabled").removeClass("setting-enabled")
            $('div[setting="op"]').addClass("setting-notallowed").removeClass("setting-disabled").removeClass("setting-enabled")
        } else {
            settings.DoublePageView.enabled = true
            $('div[setting="dp"]').addClass("setting-enabled").removeClass("setting-disabled")
            if (settings.DoublePageView.offsetPage) {
                $('div[setting="op"]').addClass("setting-enabled").removeClass("setting-disabled").removeClass("setting-notallowed")
            } else {
                $('div[setting="op"]').addClass("setting-disabled").removeClass("setting-enabled").removeClass("setting-notallowed")
            }
        }
    
    } else if (input == "op" && settings.DoublePageView.enabled) {
        if (settings.DoublePageView.offsetPage) {
            settings.DoublePageView.offsetPage = false
            $('div[setting="op"]').addClass("setting-disabled").removeClass("setting-enabled").removeClass("setting-notallowed")
        } else {
            settings.DoublePageView.offsetPage = true
            $('div[setting="op"]').addClass("setting-enabled").removeClass("setting-disabled").removeClass("setting-notallowed")
        }
    
    } else if (input == "forceUpdate") {
        if (settings.RightToLeft.enabled) {
            $('div[setting="rtl"]').addClass("setting-enabled").removeClass("setting-disabled")
        } else {
            $('div[setting="rtl"]').addClass("setting-disabled").removeClass("setting-enabled")
        }

        if (settings.DoublePageView.enabled) {
            $('div[setting="dp"]').addClass("setting-enabled").removeClass("setting-disabled")
            if (settings.DoublePageView.offsetPage) {
                $('div[setting="op"]').addClass("setting-enabled").removeClass("setting-disabled").removeClass("setting-notallowed")
            } else {
                $('div[setting="op"]').addClass("setting-disabled").removeClass("setting-enabled").removeClass("setting-notallowed")
            }
        } else {
            $('div[setting="dp"]').addClass("setting-disabled").removeClass("setting-enabled")
            $('div[setting="op"]').addClass("setting-notallowed").removeClass("setting-disabled").removeClass("setting-enabled")
        }

        if (settings.DoublePageView.offsetPage) {
            $('div[setting="op"]').addClass("setting-enabled").removeClass("setting-disabled").removeClass("setting-notallowed")
        } else {
            $('div[setting="op"]').addClass("setting-disabled").removeClass("setting-enabled").removeClass("setting-notallowed")
        }
    }
    
    updatePages()
    localStorage.setItem('view_settings', JSON.stringify(settings))
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

            chapter_data.current = 1
            toggleSetting("forceUpdate")
            updatePages()
            
        })
        .catch(error => {
            console.error('Error occurred during the request:', error);
        });
}

init()