from flask import *
from flask import request as req
# from flask import jsonify
# from collections import OrderedDict
from flask_cors import CORS
import mysql.connector
import mysql.connector.pooling
import json

# ------------------------
app=Flask(__name__,
        static_folder='static',
        static_url_path='/static')
CORS(app, origins = '*')

app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.secret_key = "john"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
dbconfig = {
    "host": "localhost",
    "user": "root",
    "password": "yourpassword",
    "database": "taipei_day_trip",
    "pool_name": "mypool",
    "pool_size": 20,  # 池中連接的數量# 池中連接的數量
}
pool = mysql.connector.pooling.MySQLConnectionPool(**dbconfig)
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~



import jwt
import datetime
# ======================   註冊會員    =========================================
@app.route("/api/user",methods = ["POST"])
def register():
  err_res = { "error": True, "message": "發生錯誤" }#  或 err_res=dict(error=True,message="發生錯誤")
  try:
    conn = pool.get_connection()
    if conn.is_connected():
        print('連接池成功。')
        cursor = conn.cursor()
        reqData = request.get_json()
        username = reqData['username']
        useremail = reqData['useremail']
        password = reqData['password']
        cursor.execute("SELECT useremail FROM member WHERE useremail = %s", (useremail,))
        result = cursor.fetchone()
        if result:
            cursor.close()
            conn.close()
            err_res["message"] = "此信箱已被註冊"
            return Response(json.dumps(err_res, ensure_ascii=False), status=400, content_type='application/json; charset=utf-8')

        cursor.execute("INSERT INTO member(username, useremail, password) VALUES(%s, %s, %s);", (username, useremail, password))
        conn.commit() #本來是 con.commit()
        cursor.close()
        conn.close()
        ok_res = { "ok": True }
        return Response(json.dumps(ok_res, ensure_ascii=False), status=200, content_type='application/json; charset=utf-8')
    
    conn.close()
    print('連接池失敗。')
  except Exception as err :
    print(err)
    conn.close()
    return Response(json.dumps(err_res, ensure_ascii=False), status=500, content_type='application/json; charset=utf-8')
# ======================   登入會員    ===============================
@app.route("/api/user/auth", methods = ['GET','PUT'])
def sign_in():
  err_res = {"error": True,"message":"發生錯誤"}
  secret_key = 'mysecret-key'
  if req.method =='PUT':
    try:
      conn = pool.get_connection()
      if conn.is_connected():
        cursor = conn.cursor()
        if req.is_json: # 確定他是一個json
            req_json_data = req.get_json()
            req_user_email = req_json_data.get("useremail", None)
            req_password = req_json_data.get("password", None)
            cursor.execute("SELECT id,username,useremail,password FROM member WHERE useremail=%s;", (req_user_email,))
            sql_data = cursor.fetchall()
            if sql_data:
                sqlPassword = sql_data[0][3]
                if req_password == sqlPassword:
                    sql_user_id = sql_data[0][0]
                    sql_user_name = sql_data[0][1]
                    sql_user_email = sql_data[0][2]

                    issued_at = datetime.datetime.utcnow()
                    # expiration = issued_at + datetime.timedelta(seconds=5) 
                    expiration = issued_at + datetime.timedelta(days=7) 
                    payload = {
                        "id": sql_user_id,
                        "username": sql_user_name,
                        "useremail": sql_user_email,
                        "iat": issued_at,
                        "exp": expiration
                    }
                    token = jwt.encode(payload, secret_key, algorithm='HS256')
                    # decode_token = jwt.decode(token, secret_key, algorithms=['HS256'])
                    cursor.close()
                    conn.close()
                    token_res = { "token": token }
                    return Response(json.dumps(token_res, ensure_ascii=False), status=200, content_type='application/json; charset=utf-8')
                else:
                    cursor.close()
                    conn.close()
                    err_res['message']='密碼輸入錯誤'
                    return Response(json.dumps(err_res, ensure_ascii=False), status=400, content_type='application/json; charset=utf-8')
            else:
                cursor.close()
                conn.close()
                err_res['message']='無此帳號'
                return Response(json.dumps(err_res, ensure_ascii=False), status=400, content_type='application/json; charset=utf-8')  
        else:
            cursor.close()
            conn.close()
            err_res['message']='request資料格式錯誤'
            return Response(json.dumps(err_res, ensure_ascii=False), status=400, content_type='application/json; charset=utf-8')
      conn.close()      
    except Exception as err :
        cursor.close()
        conn.close()
        err_res['message']='伺服器發生錯誤'
        return Response(json.dumps(err_res, ensure_ascii=False), status=500, content_type='application/json; charset=utf-8')
    
    # ============   頁面加載判斷是否為登入  ========================
  if req.method =='GET':
    # reqToken = None
    try:
      conn = pool.get_connection()
      if conn.is_connected():
        cursor = conn.cursor()
        member_data_res = { "data": None }
        # if 'Authorization' in req.headers:
        reqToken = req.headers['Authorization'].split()[1]
        # if reqToken == 'null':
        #     print("前端沒token")
        #     return Response(json.dumps(member_data_res, ensure_ascii=False), status=401, content_type='application/json; charset=utf-8')
        #  return jsonify({'message': '令牌已过期'}), 401
        decoded_token = jwt.decode(reqToken, secret_key, algorithms=['HS256'])
        # if decoded_token['iat'] > decoded_token['exp']:
        #     return Response(json.dumps(member_data_res, ensure_ascii=False), status=200, content_type='application/json; charset=utf-8')
        member_data_res = {
            "data":{"id": decoded_token['id'],
                    'name': decoded_token['username'],
                    'email': decoded_token['useremail'],
            }}
        cursor.close()
        conn.close()
        return Response(json.dumps(member_data_res, ensure_ascii=False), status=200, content_type='application/json; charset=utf-8')
      conn.close()
    except Exception as err :
        cursor.close()
        conn.close()
        print(err)
        print('exceptㄌ')
        return Response(json.dumps(member_data_res, ensure_ascii=False), status=500, content_type='application/json; charset=utf-8')














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
    error_res = {"error": True,"message":"發生錯誤"}
    try:
        conn = pool.get_connection()

        if conn.is_connected():
            cursor = conn.cursor()
            print(cursor)
            page = request.args.get("page",type=int,default=0)
            keyword = request.args.get("keyword",type=str)

            if keyword != None:
                cursor.execute("SELECT DISTINCT mrt FROM places")
                # 先把所有捷運站名字找出來，並且不重複顯示
                mrts = cursor.fetchall()
                #==  先搜尋捷運站名字  ==  #==  先搜尋捷運站名字  ==  #==  先搜尋捷運站名字  ==  #==  先搜尋捷運站名字  ==  #==  先搜尋捷運站名字  ==  
                offset = page*12
                next_page = page+1 # offset就是設定要從第幾筆資料開始取，一頁12筆，所以要取第二頁資料就要跳過12筆
                # 如果要取第三頁資料就要跳過24筆

                for mrt in mrts:
                    if keyword == mrt[0]:
                        cursor.execute("SELECT COUNT(*) FROM places WHERE mrt = %s;", (keyword,))
                        place_cnt = cursor.fetchone()[0]
                        # 計算總量，如果超過可顯示的量就不回傳
                        if (page+1)*12 > place_cnt:
                            if (page+1)*12-place_cnt >= 12:
                                error_res = {
                                    "error": True,
                                    "message":"您輸入的數字已超過總頁數"
                                }

                                cursor.close()
                                conn.close()
                                return Response(json.dumps(error_res, ensure_ascii=False), status=500, content_type='application/json; charset=utf-8')

                        cursor.execute("SELECT * FROM places WHERE mrt = %s LIMIT %s OFFSET %s", (keyword,12,offset))
                        result = cursor.fetchall()
                        # print(result)
                        places_data = []
                        for row in result:
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
                        if len(result)<12:
                            next_page=None
                        data = {
                            "nextPage":next_page,
                            "data": places_data
                        }
                        json_data = json.dumps(data, ensure_ascii=False, sort_keys=False, indent=3)

                        cursor.close()
                        conn.close()
                        return Response(json_data, status=200,content_type='application/json; charset=utf-8')
                #== 如果沒有符合的捷運再模糊搜尋景點名字 
                
                cursor.execute("SELECT * FROM places WHERE name LIKE %s LIMIT %s OFFSET %s", ('%'+keyword+'%', 12, offset))
                result = cursor.fetchall()
                # print(result)

                places_data = []
                for row in result:
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
                if len(result)<12:
                    next_page=None
                data = {
                    "nextPage":next_page,
                    "data": places_data
                }
                json_data = json.dumps(data, ensure_ascii=False, sort_keys=False, indent=3)


                cursor.close()
                conn.close()
                return Response(json_data, status=200,content_type='application/json; charset=utf-8')
            
            elif keyword == None:
                print("keyword是None")

                # 以下為沒有搜尋關鍵字 # 以下為沒有搜尋關鍵字 # 以下為沒有搜尋關鍵字# 以下為沒有搜尋關鍵字# 以下為沒有搜尋關鍵字# 以下為沒有搜尋關鍵字
            cursor.execute("SELECT COUNT(*) FROM places")
            data_cnt = cursor.fetchone()[0]
            # 得到資料數量    # 得到資料數量    # 得到資料數量
            if (page+1)*12 > data_cnt:
                if (page+1)*12 - data_cnt >= 12:
                    error_res = {
                        "error": True,
                        "message":"您輸入的數字已超過總頁數"
                    }

                    cursor.close()
                    conn.close()
                    return Response(json.dumps(error_res, ensure_ascii=False), status=500, content_type='application/json; charset=utf-8')
            offset = page*12
            next_page = page+1
            cursor.execute("SELECT * FROM places LIMIT %s OFFSET %s",(12,offset))
            result = cursor.fetchall()
            # print(result)

            places_data = []
            for row in result:
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
            if len(result) < 12:
                next_page=None
            data = {
                "nextPage":next_page,
                "data": places_data
                }
            json_data = json.dumps(data, ensure_ascii=False, sort_keys=False, indent=3)

            # json_data = jsonify(data)
            cursor.close()
            conn.close()
            return Response(json_data, status=200,content_type='application/json; charset=utf-8')
        
    except Exception as err :# 什麼情況下會進到except? mysql筆記裡面有！！
        print(err)
        cursor.close()
        conn.close()


        return Response(json.dumps(error_res, ensure_ascii=False), status=500, content_type='application/json; charset=utf-8')
    # son_dumps(dict)时，如果dict包含有汉字，
    # 一定加上ensure_ascii=False。否则按参数默认值True，
    # 意思是保证dumps之后的结果里所有的字符都能够被ascii表示，
    # 汉字在ascii的字符集里面，因此经过dumps以后的str里，汉字会变成对应的unicode。



@app.route("/api/attraction/<id>")
def api_attraction_id(id):
    error_res = {
        "error": True,
        "message":"伺服器發生錯誤"
    }

    try:
        conn = pool.get_connection()
        # ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        if conn.is_connected():
            cursor = conn.cursor()

            cursor.execute("SELECT * FROM places WHERE id = %s", (id,))
            result = cursor.fetchone()
            # print(result)
            if result==None:
                error_res["message"]="查無景點"

                cursor.close()
                conn.close()
                return Response(json.dumps(error_res, ensure_ascii=False), status=400, content_type='application/json; charset=utf-8')
            id, name, category, description, address, transport, mrt, lat, lng = result
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
            data = {"data": place}

            json_data = json.dumps(data, ensure_ascii=False, sort_keys=False, indent=3)

            cursor.close()
            conn.close()
            return Response(json_data, status=200,content_type='application/json; charset=utf-8')
    except Exception as err:# 什麼情況下會進到except? mysql筆記裡面有
        print("except了")
        print(err)
        cursor.close()
        conn.close()
        return Response(json.dumps(error_res, ensure_ascii=False), status=500, content_type='application/json; charset=utf-8')



@app.route("/api/mrts")
def api_mrts():
    error_res = {
        "error": True,
        "message":"請按照情境提供對應的錯誤訊息"
    }
    try:
        conn = pool.get_connection()
        if conn.is_connected():
            cursor = conn.cursor()

            cursor.execute("SELECT p.mrt, COUNT(p.mrt) AS mrt_count FROM places p GROUP BY p.mrt ORDER BY mrt_count DESC;")
                    # 先把所有捷運站名字找出來，並且不重複顯示
            mrts = cursor.fetchall()
            sorted_mrt = []
            for cnt,row in enumerate(mrts):
                mrt = row[0]
                if mrt != None:
                    sorted_mrt.append(mrt)
                    cnt += 1
                if cnt == 40:
                    break
            data = {"data": sorted_mrt}

            json_data = json.dumps(data, ensure_ascii=False, sort_keys=False, indent=3)

            cursor.close()
            conn.close()
            return Response(json_data, status=200,content_type='application/json; charset=utf-8')
    except:
        print("except了")
        cursor.close()
        conn.close()

        return Response(json.dumps(error_res, ensure_ascii=False), status=500, content_type='application/json; charset=utf-8')




# app.run(debug=True, host="0.0.0.0", port=3000)
app.run(debug=True, host="0.0.0.0", port=3000)
