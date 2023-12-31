from flask import *
from flask import request as req
from flask_cors import CORS
import mysql.connector
import mysql.connector.pooling
import json

from dotenv import load_dotenv
import os

import jwt
from jwt.exceptions import ExpiredSignatureError

import datetime

import requests
from requests.exceptions import RequestException

# ------------------------
app=Flask(__name__,
        static_folder='static',
        static_url_path='/static')
CORS(app, origins = '*')

app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.secret_key = "john"


load_dotenv()
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
dbconfig = {
    "host": "localhost",
    "user": "root",
    "password": os.getenv('MYSQL_DB_PASSWORD'),
    "database": "taipei_day_trip",
    "pool_name": "mypool",
    "pool_size": 20, 
}
pool = mysql.connector.pooling.MySQLConnectionPool(**dbconfig)

# ----------------------------------------------------------------------------------
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

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

# --------------------- 訂單 -----------------------------------------------------------
@app.route("/api/orders", methods = ["POST"])
def orderpost():
    err_res = {"error": True,"message":"發生錯誤"}
    if not req.is_json: # 確定他是一個json
        err_res["message"] = "request body必須為json格式"
        return Response(json.dumps(err_res, ensure_ascii=False), status=400, content_type='application/json; charset=utf-8')
    try:
        conn = pool.get_connection()
        if conn.is_connected():
            cursor = conn.cursor()

            reqToken = req.headers['Authorization'].split()[1]
            secret_key = os.getenv('JWT_SECRET_KEY')
            decoded_token = jwt.decode(reqToken, secret_key, algorithms=['HS256'])
            member_id = decoded_token['id']

            req_json_data = req.get_json()
            place_id = req_json_data['order']['trip']['attraction']['id']
            date = req_json_data['order']['trip']['date']
            time = req_json_data['order']['trip']['time']
            price = req_json_data['order']['price']
            contact_name = req_json_data['order']['contact']['name']
            contact_email = req_json_data['order']['contact']['email']
            contact_phone = req_json_data['order']['contact']['phone']

            def generate_order_number(member_id):
                current_time = datetime.datetime.now()
                timestamp = current_time.strftime('%Y%m%d%H%M%S%f')  #包含微秒，確保唯一性
                payment_order_num = f"{timestamp}-{member_id:04d}"
                return payment_order_num
            payment_order_num = generate_order_number(member_id)
            print(f"訂單編號：{payment_order_num}") 
    
            cursor.execute("""INSERT INTO payment_order(
                payment_order_num, member_id, place_id, travel_date, time_slot, price, contact_name, contact_email, contact_phone) 
                VALUES(%s, %s, %s, STR_TO_DATE(%s,'%Y-%m-%d'), %s, %s, %s, %s, %s);""",
                (payment_order_num,member_id, place_id, date, time, price,contact_name,contact_email,contact_phone))
            conn.commit() 

            # 例如，如果 %s 中的字符串是 '2023-10-15'，
            # 則 STR_TO_DATE(%s, '%Y-%m-%d') 將解析這個字符串，
            # 並將其轉換為對應的日期值，即 2023 年 10 月 15 日。
            # 在這個示例中，我們使用了包含年、月、日、時、分、秒和微秒的時間戳記，以確保生成的訂單編號是唯一的。然後，我們將會員ID添加到最後，以建立最終的訂單編號。
            # 這樣的方法將生成基於時間和會員ID的唯一訂單編號，而不依賴於每天的訂單數量。請注意，微秒部分（%f）是為了確保即使在同一秒內生成多個訂單，它們仍然是唯一的。

            tappay_api_url = 'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime'
            MyPartnerKey = os.getenv('TAP_PAY_PARTNER_KEY')
            headers = {
                "Content-Type": "application/json",
                "x-api-key": MyPartnerKey
            }
            prime = req_json_data.get("prime", None)
            tappay_api_data = {
                "prime": prime,
                "partner_key": MyPartnerKey,
                "merchant_id": "Isaac_TAISHIN",
                "details": '台北一日遊',
                "amount":req_json_data['order']['price'],
                "cardholder": {
                    "phone_number": req_json_data['order']['contact']['phone'],
                    "name": req_json_data['order']['contact']['name'],
                    "email": req_json_data['order']['contact']['email']
                },
            }
            response = requests.post(tappay_api_url, json=tappay_api_data, headers=headers)
            tappay_api_res = response.json()

            payment_status_res = {
                "data": {
                    "number": payment_order_num,
                    "payment": {
                        "status": 0,
                        "message": "付款成功"
                    }
                }
            }
            if tappay_api_res['status'] != 0:
                print("Tap Pay Server交易失敗")
                payment_status_res["data"]['payment']['status'] = f"TapPay api status:{tappay_api_res['status']}"  
                payment_status_res["data"]['payment']['message'] = f"TapPay api msg:{tappay_api_res['msg']}"       
                conn.close()  
                return Response(json.dumps(payment_status_res, ensure_ascii=False), status=200, content_type='application/json; charset=utf-8')
            elif tappay_api_res['status'] == 0:
                # tap pay成功的狀況
                query = "UPDATE payment_order SET is_paid = %s WHERE payment_order_num = %s"
                cursor.execute(query, (1, payment_order_num))
                conn.commit() 
                print('Tap Pay Server交易成功')

                cursor.execute("DELETE FROM orders WHERE member_id = %s;",(member_id,))
                conn.commit() 

                conn.close()  
                return Response(json.dumps(payment_status_res, ensure_ascii=False), status=200, content_type='application/json; charset=utf-8')
        else:
            conn.close()
            err_res['message']='connection pool失敗'
            return Response(json.dumps(err_res, ensure_ascii=False), status=500, content_type='application/json; charset=utf-8') 
    except ExpiredSignatureError:
        conn.close()
        print('jwt已失效')
        err_res['message']='jwt已失效'
        return Response(json.dumps(err_res, ensure_ascii=False), status=403, content_type='application/json; charset=utf-8') 
    except jwt.exceptions.PyJWTError :
        conn.close()
        print('jwt錯誤')
        err_res['message']='jwt錯誤'
        return Response(json.dumps(err_res, ensure_ascii=False), status=403, content_type='application/json; charset=utf-8') 
    except RequestException as err:
        conn.close()
        print(err)
        err_res['message']= err
        return Response(json.dumps(err_res, ensure_ascii=False), status=500, content_type='application/json; charset=utf-8') 
    except Exception as err :
        conn.close()
        print(err)
        err_res['message']= err
        return Response(json.dumps(err_res, ensure_ascii=False), status=500, content_type='application/json; charset=utf-8')

@app.route("/api/orders/<orderNumber>", methods = ["GET"])
def orderget(orderNumber):
    err_res = {"error": True,"message":"發生錯誤"}
    try:
        conn = pool.get_connection()
        if conn.is_connected():

            reqToken = req.headers['Authorization'].split()[1]
            secret_key =os.getenv('JWT_SECRET_KEY')
            decoded_token = jwt.decode(reqToken, secret_key, algorithms=['HS256'])
            member_id = decoded_token['id']

            cursor = conn.cursor()
            query = "SELECT * FROM payment_order WHERE payment_order_num= %s AND member_id = %s"
            cursor.execute(query, (orderNumber,member_id))
            result = cursor.fetchall()
            if not result :
                err_res["message"]="無此訂單"
                conn.close()
                return Response(json.dumps(err_res, ensure_ascii=False), status=403, content_type='application/json; charset=utf-8')

            sql_payment_order_data = result[0]
            place_id = sql_payment_order_data[3]

            query2 = """SELECT places.id AS place_id,
                        places.name,
                        places.address,
                        (SELECT images.url FROM images WHERE images.place_id = places.id LIMIT 1) AS first_url
                        FROM places
                        WHERE places.id = %s;"""
            cursor.execute(query2, (place_id,))
            result2 = cursor.fetchall()
            
            json_res = {
                "data": {
                    "number": sql_payment_order_data[1],
                    "price": sql_payment_order_data[6],
                    "trip": {
                    "attraction": {
                        "id": sql_payment_order_data[3],
                        "name": result2[0][1],
                        "address": result2[0][2],
                        "image": result2[0][3],
                    },
                    "date": sql_payment_order_data[4].strftime("%Y-%-m-%-d"),
                    "time": sql_payment_order_data[5],
                    },
                    "contact": {
                    "name": sql_payment_order_data[7],
                    "email": sql_payment_order_data[8],
                    "phone": sql_payment_order_data[9],
                    },
                    "status": sql_payment_order_data[11]
                }
            }
            conn.close()
            return Response(json.dumps(json_res, ensure_ascii=False), status=200, content_type='application/json; charset=utf-8')
        else:
            conn.close()
            err_res['message']='connection pool失敗'
            return Response(json.dumps(err_res, ensure_ascii=False), status=500, content_type='application/json; charset=utf-8')         
    except ExpiredSignatureError:
        conn.close()
        print('jwt已失效')
        err_res['message']='jwt已失效'
        return Response(json.dumps(err_res, ensure_ascii=False), status=403, content_type='application/json; charset=utf-8') 
    except jwt.exceptions.PyJWTError :
        conn.close()
        print('jwt錯誤')
        err_res['message']='jwt錯誤'
        return Response(json.dumps(err_res, ensure_ascii=False), status=403, content_type='application/json; charset=utf-8') 
    except Exception as err :
        conn.close()
        print(err)
        err_res['message']= err
        return Response(json.dumps(err_res, ensure_ascii=False), status=500, content_type='application/json; charset=utf-8')

# -------------------------------------------------------------------------------------
# -------------------------------------------------------------------------------------
@app.route("/api/booking", methods = ["GET", "POST", "DELETE"])
def api_booking():
    err_res = { "error": True, "message": "發生錯誤" }#  或 err_res=dict(error=True,message="發生錯誤")
    try:
        conn = pool.get_connection()
        if conn.is_connected():
            cursor = conn.cursor()
            
            if req.method == 'POST':
                if not req.is_json: # 確定他是一個json
                    conn.close()
                    err_res["message"] = "request body必須為json格式"
                    return Response(json.dumps(err_res, ensure_ascii=False), status=400, content_type='application/json; charset=utf-8')
                reqData = request.get_json()
                # print(f"前端傳來的：{reqData}")
                reqToken = req.headers['Authorization'].split()[1]
                secret_key = os.getenv('JWT_SECRET_KEY')
                decoded_token = jwt.decode(reqToken, secret_key, algorithms=['HS256'])
                memberid=decoded_token['id']
                print(f"會員id：{memberid}")

                attractionId = reqData['attractionId']
                date = reqData['date']
                time = reqData['time']
                price = reqData['price']
                print(memberid,attractionId,date,time,price)

                cursor.execute("DELETE FROM orders WHERE member_id = %s;",(memberid,))# 先清空這位會員預訂的
                conn.commit() 
                cursor.execute(
                    "INSERT INTO orders(member_id, place_id, travel_date, time_slot, price) VALUES(%s, %s, STR_TO_DATE(%s,'%Y-%m-%d'), %s, %s);",
                    (memberid, attractionId, date, time, price))
                conn.commit() 

                conn.close()
                ok_res = { "ok": True }
                return Response(json.dumps(ok_res, ensure_ascii=False), status=200, content_type='application/json; charset=utf-8')
            
            if req.method == 'GET':
                reqToken = req.headers['Authorization'].split()[1]
                secret_key = os.getenv('JWT_SECRET_KEY')
                decoded_token = jwt.decode(reqToken, secret_key, algorithms=['HS256'])
                memberid = decoded_token['id']

                cursor.execute("SELECT orders.place_id, places.name, places.address,(SELECT url FROM images i WHERE i.place_id = places.id LIMIT 1) AS url,orders.travel_date, orders.time_slot, orders.price FROM orders INNER JOIN places ON orders.place_id = places.id WHERE orders.member_id = %s;",
                            (memberid,))
                sql_booking_data = cursor.fetchone()

                if sql_booking_data == None:
                    err_res["message"]='沒有訂購的資料'
                    conn.close()
                    return Response(json.dumps(err_res, ensure_ascii=False), status=400, content_type='application/json; charset=utf-8')
                # print(sql_booking_data[4].strftime("%Y-%-m-%-d"))
                booking_res = {
                    "data": {
                        "attraction": {
                        "id": sql_booking_data[0],
                        "name": sql_booking_data[1],
                        "address": sql_booking_data[2],
                        "image":sql_booking_data[3],
                        },
                        "date": sql_booking_data[4].strftime("%Y-%-m-%-d"),
                        "time": sql_booking_data[5],
                        "price":sql_booking_data[6],
                }}
                conn.close()
                return Response(json.dumps(booking_res, ensure_ascii=False), status=200, content_type='application/json; charset=utf-8')
            if req.method == 'DELETE':
                reqToken = req.headers['Authorization'].split()[1]
                secret_key = os.getenv('JWT_SECRET_KEY')
                decoded_token = jwt.decode(reqToken, secret_key, algorithms=['HS256'])
                memberid = decoded_token['id']
                cursor.execute("DELETE FROM orders WHERE member_id = %s;",(memberid,))
                conn.commit() 
                conn.close()
                ok_res = { "ok": True }
                return Response(json.dumps(ok_res, ensure_ascii=False), status=200, content_type='application/json; charset=utf-8')
        conn.close()
    except ExpiredSignatureError:
        conn.close()
        print('jwt已失效')
        err_res['message']='jwt已失效'
        return Response(json.dumps(err_res, ensure_ascii=False), status=403, content_type='application/json; charset=utf-8') 
    except jwt.exceptions.PyJWTError :
        conn.close()
        print('jwt錯誤')
        err_res['message']='jwt錯誤'
        return Response(json.dumps(err_res, ensure_ascii=False), status=403, content_type='application/json; charset=utf-8') 
    except Exception as err :
        conn.close()
        print(err)
        err_res['message']= err
        return Response(json.dumps(err_res, ensure_ascii=False), status=500, content_type='application/json; charset=utf-8')

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
            conn.close()
            err_res["message"] = "此信箱已被註冊"
            return Response(json.dumps(err_res, ensure_ascii=False), status=400, content_type='application/json; charset=utf-8')

        cursor.execute("INSERT INTO member(username, useremail, password) VALUES(%s, %s, %s);", (username, useremail, password))
        conn.commit() 
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
  secret_key = os.getenv('JWT_SECRET_KEY')
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
                    # expiration = issued_at + datetime.timedelta(seconds=10) 
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
                    conn.close()
                    token_res = { "token": token }
                    return Response(json.dumps(token_res, ensure_ascii=False), status=200, content_type='application/json; charset=utf-8')
                else:
                    conn.close()
                    err_res['message']='密碼輸入錯誤'
                    return Response(json.dumps(err_res, ensure_ascii=False), status=400, content_type='application/json; charset=utf-8')
            else:
                conn.close()
                err_res['message']='無此帳號'
                return Response(json.dumps(err_res, ensure_ascii=False), status=400, content_type='application/json; charset=utf-8')  
        else:
            conn.close()
            err_res['message']='request資料格式錯誤'
            return Response(json.dumps(err_res, ensure_ascii=False), status=400, content_type='application/json; charset=utf-8')
      conn.close()      
    except jwt.exceptions.PyJWTError :
        conn.close()
        print('jwt錯誤')
        err_res['message']='jwt錯誤'
        return Response(json.dumps(err_res, ensure_ascii=False), status=403, content_type='application/json; charset=utf-8') 
    except Exception as err :
        conn.close()
        err_res['message']='伺服器發生錯誤'
        return Response(json.dumps(err_res, ensure_ascii=False), status=500, content_type='application/json; charset=utf-8')
    # ============   取得當前登入的會員資料  ========================
  if req.method =='GET':
    try:
      conn = pool.get_connection()
      if conn.is_connected():
        cursor = conn.cursor()
        member_data_res = { "data": None }
        reqToken = req.headers['Authorization'].split()[1]

        decoded_token = jwt.decode(reqToken, secret_key, algorithms=['HS256'])
        member_data_res = {
            "data":{"id": decoded_token['id'],
                    'name': decoded_token['username'],
                    'email': decoded_token['useremail'],
            }}
        cursor.close()
        conn.close()
        return Response(json.dumps(member_data_res, ensure_ascii=False), status=200, content_type='application/json; charset=utf-8')
      conn.close()
    except jwt.exceptions.PyJWTError :
        conn.close()
        print('jwt錯誤')
        err_res['message']='jwt錯誤'
        return Response(json.dumps(err_res, ensure_ascii=False), status=403, content_type='application/json; charset=utf-8') 
    except Exception as err :
        conn.close()
        print(err)
        return Response(json.dumps(member_data_res, ensure_ascii=False), status=500, content_type='application/json; charset=utf-8')


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
            print(keyword)
            if keyword != None:
                print("if keyword != None")
                cursor.execute("SELECT DISTINCT mrt FROM places")
                # 先把所有捷運站名字找出來，並且不重複顯示
                mrts = cursor.fetchall()
                #==  先搜尋捷運站名字  ==  #==  先搜尋捷運站名字  ==  #==  先搜尋捷運站名字  ==  #==  先搜尋捷運站名字  ==  #==  先搜尋捷運站名字  ==  
                offset = page*12
                next_page = page+1 # offset就是設定要從第幾筆資料開始取，一頁12筆，所以要取第二頁資料就要跳過12筆
                # 如果要取第三頁資料就要跳過24筆

                # 這裡是搜尋景點的部分
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
                                print("mrt")
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
                useriddd = request.args.get('userid')
                print(f"前端傳來的id:{useriddd}")
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
                        "ok":"我的最愛"
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
            print(11111)
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
                    "ok":123
                }
                places_data.append(place)
            if len(result) < 12:
                next_page=None
            data = {
                "nextPage":next_page,
                "data": places_data
                }
            json_data = json.dumps(data, ensure_ascii=False, sort_keys=False, indent=3)
            print(222222)
            # json_data = jsonify(data)
            cursor.close()
            conn.close()
            return Response(json_data, status=200,content_type='application/json; charset=utf-8')
        
    except Exception as err :# 什麼情況下會進到except? mysql筆記裡面有！！
        print(err)
        conn.close()
        return Response(json.dumps(error_res, ensure_ascii=False), status=500, content_type='application/json; charset=utf-8')

@app.route("/api/attraction/<id>", methods = ["GET"])
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
            if result==None:
                error_res["message"]="查無景點"

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

            conn.close()
            return Response(json_data, status=200,content_type='application/json; charset=utf-8')
    except Exception as err:# 什麼情況下會進到except? mysql筆記裡面有
        print("except了")
        print(err)
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

            conn.close()
            return Response(json_data, status=200,content_type='application/json; charset=utf-8')
    except:
        print("except")
        conn.close()
        return Response(json.dumps(error_res, ensure_ascii=False), status=500, content_type='application/json; charset=utf-8')




# app.run(debug=True, host="0.0.0.0", port=3000)
app.run(debug=True, host="0.0.0.0", port=3000)
