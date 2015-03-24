from arcpy.da import SearchCursor
import json
import re

pattern = re.compile(r'\s+')
dict = { "points": [] }

with open('../src/points.json', 'w') as f:
    with SearchCursor("local.sde\DDACTS.DBO.CrashLocation", ["OID@", "SHAPE@XY"]) as cursor:
        for row in cursor:
            if row[1][0] > 0 and row[1][1] > 0:
                x = round(row[1][0], 2)
                y = round(row[1][1], 2)

                point = [row[0],x,y]
                dict['points'].append(point)

    jsonc = re.sub(pattern, '', json.dumps(dict))
    f.write(jsonc)