$( function () {


    $('.nav li a').on('click', function() {
        $(this).parent().parent().find('.active').removeClass('active');
        $(this).parent().addClass('active');
    });

    // like python
    var get_dict = function (key, dict, def) {
        if (key in dict) {
            if (dict[key] != null && dict[key] != undefined) {
                return dict[key]
            }
        }
        return def
    }

    data.sort(function (a,b) {
        return get_dict('title', a, "Untitled").localeCompare(get_dict('title', b, "Untitled"))
    });

    var titles = _.map(data, function (e) {
            var title = get_dict('title', e, "Untitled")
            return title
    })

    var authors = _.map(data, function (e) {
        var title = get_dict('author', e, "Unknown")
        return title
    })

    authors = _.uniq(authors)

    /*
    var all_tags = _.map(data, function (e) {
        var tags = get_dict('tags', e, [])
        return all_tags
    })

    all_tags = _.flatten(all_tags)
    all_tags = _.uniq(all_tags)
    console.log(all_tags)
    */


    var rm_whitespace = function(item) {
        return item.replace(/^ */, "").replace(/ *$/, "");
    }

    var search_help = "Search examples,<br>title: a title<br>author: john peterson<br>...<br>Search is case in-sensitive."

    function get_search_terms(query) {
        if (query.indexOf(":") === -1 ) {
            return -1
        }

        var splitted_query = query.split(":")

        if (splitted_query.length != 2 || splitted_query[1] === "" ) {
            throw Error(search_help)
        }
        key = splitted_query[0]
        term = splitted_query[1]
        return [rm_whitespace(key), rm_whitespace(term)]
    }

    function render_search() {

        for (var i =0; i < data.length; i++) {
            if (data[i]['name'] === "main") {
                break;
            }
        }

        $("#main").html(data[i]['html'])
        $("#query").width($("#home-search").innerWidth())

        $('#query').typeahead([{
            name: "titles",
            limit: 5,
            local: titles
        },{
            name: "authors",
            limit: 5,
            local: authors
        }]).bind("typeahead:selected", function () {
            $("#home-search").submit()
        })

        $(".tt-dropdown-menu").width($("#query").outerWidth())
        $(".tt-hint").width($("#query").width())

    }

    var app = $.sammy("#wrap", function() {

        this.get("#/editor", function (context) {
            for (var i =0; i < data.length; i++) {
                if (data[i]['name'] === "editor") {
                    break;
                }
            }

            $("#main").html(data[i]['html'])

            login()
            editor_load()
            bind_typeahead()
        });

        this.get("#/search", function (context) {

            render_search()
            $("#stats").remove()

           var query = rm_whitespace(this.params['query'].toLowerCase())

            try {
                var search_terms = get_search_terms(query)
            }

            catch (e) {
                var html = e.message;
                $("#search-results").remove()
                $("#main").append("<div id='search-results'>" + html + "</div>")
                return false;
            }

            var results = []

            if (search_terms === -1) {
                for (var i =0; i < data.length; i++) {
                    var title = get_dict("title", data[i], 'Untitled')
                    var author = get_dict("author", data[i], 'Unknown')
                    if (title.toLowerCase().indexOf(query) !== -1
                        || author.toLowerCase().indexOf(query) !== -1) {
                        results.push(i)
                    }
                }
            }

            else {
                var key = search_terms[0].toLowerCase()
                var query = search_terms[1].toLowerCase()

                if (key === "tag") {
                    for (var i =0; i < data.length; i++) {
                        var tags = get_dict("tags", data[i], [])
                        if (tags.indexOf(query) !== -1)
                            results.push(i)
                    }
                }

                else if (key === "gender") {
                    for (var i =0; i < data.length; i++) {
                        var value = get_dict(key, data[i], 'None')
                        if (value === query) {
                            results.push(i)
                        }
                    }
                }

                else {
                    for (var i =0; i < data.length; i++) {
                        if (key === "title") {
                            var value = get_dict(key, data[i], 'Untitled')
                        }
                        else if (key === "author") {
                            var value = get_dict(key, data[i], 'Unknown')
                        }
                        else {
                            var value = get_dict(key, data[i], '-1')
                        }

                        if (value.toLowerCase().indexOf(query) != -1) {
                            results.push(i)
                        }
                    }
                }
            }

            if (results.length === 0) {
                var html = "No Results"
            }

            else {
                var html = "<ol>"
                for (var i =0; i < results.length; i++) {
                    html +=  "<li><a href='#/" + data[results[i]]['name'] + "'>" +
                        get_dict('title', data[results[i]], "Untitled") +
                        "</a></li>"
                }
                html += "</ol>"
            }

            $("#search-results").remove()
            $("#main").append("<div id='search-results'>" + html + "</div>")

        });

        this.get("#/all" , function (context) {
            var html = "<ol>"
            for (var i =0; i < data.length; i++) {
                html +=  "<li><a href='#/" + data[i]['name'] + "'>" +
                    get_dict('title', data[i], "Untitled") +
                    "</a></li>"
            }
            html += "</ol>"

            $("#main").html(html)
        });


        this.get('#/(.*)', function (context) {
            var dhash = document.location.hash;
            post_name = dhash.substring(2);
            for (var i =0; i < data.length; i++) {
                if (data[i]['name'] === post_name) {
                    break;
                }
            }

            $("#main").html(data[i]['html'])
        });

        this.get("", function (context) {
            render_search()
            $("#search input[type='text']").val("")
            return;
        });

        this.after( function () {
            $("#show-meta").click(function (ev) {
                if ($("#meta").hasClass("hide")) {
                    $("#show-meta").html("Hide")
                    $("#meta").removeClass("hide");
                    $("#meta").addClass("show");
                }
                else {
                    $("#show-meta").html("Show metadata")
                    $("#meta").removeClass("show");
                    $("#meta").addClass("hide");
                }
            });

            $("#show-tags").click(function (ev) {
                if ($("#tags").hasClass("hide")) {
                    $("#show-tags").html("Hide")
                    $("#tags").removeClass("hide");
                    $("#tags").addClass("show");
                }
                else {
                    $("#show-tags").html("Show tags")
                    $("#tags").removeClass("show");
                    $("#tags").addClass("hide");
                }
            });
        });

    });

    app.run()
});


