from flask import *
# from flask import jsonify
# from collections import OrderedDict

app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True

import json
import mysql.connector


conn = mysql.connector.connect(
    user = "root",
    password = "yourpassword",
    host = "localhost",
    database = "taipei_day_trip"
)
cursor = conn.cursor()
# json_data = json.dumps(data, ensure_ascii=False, indent=2)




# Pages 
@app.route("/")
def index():
	return render_template("index.html")

@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")

@app.route("/booking")
def booking():
	return render_template("booking.html")

@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")


@app.route("/api/attractions", methods = ["GET"])
def api_attractions():
    try:
        cursor.execute("SELECT * FROM places;")
        result = cursor.fetchall()
        places_data = []


        page = request.args.get("keyword",type=int,default=0)


        page = request.args.get("page",type=int,default=0)



        for cnt,row in enumerate(result):
            id, name, category, description, address, transport, mrt, lat, lng = row

            cursor.execute("SELECT url FROM images WHERE place_id = %s;", (id,))
            images_result = cursor.fetchall()
            images = [image_row[0] for image_row in images_result]

            place = {
                "id": id,
                "name": name,
                "category": category,
                "description": description,
                "address": address,
                "transport": transport,
                "mrt": mrt,
                "lat": float(lat),
                "lng": float(lng),
                "images": images,
            }
            places_data.append(place)
            cnt+=1
            if cnt == page*12:
                break

        next_page=len(places_data)//12
        next_page+=1
        if len(places_data)%12 > 0:
            next_page+=1

        data = {
            "nextPage":next_page,
            "data": places_data
            }
        json_data = json.dumps(data, ensure_ascii=False, sort_keys=False, indent=3)

        # json_data = jsonify(data)
        return Response(json_data, status=200,content_type='application/json; charset=utf-8')
    
    except:
        error_res = {
            "error": True,
            "message":"請按照情境提供對應的錯誤訊息"
        }
        return Response(json.dumps(error_res, ensure_ascii=False), status=500, content_type='application/json; charset=utf-8')
    # son_dumps(dict)时，如果dict包含有汉字，
    # 一定加上ensure_ascii=False。否则按参数默认值True，
    # 意思是保证dumps之后的结果里所有的字符都能够被ascii表示，
    # 汉字在ascii的字符集里面，因此经过dumps以后的str里，汉字会变成对应的unicode。

        



  # if len(result) != 0 :~~~~~~~~``
  #         data = {
  #           "data":{
  #             "id": result[0][0],
  #             "name": result[0][1],
  #             "username": result[0][2],
  #         }}
  #         session["username_to_rename"] = result[0][2]
  #         # 這邊要確定你搜尋的是哪個人，然後放到變數，等等要改名的時候再跟當前用戶做比對
  #         json_data = jsonify(data)
  #         return json_data~~~~~~~~~



# def validate_string_parameter(value):
#     if isinstance(value, str):
#         return True
#     return False

# @app.route('/api/endpoint', methods=['GET'])
# def api_endpoint():
#     query_param = request.args.get('param', None)
    
#     if query_param is None:
#         return jsonify({'error': 'Missing parameter'}), 400
    
#     if not validate_string_parameter(query_param):
#         return jsonify({'error': 'Invalid parameter format'}), 400
    
#     # 在這裡進行你的處理邏輯
#     return jsonify({'result': 'Success'})



app.run(debug=True, host="0.0.0.0", port=3000)