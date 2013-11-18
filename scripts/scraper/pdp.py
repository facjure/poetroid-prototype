from bs4 import BeautifulSoup as bs
import os
import sys
import re
from codecs import open
import string
from datetime import datetime
import time
import requests

ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Safari/537.36"

headers = {
    'User-Agent': ua,
}

ignored_links = ['<a href="/"><b>Home</b></a>',
                 '<a href="/latestpoems.php">Latest Poetry Added</a>',
                 '<a href="/surnames.php">Authors By Surname</a>',
                 '<a href="/name.php">Authors By First Name</a>',
                 '<a href="/listpoetry.php">Poetry By Title</a>',
                 '<a href="/poetrylines.php">Poetry By First Lines</a>',
                 '<a href="/topauthors.php"><b>Top Authors</b></a>',
                 '<a href="/toppoetry.php"><b>Top Poems</b></a>',
                 '<a href="http://help.pi01.net" target="_blank"><b>Contact Us</b></a>'
                 ]

html_dir = "html/"

def write_file(name, text, directory=None):
    if dir and not os.path.exists(html_dir + directory):
        os.makedirs(html_dir + directory)
    filehandle = open(name, 'w', "utf-8")
    filehandle.write(text)
    filehandle.close()


def read_page_listing(name):
    filehandle = open(name, 'r', "utf-8")
    text = filehandle.read()
    filehandle.close()
    return text

def generateazlink(letter, page):
    return 'http://public-domain-poetry.com/listpoetry.php?letter=' + letter + "&page=" + str(page)

def save_link(link, char, pageno):
    ro = re.search(r'href="(.+?)"', link)
    link = "http://public-domain-poetry.com/" + ro.group(1)
    r = requests.get(link, headers=headers)
    r.encoding = 'utf-8'
    filename = html_dir + char + "/" + str(pageno) + "/" + link.rsplit('/',1) + " - " + datetime.now()
    write_file(filename, r.text)
    time.sleep(20)

def get_page(char, pageno):
    link = generateazlink(char,1)
    r = requests.get(link, headers=headers)
    r.encoding = 'utf-8'
    filename = html_dir + char + "/1.html"
    dirforpoems = char + "/1"
    write_file(filename, r.text, dirforpoems)
    return r.text

def get_first_page(char):
    text = get_page(char, 1)
    bso = bs(text, "html5lib")
    return bso

def get_rest_pages(first_page_bso, char):
    current_page = first_page_bso
    required_links = current_page.find_all('table')[10].find_all('a')
    lastpage_link = required_links[-1]
    ro = re.search(r'(\d+)"><', str(lastpage_link))
    lastpage_no =  ro.group(1)
    index = 1
    while index <= int(lastpage_no):
        i = 0
        iindex = 1
        while iindex <= 50:
            try:
                link = required_links[i]
            except IndexError:
                break

            save_link(str(link), char, index)
            i += 3
            iindex += 1
        index = index + 1
        current_page = get_page(generateazlink(char, index))
        required_links = current_page.find_all('table')[10].find_all('a')
        lastpage_link = required_links[-1]


for char in string.ascii_uppercase:
    import pdb; pdb.set_trace()
    first_page_bso = get_first_page(char)
    get_rest_pages(first_page_bso, char)

