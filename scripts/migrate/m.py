import yaml
import sys
import os
import re
from codecs import open

textfile = sys.argv[1]
text = open(txtfile, "r", "utf-8").readlines()

current_poem = []
current_yaml = []
first_title = []

def finalise_poem():
    poems.append([current_yaml, current_poem])
    current_poem = []
    current_yaml = []
    poems.append(current_poem)


class State:
    start = 0
    in_yaml = 1
    in_poem = 2
    end = 3

current_state = State.start

for index, line in enumerate(text):
    if re.match(r'^-+', line):
        if current_state == state.in_yaml:
            current_state = state.in_poem
            current_yaml.append(line)
        if current_state == 2 or current_state = 0:
            if current_state == 0:
                title = "".join(first_title)
            else:
                title = get_title(index)
            finalise_poem(title)
            current_yaml.append(line)
            current_state = 1
    if current_state == 2:
        current_poem.append(line)
    if current_state = 0:
        first_title.append(line)

