from arcpy.da import SearchCursor
import json
import os
import re
import sys

pattern = re.compile(r'\s+')
dict = {'points': []}

configuration = sys.argv[1]

script_dir = os.path.dirname(__file__)
file = os.path.join(script_dir, '..', 'src', 'points.json')

with open(file, 'w') as f:
    with SearchCursor('scripts\{}.sde\CrashLocation'.format(configuration), ['OID@', 'SHAPE@XY']) as cursor:
        for row in cursor:
            if row[1][0] > 0 and row[1][1] > 0:
                x = round(row[1][0], 2)
                y = round(row[1][1], 2)

                point = [row[0], x, y]
                dict['points'].append(point)

    jsonc = re.sub(pattern, '', json.dumps(dict))
    f.write(jsonc)
