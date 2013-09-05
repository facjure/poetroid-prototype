import pystache
import urllib

def hello_world(text):
    return "Hello %s from Frozen Pie" % text

def all_posts(text):
    renderer = pystache.Renderer(file_encoding="utf-8", string_encoding="utf-8")
    return renderer.render(text, {"posts": contents })

def by_author(text):
    renderer = pystache.Renderer(file_encoding="utf-8", string_encoding="utf-8")
    authors = []
    for poem in contents:
        author = poem.get("author", "Anonymous")
        if author is None:
            author = "Anonymous"

        matches = filter(lambda x: x["name"] == author, authors)
        
        if not matches:
            authors.append({"name": author, "link_name": '#/search?query=author' + urllib.quote_plus(":" +  author)})

    authors.sort(key= lambda d : d.get("name"))
    return renderer.render(text,{"authors": authors})
