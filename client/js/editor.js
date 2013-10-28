var DEBUG = 1
$.ajaxSetup({ cache: false })

function log(msg, type) {
    type = typeof a !== 'undefined' ? a : "info"
    if (DEBUG) console.log(type + ":\n" + JSON.stringify(msg, undefined, 2))
}

var default_text = "---\n\
title: \n\
author: \n\
curator: \n\
country: \n\
year: \n\
book: \n\
gender: \n\
tags: \n\
-  \n\
-  \n\
-  \n\
-  \n\
-  \n\
---\n\n";

function set_error_status (m) {
    $("#status").removeClass("label-info")
    if (!$("#status").hasClass("label-warning")) 
        $("#status").addClass("label-warning")
    $("#status").html(m)
}

function set_status (m) {
    $("#status").removeClass("label-warning")
    if (!$("#status").hasClass("label-info"))
        $("#status").addClass("label-info")
    $("#status").html(m)
}


function edit_new_file () {
    set_status("new file")
    $("#editing-area").val(default_text)
    window.CURRENT_PATH = ""
    $("#preview").html("")
}

function preview (e) {
    var text = $("#editing-area").val()
    var text_parts = get_text_parts(text)
    log(text_parts[0])
    var yaml_ds

    try {
        yaml_ds = get_yaml_ds(text_parts[0])
        set_status("editing")
    }
    catch (e) {
        set_error_status(e.message)
        $("#preview").html("")
        return
    }

    $("#preview").html(text_parts[1])
}


function get_yaml_ds(text) {
    var yaml_ds

    try {
        yaml_ds = YAML.parse(text)
        if (yaml_ds.author && yaml_ds.author.length >= 1 && yaml_ds.title && yaml_ds.title.length >= 1) {
            log(yaml_ds)
        }
        else {
            throw new Error("title and author should be present")
        }
    }
    catch (e) {
        throw e
    }

    return yaml_ds
}

function get_path(yaml_ds) {
    if (window.CURRENT_PATH) {
        return window.CURRENT_PATH
    }

    var author = yaml_ds.author || ""
    var title = yaml_ds.title || ""

    var path = clean_name(author) + "-" + clean_name(title).split("-").slice(0,3).join("-") + ".txt"
    return path

}

function get_text_parts(text) {
    var text_parts = text.split(/\n---\n/)
    text_parts[0] = text_parts[0] + "\n---\n"
    return text_parts
}

function clean_name (name) {
    var clean_name = name
    if (name.search(/['", ]/)) {
        clean_name = name.replace(/['",]/g, "-")
                         .replace(/[\s+]/g, "-")
                         .replace(/-+/g, "-")
    }

    return clean_name
}

function get_file (e, datum) {
    var path = datum.name
    set_status("loading " + path)
    log(path)
    window.REPO.read('master', path, function(err, data) {
        $("#editing-area").val(data)
        set_status("selected" + path)
        window.CURRENT_PATH = path
        preview()
    })
    $('.tt-dropdown-menu').trigger('blur');
}

function bind_typeahead() {

    if (window.USER) {
        if (!window.ALL_PATHS) { //cache
            window.ALL_PATHS = _.map(window.LAST_COMMIT, function (e) {
                var value = e.path
                var name = e.path.replace(/\..+$/, "").replace(/-/g, " ")
                return { "value": name, "name": value }
            })
        }

        var search_template = Mustache.compile("<p data-val='{{name}}'>{{value}}</p>")

        $("#editor-search").width($("#editor-search-box").width())

        $('#editor-search').typeahead({
            name: "file-names",
            limit: 10,
            template: search_template,
            local: window.ALL_PATHS
        }).bind("typeahead:selected", get_file)

        $(".tt-dropdown-menu").width($("#editor-search").outerWidth())
        $(".tt-hint").width($("#editor-search").width())

        edit_new_file()
    }
}

function login() {
    if (window.AUTH) {
        window.AUTH.logout()
        window.CURRENT_PATH = ""
    }
    window.FBREF = new Firebase("https://tesjure.firebaseio.com")
    window.LOGGED_IN = false
    window.AUTH = new FirebaseSimpleLogin(window.FBREF, function(error, user) {
        if (!window.LOGGED_IN) { //double login problem
            if (error) {
                set_error_status("login Failed")
            }
            else if (user) {
                window.LOGGED_IN = true
                window.USER = user
                window.GH = new Github({
                    "token": user.accessToken,
                    "auth": "oauth"
                })

                window.REPO = window.GH.getRepo("Facjure", "poems")
                window.REPO.getTree('master?recursive=true', function(err, tree) {
                    window.LAST_COMMIT = tree
                    if ($("#editor-search").length > 0) {
                        bind_typeahead()
                    }
                })
            }
        }
    })

    log("logging in")
    window.AUTH.login('github', {
        rememberMe: true,
        scope: 'user, repo'
    })
}


function editor_load () {

    window.CURRENT_PATH = ""

    $("#editing-area").keydown(function (e) {
        if (e.which == 9) {
            e.preventDefault();
            var start = $(this).get(0).selectionStart;
            var end = $(this).get(0).selectionEnd;
            $(this).val($(this).val().substring(0, start)
                + "    "
                + $(this).val().substring(end));

           $(this).get(0).selectionStart = start + 4;
           $(this).get(0).selectionEnd = start + 4;
        }

    })

    $("#save").click(function (ev) {

        var text = $("#editing-area").val()
        var text_parts = get_text_parts(text)

        log(text_parts[0])
        var yaml_ds

        try {
            yaml_ds = get_yaml_ds(text_parts[0])
            if (text_parts[1] === undefined || text_parts[1].match(/^\s*$/))
                throw Error("Content is Empty")
            set_status("saving")
        }
        catch (e) {
            set_error_status(e.message)
            return
        }

        path = get_path(yaml_ds)
        log(path)

        setTimeout(function (){
            window.REPO.write('master', path, text, 'Updated ' + yaml_ds.author + " - " + yaml_ds.title, function(err) {
                if (!err) {
                    set_status("saved")
                }
                else {
                    log(err)
                    set_error_status("save error")
                }
            })
        }, 2000); // Github bug

        window.REPO.getTree('master?recursive=true', function(err, tree) {
            window.LAST_COMMIT = tree
        })
    })

    $("#new").click(edit_new_file)
    $("#editing-area").keyup(preview)

}
