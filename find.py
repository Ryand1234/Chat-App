#!/usr/bin/env python3

import os
import re

f = open('chat.log','a')

with open('/home/riyan/github/Chat-App/.chat.log') as log:
    for line in log.readlines():
        f.write(line);
        res = re.search(r"^Error \[([A-Z_]+)\]: ([a-zA-Z_ ]+)", line.strip())
        if res is not None:
            print("Error: {}".format( res.group(1)))
            print("Detail: {}".format(res.group(2)))
            
f.close()
