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
    window.CURRENT_PATH = ""
    $("#preview").html("")

}

function preview (e) {

    var yaml_status = ""

    var text = $("#editing-area").val()
    var text_parts = get_text_parts(text)

    log(text_parts[0])
    var yaml_ds

    try {
        yaml_ds = get_yaml_ds(text_parts[0])
        yaml_status += "Metadata: OK<br>"
        $("#status").html("editing")
    }
    catch (e){
        yaml_status += "Metadata: NOT OK " + e.message + "<br>"
        $("#yaml-results").html(yaml_status)
        return
    }

    path = get_path(yaml_ds)

    yaml_status += "Filename: " + path
    $("#yaml-results").html(yaml_status)
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
            throw new Error("Title and Author should be present")
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

    $("#yaml-results").height($("#more-controls").height() + "px")
    $("#preview").height($("#editing-area").height() + "px")

    $.ajaxSetup({ cache: false })
    var firebaseRef = new Firebase("https://tesjure.firebaseio.com")
    window.CURRENT_PATH = ""

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

    $("#login").click(function () {

          if ($(this).html() === "Logout")  {
              auth.logout()
              log("logging out")
              $("#login").html("Login")
              $("#status").html("Logged out")
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
