import sys
import re
import os
import string
import yaml
import StringIO
from glob import glob
from codecs import open

poems_path = "/Users/harsha/yuti/poems"
errors_path = poems_path + "/errors"

path = sys.argv[1]

def split_file(poem_text):
    match = re.split(u"\n---[ ]*\n", poem_text, flags=re.U | re.S)
    yaml_text = match[0]
    poem = match[1]
    return yaml_text, poem

def clean_name(name):
    punctuation_rx = re.compile('[%s]' % re.escape(string.punctuation))
    name = re.sub(punctuation_rx," ", name) # substiture punctuation with " "
    name = re.sub(" ", "-", name) # substitute spaces with
    name = re.sub("-+", "-", name) # replace multiple hyphens with single
    return name

def generate_name(title, author):
    final_author = clean_name(author)
    title_words = re.split(r'\s+', title)
    required_title = " ".join(title_words[0:6])
    final_title = clean_name(required_title)
    final_name = final_author + "-" + final_title
    final_name = re.sub("-+", "-", final_name)
    final_name = re.sub("-$", "", final_name)
    return final_name

for txtfile in glob(path + os.sep + "*.txt"):
    try:
        txtfile_name = os.path.basename(txtfile)
        text = open(txtfile, "r", "utf-8").read()
        yaml_text, poem = split_file(text)
        ds = yaml.load(StringIO.StringIO(yaml_text))
        author = ds['author']
        title = ds['title']
        name = generate_name(title, author)
        final_file_name = name + ".txt"

        print txtfile + "$$$$$$$$$$$$$$$$$$$$" + name
    except Exception, error:
        print "#### Error in \"" + txtfile + "\"\n" + str(error) + "\n\n"
#        cmd = "mv " + quote(txtfile) + " " +  quote(errors_path)
#        print "    " + cmd
#        os.system(cmd)
        continue




print "Done"
