import csv
import pymongo

myclient = pymongo.MongoClient("mongodb://localhost:27017/")

mydb = myclient["mls"]

print('1/5 Importing Players...')
collection = mydb["players"]
collection.drop()
with open('csvs/all_players.csv', encoding="utf8") as csvfile:
    reader = csv.DictReader(csvfile, delimiter=',', quotechar='"')
    for row in reader:
        x = collection.insert_one(row)

print('2/5 Importing Goalkeepers...')
collection = mydb["goalkeepers"]
collection.drop()
with open('csvs/all_goalkeepers.csv', encoding="utf8") as csvfile:
    reader = csv.DictReader(csvfile, delimiter=',', quotechar='"')
    for row in reader:
        x = collection.insert_one(row)

print('3/5 Importing events...')
collection = mydb["events"]
with open('csvs/events.csv', encoding="utf8") as csvfile:
    reader = csv.DictReader(csvfile, delimiter=',', quotechar='"')
    for row in reader:
        x = collection.insert_one(row)

print('4/5 Importing tables...')
collection = mydb["all_tables"]
collection.drop()
with open('csvs/all_tables.csv', encoding="utf8") as csvfile:
    reader = csv.DictReader(csvfile, delimiter=',', quotechar='"')
    for row in reader:
        x = collection.insert_one(row)


print('5/5 Importing matches...')
collection = mydb["matches"]
collection.drop()
with open('csvs/matches.csv', encoding="utf8") as csvfile:
    reader = csv.DictReader(csvfile, delimiter=',', quotechar='"')
    for row in reader:
        x = collection.insert_one(row)
