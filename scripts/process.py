#!/usr/bin/env python
"""
Usage:
    ./process_poems.py <poems folder>
"""
import os, sys

folder = sys.argv[1]
errors_folder = folder + os.sep + "errors"

print """Processing -> """ + folder

os.system("rm except.log.md")
log = open("except.log.md", "a+")

import re
import yaml
import StringIO
from glob import glob
from pipes import quote
from codecs import open
from datetime import datetime

import cleaners


def split_file(poem_text):
    match = re.split(u"\n---[ ]*\n", poem_text, flags=re.U | re.S)
    yaml_text = match[0]
    poem = match[1]
    return yaml_text, poem


for txtfile in glob(folder + os.sep + "*.txt"):
    print "file -> " + txtfile
    try:
        txtfile_name = os.path.basename(txtfile)
        if not cleaners.is_clean_name(txtfile_name):
            raise Exception("Filenames should have hyphens only. \"<authorLastName>-<first-five-words-of-title>.txt\". Use - for all special characters.")
        text = open(txtfile, "r", "utf-8").read()
        yaml_text, poem = split_file(text)
        if len(poem) < 10: 
            raise Exception("Fault in process.py or Poem is too small")
        yaml.load(StringIO.StringIO(yaml_text))
    except Exception, error:
        log.write("#### Error in \"" + txtfile + "\"\n" + str(error) + "\n\n")
        cmd = "mv " + quote(txtfile) + " " +  quote(errors_folder)
        print "    " + cmd
        os.system(cmd)
        continue

log.close()
log = open("except.log.md", "r")
if len(log.readlines()) > 2:
    log.close()
    cmd = "mv except.log.md " + quote(errors_folder + os.sep + "except.log.UTC." + str(datetime.utcnow()) + ".md")
    print "    " + cmd
    os.system(cmd)
