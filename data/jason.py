from flask import *
from flask import request as req
import json
import mysql.connector

conn = mysql.connector.connect(
    user = "root",
    password = "yourpassword",
    host = "localhost",
    database = "taipei_day_trip"
)
cursor = conn.cursor()


file_path = "data/taipei-attractions.json"
with open(file_path, mode="r") as f:
    json_data = json.load(f)

results=json_data["result"]["results"]
for item in results:
    name=item["name"]
    category=item["CAT"]
    description=item["description"]
    address=item["address"]
    transport=item["direction"]
    mrt=item["MRT"]
    lat=item["latitude"]
    lng=item["longitude"]
    cursor.execute("INSERT INTO places(name,category,description,address,transport, mrt,lat,lng) VALUES(%s, %s, %s, %s, %s, %s, %s, %s);",(
        name, category, description, address, transport, mrt, lat, lng))

    place_id = cursor.lastrowid# 這個重要# 這個重要# 這個重要# 這個重要# 這個重要
    # 這個重要# 這個重要# 這個重要# 這個重要
    splitfile=item["file"].split('https')
    splitfile.pop(0)
    for index,url in enumerate(splitfile):
        url="https"+url
        if ".jpg" in url.lower() or ".png" in url.lower():
            cursor.execute("INSERT INTO images(place_id, url) VALUES(%s, %s);", (place_id, url))

    conn.commit()

cursor.close()
conn.commit()
conn.close()