import pystache
import urllib
import re

def by_author(text):
    renderer = pystache.Renderer(file_encoding="utf-8", string_encoding="utf-8")
    authors = []
    for poem in contents:
        author = poem.get("author", "Unknown")
        if author is None:
            author = "Unknown"
        author = author.encode("utf-8")

        matches = filter(lambda x: x["name"] == author, authors)

        if not matches:
            authors.append({"name": author, "link_name": '#/search?query=author' + urllib.quote_plus(":" +  author)})

    authors.sort(key= lambda d : d.get("name"))
    return renderer.render(text,{"authors": authors})

def stats(text):
    renderer = pystache.Renderer(file_encoding="utf-8", string_encoding="utf-8")
    stats = {}
    poems_count = 0
    authors = []

    for poem in contents:
        name  = poem.get("name", "")
        if re.search(r'^content/', name):
            # actually a poem
            poems_count += 1
            author = poem.get("author", "Unknown")
            if author is not None:
                authors.append(author)

    unique_authors = len(set(authors))
    stats['poems_count'] = poems_count
    stats['authors_count'] = unique_authors
    stats['version'] = config['version']
    stats['build'] = config['build']
    return renderer.render(text,stats)


