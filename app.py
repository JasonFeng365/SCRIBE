from flask import Flask
from flask import render_template, send_from_directory, request, jsonify
import problems
import os
import json
import shutil
from config import Config
import subprocess

app = Flask(__name__)


def getJson(path):
	with open(path, 'r') as file:
		return json.load(file)
	return {}


@app.route('/')
def home():
	return 'Hello, Flask!'

@app.route('/home')
def serve_home():
	return send_from_directory('static', 'home.html')

@app.route('/problems')
def get_problems():
	return problems.parseProblemCatalog(Config().defaultPath)

@app.route('/save/<path:problem_path>', methods=['POST'])
def save_problem(problem_path):
	try:
		data = request.json
		full_path = os.path.join(Config().defaultPath, problem_path, "scribe.json")
		if not os.path.exists(full_path):
			print(f"Path not found in save_problem: {problem_path}")
			return {}, 404

		res = {
			"tags": data["tags"],
			"difficulty": data["difficulty"],
			"status": data["status"],
			"hasGen": data["hasGen"],
			"description": data["description"],
			"creation": data["creation"],
			"link": data["link"],
		}
		
		with open(full_path, 'w') as f:
			json.dump(res, f, indent='\t')

		
		return {}, 200
	except Exception as e:
		print(f"Error saving problem: {e}")
		return {}, 500

@app.post('/hr/newIntegration/<path:problem_path>')
def generate_hr_new_integration(problem_path):
	data = request.json
	cmd = ["hr", "init", problem_path]
	if "id" in data:
		id = data["id"]
		print(f"Generating new HR integration for ID: {id}")
		cmd.append(str(id))
	else:
		print("Generating new HR integration without a specific ID")

	res = subprocess.call(cmd, cwd=Config().defaultPath, shell=True)
	print(res)

	return {}, 200


@app.route('/hr/setExtraInfo/<path:problem_path>', methods=['POST'])
def setExtraInfo(problem_path):
	try:
		data = request.json
		full_path = os.path.join(Config().defaultPath, problem_path, "hr_info", "hr_extra_info.json")
		if not os.path.exists(full_path):
				print(f"Path not found in setExtraInfo: {problem_path}")
				return {"success": False}, 404
		
		res = {
			"name": data["name"],
			"difficulty": data["difficulty"],
			"preview": data["preview"],
			"tags": data["tags"],
			"samples": data["samples"],
			"sampleDataMap": data["sampleDataMap"]
		}
		
		with open(full_path, 'w') as f:
			json.dump(res, f, indent='\t')

		
		if "id" in data:
			idPath = os.path.join(Config().defaultPath, problem_path, "hr_info", "hr_pid.txt")
			with open(idPath, 'w') as f:
				f.write(str(data["id"]))
				f.flush()
		else:
			idPath = os.path.join(Config().defaultPath, problem_path, "hr_info", "hr_pid.txt")
			if os.path.exists(idPath):
				os.remove(idPath)
		return {"success": True}, 200
	except Exception as e:
		print(f"Error in setExtraInfo: {e}")
		return {"success": False}, 500


@app.route('/hr/getExtraInfo/<path:problem_path>', methods=['GET'])
def getExtraInfo(problem_path):
	extraInfoPath = os.path.join(Config().defaultPath, problem_path, "hr_info", "hr_extra_info.json")
	if not os.path.exists(extraInfoPath):
		return {}, 404
	
	data = getJson(extraInfoPath)

	idPath = os.path.join(Config().defaultPath, problem_path, "hr_info", "hr_pid.txt")
	if os.path.exists(idPath):
		with open(idPath, 'r') as f:
			pid = int(f.readline().strip())
			data["id"] = pid

	return data, 200

def getDir(path):
	arr = path.split("/")
	return "/".join(arr[:-1])

@app.get("/generatePublicManifest")
def generatePublicManifest():
	ignoredPaths = set(Config().ignorePathsInManifest)
	def filterPath(problem):
		return getDir(problem["path"]) not in ignoredPaths
	
	totalProblems = len(get_problems())

	problems = list(filter(filterPath, get_problems()))
	for p in problems:
		del p["hasGen"]
		del p["hasHRInfo"]
		del p["status"]
	return {
		"totalProblems": totalProblems,
		"problems": problems
	}

@app.post("/newProblem")
def newProblem():
	try:
		data = request.json
		
		full_path = os.path.join(Config().defaultPath, data["path"], data["name"])
		if os.path.exists(full_path):
			print(f"newProblem: Path {full_path} already exists!")
			return {}, 404

		shutil.copytree(Config().templatePath, full_path, False, None)
		
		# # Copy contents of templatePath to full_path
		# for item in os.listdir(Config().templatePath):
		# 	s = os.path.join(Config().templatePath, item)
		# 	d = os.path.join(full_path, item)
		# 	if os.path.isdir(s):
		# 		shutil.copytree(s, d, False, None)
		# 	else:
		# 		shutil.copy2(s, d)



		scribe_file_path = os.path.join(Config().defaultPath, data["path"], data["name"], "scribe.json")
		res = {
			"tags": data["tags"],
			"difficulty": data["difficulty"],
			"status": data["status"],
			"hasGen": False,
			"description": data["description"],
			"creation": data["creation"],
			"link": "" if "link" not in data else data["link"],
		}
		
		with open(scribe_file_path, 'w') as f:
			json.dump(res, f, indent='\t')

		
		return {}, 200
	except Exception as e:
		print(f"Error saving problem: {e}")
		print(e)
		return {}, 500

@app.post("/open")
def openProblem():
	try:
		data = request.json
		full_path = os.path.join(Config().defaultPath, data["path"])

		cmd = ["code", full_path]
		subprocess.call(cmd, cwd=Config().defaultPath, shell=True)
		return {}, 200
	except Exception as e:
		print(f"Error opening problem: {e}")
		return {}, 500

@app.post("/openStatement")
def openStatement():
	try:
		data = request.json
		full_path = os.path.join(Config().defaultPath, data["path"], data["name"]+".pdf").replace("\\", "/")
		print(full_path)


		return {"path": full_path}, 200
	except Exception as e:
		print(f"Error opening problem: {e}")
		return {}, 500

@app.route('/statement/<path:problem_path>', methods=['GET'])
def getPdf(problem_path):
	if ".." in problem_path:
		return "Forbidden", 403

	path = problem_path
	name = problem_path.split("/")[-1]+".pdf"
	file_path = os.path.join(Config().defaultPath, path)



	return send_from_directory(file_path, name)


import webbrowser
if __name__ == '__main__':
	url = "http://localhost:212/home"
	print(url)
	
	app.run(debug=True, port=212)

