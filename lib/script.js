$( function () {

    $(".menu-item").click(function (ev) {
        $('.dropdown-toggle').dropdown('toggle')
    });

    // like python
    var get_dict = function (key, dict, def) {
        if (key in dict) {
            if (dict[key] != null && dict[key] != undefined) {
                return "" + dict[key]
            }
        }
        return def
    }

    data.sort(function (a,b) {
        return get_dict('title', a, "Untitled").localeCompare(get_dict('title', b, "Untitles"))
    });


    var rm_whitespace = function(item) {
        return item.replace(/^ */, "").replace(/ *$/, "");
    }

    var search_help = "Search examples,<br>title: a title<br>author: john peterson<br>...<br>Search is case in-sensitive."

    var BadSearchTerm = function(error) {
        this.error = error;
    }

    var get_search_terms = function (query) {

        if (query.indexOf(":") === -1 ) {
            return -1
        }

        var splitted_query = query.split(":")

        if (splitted_query.length != 2 || splitted_query[1] === "" ) {
            throw new BadSearchTerm(search_help)
        }
        key = splitted_query[0]
        term = splitted_query[1]
        return [rm_whitespace(key), rm_whitespace(term)]
    }

    var app = $.sammy("#wrap", function() {

        this.get("#/search", function (context) {

            var query = rm_whitespace(this.params['query'].toLowerCase())

            try {
                var search_terms = get_search_terms(query)
            }

            catch (e) {
                var html = e.error;
                $("#main").html(html)
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

            $("#main").html(html)

            return false;
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
            $("#search input[type='text']").val("")
            $("#main").html("")
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

