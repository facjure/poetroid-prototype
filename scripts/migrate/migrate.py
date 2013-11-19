import yaml
import sys
import os
import re
from codecs import open

textfile = sys.argv[1]
text = open(textfile, "r", "utf-8").readlines()

current_poem = []
current_yaml = []

poems = []

def get_title(index):
    global text
    reversed_range = range(index -1, -1, -1)
    title = []
    for i in reversed_range:
        possible_title = text[i]
        if re.match(r'^\s*$', possible_title):
            break
        title.append(possible_title)
    title.reverse()
    return title

def finalise_poem(title, next_title_len):
    # title dance
    global current_yaml
    global current_poem
    global poems
    title_string = "".join(title)
    title_string = re.sub(r'^\s*','', title_string)
    title_string = re.sub(r'\n',' ', title_string)
    title_string = re.sub(r'\s*$','', title_string)
    title_string = title_string + "\n"
    if re.match(r'^\s*$', title_string):
        current_poem = []
        current_yaml = []
        raise Exception("Missing Title")
    current_yaml = current_yaml[0:1] + [u'title: ' + title_string] + current_yaml[1:]
    for _ in range(0, next_title_len):
        current_poem.pop()
    poems.append([current_yaml, current_poem])
    current_poem = []
    current_yaml = []


class state:
    start = 0
    in_yaml = 1
    in_poem = 2
    end = 3

current_state = state.start
current_title_index = None

for index, line in enumerate(text):
    if re.match(r'^-+', line):
        if current_state == state.in_yaml:
            current_state = state.in_poem
            current_yaml.append(line)
        elif current_state == state.start:
            current_title_index = index
            current_yaml.append(line)
            current_state = state.in_yaml
            continue
        elif current_state == state.in_poem:
            title = get_title(current_title_index)
            try:
                next_title_len = len(get_title(index))
                finalise_poem(title, next_title_len)
            except Exception:
                print current_title_index
            current_title_index = index
            current_yaml.append(line)
            current_state = state.in_yaml
    elif current_state == state.in_yaml:
        current_yaml.append(line)
    elif current_state == state.in_poem:
        current_poem.append(line)

title = get_title(current_title_index)

try:
    finalise_poem(title)
except Exception:
    print current_title_index

for index, poem in enumerate(poems):
    total_text = poem[0] + poem[1]
    total_text = u"".join(total_text)
    fh = open("success/" + str(index),"w","utf-8")
    fh.write(total_text)
    fh.close()
# import pprint
# pp = pprint.PrettyPrinter(indent=2)
# pp.pprint(poems)
