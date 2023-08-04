from flask import Flask
from flask import render_template
import json
from bson import json_util, ObjectId

import pymongo
myclient = pymongo.MongoClient("mongodb://localhost:27017/")

mydb = myclient["mls"]

server = Flask(__name__)


@server.route("/")
def indexRoute():
    return render_template("app.html", title='MLS Dashboard')


@server.route("/players/all")
def playersNames():
    collection = mydb["players"]
    res = collection.distinct('Player')
    return res


@server.route("/players/<name>")
def findPlayerByName(name):
    collection = mydb["players"]
    res = collection.find({"Player": name}).sort("Year")
    return json.loads(json_util.dumps(res))


@server.route("/clubs/1st")
def clubs():
    collection = mydb["all_tables"]
    res = collection.aggregate([{
        "$match": {
            "Pos": "1.0"
        },
    }, {
        "$group": {
            "_id": "$Team",
            "total": {"$sum": 1}
        }
    }, {
        "$sort": {"total": -1}
    }])

    return json.loads(json_util.dumps(res))


@server.route("/clubs/avg")
def avgClubs():
    collection = mydb["all_tables"]
    res = collection.aggregate([{
        "$match": {
            "Pos": {"$ne": ""}
        }
    }, {
        "$addFields": {
            "convertedPos": {'$toDecimal': "$Pos"},
        }
    }, {
        "$group": {
            "_id": "$Team",
            "total": {"$avg": "$convertedPos"}
        }
    }, {
        "$sort": {"total": 1}
    }])

    return json.loads(json_util.dumps(res))


@server.route("/years")
def goalsByYear():
    collection = mydb["players"]
    res = collection.aggregate([{
        "$addFields": {
            "convertG": {'$toDecimal': "$G"},
        }
    }, {
        "$group": {
            "_id": "$Year",
            "total": {"$sum": "$convertG"}
        }
    }, {
        "$sort": {"_id": 1}
    }])

    return json.loads(json_util.dumps(res))


if __name__ == '__main__':
    server.run(debug=True)

