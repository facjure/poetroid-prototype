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
    $("#filename").html("")
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
        return
    }

    path = get_path(yaml_ds)

    var file_name = "Filename: " + path
    $("#filename").html(file_name)
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



$(function () {

    $("#login").on('click', function (e) {
        e.preventDefault()

          if ($(this).html() === "Logout")  {
              window.auth.logout()
              set_status("")
              window.CURRENT_PATH = ""
              $("#preview").html("")
              $("#filename").html("")
              $("#login").html("Login")
              $("#editing-area").val("")
              log("logging out")
          }
          else {
            window.auth = new FirebaseSimpleLogin(new Firebase("https://tesjure.firebaseio.com"), function(error, user) {
            if (error) {
                set_error_status("login Failed")
            }
            else if (user) {

                // Initialize globals

                window.USER = user

                window.GH = new Github({
                    "token": user.accessToken,
                    "auth": "oauth"
                })

                log(user)

                window.REPO = window.GH.getRepo("Facjure", "poems")

                window.REPO.getTree('master?recursive=true', function(err, tree) {
                    window.LAST_COMMIT = tree

                    if (!window.all_paths) {

                        window.all_paths = _.map(tree, function (e) {
                        var value = e.path
                        var name = e.path.replace(/\..+$/, "").replace(/-/g, " ")
                        return { "value": name, "name": value }
                        })
                    }

                    var search_template = Mustache.compile("<p data-val='{{name}}'>{{value}}</p>")

                    $('#editor-search').typeahead({
                        name: "file-names",
                        limit: 10,
                        template: search_template,
                        local: window.all_paths
                    }).bind("typeahead:selected", get_file)

                })

                $("#login").html("Logout")
                edit_new_file()

            }
        })


              log("logging in")
              window.auth.login('github', {
                 rememberMe: true,
                 scope: 'user, repo'
              })
          }
     })

})


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
        log(text)

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
