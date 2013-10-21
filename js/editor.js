var DEBUG = 1

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


function edit_new_file () {
    $("#status").html("new file")
    $("#editing-area").val(default_text)
}

function preview (e) {

    var yaml_status = "---\n"

    var text = $("#editing-area").val()
    var text_parts = get_text_parts(text)

    log(text_parts[0])
    var yaml_ds

    try {
        yaml_ds = get_yaml_ds(text_parts[0])
        yaml_status += "Metadata: OK\n"
        $("#status").html("editing")
    }
    catch (YamlParseException) {
        $("#status").html("Metadata Error " + YamlParseException.message)
        yaml_status += "Metadata: NOT OK\n---\n"
        $("#preview").html(yaml_status)
        return
    }

    path = get_path(yaml_ds)

    yaml_status += "Filename: " + path + "\n---\n"
    $("#preview").html(yaml_status + text_parts[1])
}


function get_yaml_ds(text) {
    var yaml_ds

    try {
        yaml_ds = YAML.parse(text)
        log(yaml_ds)
    }
    catch (YamlParseException) {
        throw YamlParseException
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

function get_file () {
    var path = $("#editor-search").val()
    $("#status").html("loading " + path)
    log(path)
    window.REPO.read('master', path, function(err, data) {
        $("#editing-area").val(data)
        $("#status").html("editing " + path)
        window.CURRENT_PATH = path
        preview()
    })
}

function editor_load () {

    $.ajaxSetup({ cache: false })
    var firebaseRef = new Firebase("https://tesjure.firebaseio.com")

    var auth = new FirebaseSimpleLogin(firebaseRef, function(error, user) {
        if (error) {
            $("#status").html("login Failed")
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
                log(window.LAST_COMMIT)

                var all_paths = _.map(tree, function (e) {
                   return e.path
                })

                $('#editor-search').typeahead({
                    name: "file-names",
                    limit: 10,
                    local: all_paths
                }).bind("typeahead:selected", get_file)

            })

            $("#login").html("logout")
            edit_new_file()

        }
    })

    $("#editing-area").keydown(function (e) {
        if (e.which == 9) {
            e.preventDefault(); 
            var start = $(this).get(0).selectionStart;
            var end = $(this).get(0).selectionEnd;
            $(this).val($(this).val().substring(0, start)
                + "    "
                + $(this).val().substring(end));

           $(this).get(0).selectionStart = 
           $(this).get(0).selectionEnd = start + 4;
        }

    })

    $("#editor-search").keypress(function (e) {
                if (e.which == 13) {
            e.preventDefault()
            get_file()
        }
     })

    $("#login").click(function () {

          if ($(this).html() === "logout")  {
              auth.logout()
              log("logging out")
              $("#login").html("login")
              $("#status").html("logged out")
              $("#editing-area").val("")
          }
          else {
              log("logging in")
              auth.login('github', {
                 rememberMe: true,
                 scope: 'user, repo'
              })
          }
     })

    $("#save").click(function (ev) {
        $("#status").html("saving")

        var text = $("#editing-area").val()
        var text_parts = get_text_parts(text)

        log(text_parts[0])
        var yaml_ds

        try {
            yaml_ds = get_yaml_ds(text_parts[0])
        }
        catch (YamlParseException) {
            $("#status").html("Metadata Error " + YamlParseException.message)
            return
        }

        path = get_path(yaml_ds)

        log(path)
        log(text)

        setTimeout(function (){

            window.REPO.write('master', path, text, 'Updated ' + yaml_ds.author + " - " + yaml_ds.title, function(err) {
                if (!err) {
                    $("#status").html("saved")
                }
                else {
                log(err)
                    $("#status").html("save error")
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

