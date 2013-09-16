$(function () {

    $.ajaxSetup({ cache: false })
    var firebaseRef = new Firebase("https://tesjure.firebaseio.com")

    var render_commit = function (tree) {
        $("#commit-files").load("template.html #tree", function () {
            var template = $("#tree").html()
            var html = Mustache.render(template, { "blobs": tree })
            $("#commit-files").html(html)
        })
    }

   $("#save-poem").click(function (ev) {
       var path = $("#file-name").val()
       var content = $("#content").val()
       repo.write('master', path, content, 'edit', function(err) {
           console.log("error: " + err)
       });
   })

    var app = $.sammy("#main", function() {

        this.post("#/search", function (context) {
            var query = this.params["q"]
            console.log("info: query is " + query)
            var results = _.filter(window.latest_commit_tree, function (e) {
               if (e.path.toLowerCase().indexOf(query.toLowerCase()) != -1) {
                   return true;
               }
               else {
                   return false;
               }
            })
            console.log("info: " + results.length)
            render_commit(results)
        })

        this.get("#/(.+)", function (context) {
            var path = this.params['splat'][0]
            console.log("info: " + path);
            repo.read('master', path, function(err, data) {
                $("#content").val(data)
                $("#file-name").val(path)
            })
        })


        this.get("", function (context) {
            var path = this.params['path']
            var auth = new FirebaseSimpleLogin(firebaseRef, function(error, user) {
                if (error) {
                    // an error occurred while attempting login
                    alert(error)
                }
                else if (user) {
                    // page init to repo
                    window.oauth_token = user.accessToken

                    window.gh = new Github({
                        "token": window.oauth_token,
                        "auth": "oauth"
                    })

                    window.repo = gh.getRepo("Facjure", "poems")

                    repo.getTree('master?recursive=true', function(err, tree) {
                        console.log("info : got tree")
                        window.latest_commit_tree = tree
                        render_commit(tree)
                    });

                }
                else {
                    // user is logged out
                }
            });

            function login(ev) {
                console.log("info: logging in")
                auth.login('github', {
                    rememberMe: true,
                    scope: 'user, repo, gist'
                })
            }

            $("#login").click(login)

        })



    })

    app.run()

})

