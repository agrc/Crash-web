from arcpy.da import SearchCursor
from jinja2 import Template

template = Template("""{"points": [{% for p in points %}[{{p[0]}},{{p[1]}}]{% if not loop.last %}},{% endif %}{% endfor %}]}""")

points = []
with SearchCursor("local.sde\DDACTS.DBO.CrashLocation", ["OID@", "SHAPE@XY"]) as cursor:
    for row in cursor:
        if row[1][0] > 0 and row[1][1] > 0:
            x = round(row[1][0], 2)
            y = round(row[1][1], 2)

            point = [row[0],(x,y)]
            points.append(point)

json = template.render(points=points)

with open('points.json', 'w') as f:
    f.write(json)