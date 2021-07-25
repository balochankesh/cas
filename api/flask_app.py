import pyrebase
from flask import Flask,jsonify, request, redirect, render_template, url_for
import json
from datetime import datetime
import uQR
import gspread
from oauth2client.service_account import ServiceAccountCredentials

config1 = json.load(open("/home/starlordb/mysite/config1.json","r"))
firebase = pyrebase.initialize_app(config1)
db = firebase.database()

#google sheets config
# define the scope
scope = ['https://spreadsheets.google.com/feeds','https://www.googleapis.com/auth/drive']

# add credentials to the account
creds = ServiceAccountCredentials.from_json_keyfile_name('/home/starlordb/mysite/gsheet-9aab2387abb4.json', scope)

# authorize the clientsheet
client = gspread.authorize(creds)
inst = client.open("CAS").sheet1

def append_to_sheet(name , rno , present , time):

    inst.append_row([name,rno,present,time])





app = Flask(__name__)


@app.route("/post/<mac>/<data>/")

def post(data,mac):

    #new_event = {"name":"ankesh","age":21}
    #db.child("events").child("students").set(new_event)
    success = False
    color = "red"
    dat = db.get().val()

    if data == str(dat["data"]):
        for key,val in dat["students"].items():
            if val.get("mac","") == mac:
                if (not key in dat.get("attendence").keys()):
                    message = "Present Marked"
                    color = "green"
                    success = True
                    post = {"present": True,"time":str(datetime.now())}
                    db.child("attendence").child(val["roll_no"]).set(post)
                    append_to_sheet(val["first_name"]+" "+ val["last_name"],val["roll_no"],"yes",str(datetime.now()))
                else:
                    message = "Already Marked"
                    color = "orange"
            else:
                message = "Student Not Found"

    else:
        message = "Wrong QRcode"


    return {"success":success,"message":message,"color":color}




@app.route("/getMatrix")
def getMatrix():
    data = db.get().val()
    qr = uQR.QRCode()
    qr.add_data(data.get("data"))
    matrix = qr.get_matrix()

    return jsonify({"matrix":matrix, "total":len(data["students"].keys()),"present":len(data["attendence"].keys())})


if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5050 ,debug=True)
