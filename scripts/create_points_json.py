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
table = os.path.join(script_dir, '{}.sde'.format(configuration), 'DDACTS.DDACTSadmin.CRASHLOCATION')

with open(file, 'w') as f:
    with SearchCursor(table, ['OID@', 'SHAPE@XY']) as cursor:
        for row in cursor:
            if row[1][0] is not None and row[1][1] is not None:
                x = int(row[1][0])
                y = int(row[1][1])

                point = [row[0], x, y]
                dict['points'].append(point)

    jsonc = re.sub(pattern, '', json.dumps(dict))
    f.write(jsonc)
