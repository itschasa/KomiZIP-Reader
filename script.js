const settings_version = 'v1'
var settings = null
var chapter_data = {
    id: null,
    page_count: null,
    pages: {},
    current: null,
    title: null,
    _x_metadata: null
}

const getChapterIDFromURL = function() {
    var url_reverse = window.location.href.split("").reverse().join("")
    var chapter_id = ""
    for (i = 0; i < url_reverse.length; i++) {
        if (new RegExp("[0-9]").test(url_reverse[i])) {
            chapter_id = url_reverse[i] + chapter_id
        } else {
            break
        }
    }
    return chapter_id
}

const handlePageClick = function(event){ 
    third_width = window.screen.width / 3
    
    // right side click
    console.log("[handlePageClick]", {"offsetX": event.pageX, third_width, "third*2": third_width * 2})
    if (event.pageX > third_width * 2) {
        if (settings.RightToLeft.enabled) {
            changePage("-")
        } else {
            changePage("+")
        }
    // left side click
    } else if (event.pageX < third_width) {
        if (settings.RightToLeft.enabled) {
            changePage("+")
        } else {
            changePage("-")
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

const changePage = function(direction) {
    if (settings.DoublePageView.enabled) {
        change = 2
    } else {
        change = 1
    }
    
    if (direction == "+") {
        if (chapter_data.page_count >= chapter_data.current + change) {
            chapter_data.current += change
        } else {
            chapter_data.current = chapter_data.page_count
        }
    } else {
        if (chapter_data.current - change > 0) {
            chapter_data.current -= change
        } else {
            chapter_data.current = 1
        }
    }
    console.log('[changePage]', {"change": change, "direction": direction})
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
            if (chapter_data.current % 2 === 0) {
                selectPage(chapter_data.current - 1).removeClass('m-hidden')
                allowed_pages.push(chapter_data.current - 1)
            } else {
                selectPage(chapter_data.current + 1).removeClass('m-hidden')
                allowed_pages.push(chapter_data.current + 1)
            }
        } else {
            if (chapter_data.current !== 1) {
                if (chapter_data.current % 2 === 0) {
                    selectPage(chapter_data.current + 1).removeClass('m-hidden')
                    allowed_pages.push(chapter_data.current + 1)
                } else {
                    selectPage(chapter_data.current - 1).removeClass('m-hidden')
                    allowed_pages.push(chapter_data.current - 1)
                }
            }
            
        }
    }

    var all_pages = $('.manga-area img');
    for (var i = 0; i < all_pages.length; i++) {
        if (!all_pages.eq(i).hasClass("m-hidden") && !allowed_pages.includes(parseInt(all_pages.eq(i).attr("page")))) {
            all_pages.eq(i).addClass("m-hidden");
        }
    }
    console.log("[updatePages] executed", {allowed_pages})
    updateProgress()
}

const saveSettings = function() {
    localStorage.setItem('view_settings', JSON.stringify(settings))
    console.log("[saveSettings]", settings)
}

const toggleSetting = function(input) {
    console.log("[toggleSetting]", input)
    
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
    
    } else if (input == "startup") {
        if (settings.RightToLeft.enabled) {
            $('.manga-area').append($('.manga-area img').get().reverse());
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
    }
    
    updatePages()
    saveSettings()
}

const updateProgress = function() {    
    var page_value = 100 / chapter_data.page_count
    var pages = $('.manga-area img:not(.m-hidden)')
    var pages_visible = []
    for (var i = 0; i < pages.length; i++) {
        pages_visible.push(parseInt(pages.eq(i).attr("page")))
    }
    
    pages_visible = pages_visible.sort((a, b) => a - b)
    if (pages_visible.length == 1) {
        $('.m-progress-bar-text').text(pages_visible[0])
        var offset_minus = 1
        var page_length = 1
    } else {
        $('.m-progress-bar-text').text(`${pages_visible[0]}-${pages_visible[1]}`)
        var offset_minus = 1.5
        var page_length = 2
    }
    
    if (pages_visible[pages_visible.length - 1] == chapter_data.page_count) {
        var percentage = 100
    } else {
        var percentage = pages_visible[pages_visible.length - 1] * page_value
    }

    var text_offset = Math.min(
        (
            ($(document).width() / chapter_data.page_count) * (pages_visible[pages_visible.length - 1] - offset_minus)
        ) + 
        (
            (($(document).width() / chapter_data.page_count) - $('.m-progress-bar-text').width()) / 2
        ),
        
        $(document).width() - $('.m-progress-bar-text').width() - 5
    )

    if (settings.RightToLeft.enabled) {
        $("#progress").width(`${percentage}%`).css('margin-left',`${100-percentage}%`)
        $('.m-progress-bar-text').css({
            'margin-left': '0%',
            'margin-right': `${text_offset}px`,
            'text-align': 'right',
            'float': 'right',
        })
        $('#highlight').css({
            'width': `${($(document).width() / chapter_data.page_count) * page_length}px`,
            'margin-left': `${($(document).width() / chapter_data.page_count) * (chapter_data.page_count - pages_visible[pages_visible.length - 1])}px`,
            'text-align': 'right',
            'float': 'right',
        })
    } else {
        $("#progress").width(`${percentage}%`).css('margin-left','0%')
        $('.m-progress-bar-text').css({
            'margin-left': `${text_offset}px`,
            'margin-right': '0%',
            'text-align': 'left',
            'float': 'left',
        })
        $('#highlight').css({
            'width': `${($(document).width() / chapter_data.page_count) * page_length}px`,
            'margin-left': `${$(document).width() - ($(document).width() / chapter_data.page_count) * (chapter_data.page_count - pages_visible[pages_visible.length - 1] + page_length)}px`,
            'text-align': 'left',
            'float': 'left',
        })
    }
    console.log("[updateProgress] executed")
}

const arrowKeyTrigger = function(e) {
    e = e || window.event;

    if (e.keyCode == '37') {
        // left arrow
        console.log("[arrowKeyTrigger] left key trigger")
        if (settings.RightToLeft.enabled) {
            changePage('+')
        } else {
            changePage('-')
        }
    }
    else if (e.keyCode == '39') {
        // right arrow
        console.log("[arrowKeyTrigger] right key trigger")
        if (settings.RightToLeft.enabled) {
            changePage('-')
        } else {
            changePage('+')
        }
    }
}

const toggleHelp = function() {
    if ($('#info-span').html() == "How to Use") {
        $('#info-span').html("Close Help")
        $('#info-div').removeClass("m-hidden")
    } else {
        $('#info-span').html("How to Use")
        $('#info-div').addClass("m-hidden")
    }
    console.log("[toggleHelp] executed")
}

const init = function() {
    feather.replace()
    $(document).keydown(arrowKeyTrigger)
    $(window).resize(updateProgress)
    $('.manga-area').on('click', handlePageClick)
    $('.arrow-left').on('click', handlePageClick)
    $('.arrow-right').on('click', handlePageClick)

    settings = localStorage.getItem('view_settings') ? JSON.parse(localStorage.getItem('view_settings')) : '';
    console.log("[init] js settings_version =", settings_version)
    console.log("[init] saved settings_version =", settings._version)

    if (settings == "" || settings._version != settings_version) {
        settings = {
            _version: settings_version,
            RightToLeft: {
                enabled: true
            },
            DoublePageView: {
                enabled: true,
                offsetPage: true
            }
        }
        console.log("[init] using default settings:", settings)
    } else {
        console.log("[init] using saved settings:", settings)
    }
    
    chapter_data.id = getChapterIDFromURL()
    
    if (chapter_data.id == undefined) {
        alert("You need to add a chapter number after the /")
        window.location.href = 'https://komi.zip/'
    }
    
    $('#chapter-span').text(`Chapter ${chapter_data.id}`)
    document.title = `Chapter ${chapter_data.id} | komi.zip`
    console.log("[init] subheading + title updated")

    axios.head(`https://cdn.komi.zip/cdn/${chapter_data.id}`)
        .then(response => {
            chapter_data._x_metadata = JSON.parse(response.headers['x-metadata'])
            chapter_data.page_count = chapter_data._x_metadata.metadata.page_count
            chapter_data.title = chapter_data._x_metadata.metadata.title
            
            if (chapter_data.title != "null" && chapter_data.title != null) {
                chapter_data.title = response.headers['x-chapter-title']
                $('#chapter-span').text(`Chapter ${chapter_data.id}:`)
                $('#title-span').text(`${chapter_data.title}`)
            }
            
            console.log("[init] chapter is valid", {"response_code": response.status, "_x_metadata": chapter_data._x_metadata, "response": response})

            for (let i = 1; i <= chapter_data.page_count; i++) {
                var imgElement = $('<img>');
                var imgID = addLeadingZero(i)
                imgElement.attr('src', `https://cdn.komi.zip/cdn/${chapter_data.id}-${imgID}.jpg`);
                imgElement.attr('class', 'manga-image m-hidden')
                imgElement.attr('page', i)
                $('.manga-area').append(imgElement);
            }
            console.log("[init] img elements inserted")

            chapter_data.current = 1
            toggleSetting("startup")
            updatePages()
            
        })
        .catch(error => {
            console.error('[init]', error.message)
            if (error.response.status == 404) {
                alert("Chapter was not found.")
                window.location.href = "https://komi.zip/"
            } else {
                alert("Failed to load chapter, view console for more info.")
            }
        });
}

init()