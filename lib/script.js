$( function () {

    var get_dict = function (key, dict, def) {
        if (key in dict) {
            if (dict[key] != null && dict[key] != undefined) {
                return dict[key]
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
        var splitted_query = query.split(":")
        if (splitted_query.length != 2 || splitted_query[1] === "" ) {
            throw new BadSearchTerm(search_help)
        }
        key = splitted_query[0]
        term = splitted_query[1]
        return [rm_whitespace(key), rm_whitespace(term)]
    }

    var app = $.sammy("#wrapper", function() {

        this.get("#/search", function (context) {
            try {
                search_terms = get_search_terms(this.params['query'])
            }
            catch (e) {
                var html = e.error;
                $("#main").html(html)
                return false;
            }
            var key = search_terms[0]
            var query = search_terms[1]
            var results = []
            var re = new RegExp(query, "i")
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

                if (value.search(re) != -1) {
                    results.push(i)
                }
            }
            var html = "<ol>"
            for (var i =0; i < results.length; i++) {
                html +=  "<li><a href='#/" + data[results[i]]['name'] + "'>" + 
                    get_dict('title', data[results[i]], "Untitled") +
                    "</a></li>"
            }
            html += "</o>"
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
            html += "</o>"

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
            /*Re-run Syntax Highlighters*/
            /*$('pre code').each(function(i, e) {hljs.highlightBlock(e)});*/
        });

        this.get("", function (context) {
            $("#search input[type='text']").val("")
            $("#main").html("")
            return;
        });

    });

    app.run()
});
