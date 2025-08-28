import os
from datetime import date
import json

class ProblemData:
	name: str = ""
	path: str = ""
	tags: list[str] = []
	difficulty: int = 1
	status: str = "Idea"
	hasHRInfo: bool = False
	hasGen: bool = False

	description: str = ""
	link: str = ""
	creation: date = None

	def to_dict(self):
		return {
			"name": self.name,
			"path": self.path,
			"tags": self.tags,
			"difficulty": self.difficulty,
			"status": self.status,
			"hasHRInfo": self.hasHRInfo,
			"hasGen": self.hasGen,
			"description": self.description,
			"link": self.link,
			"creation": self.creation.isoformat() if self.creation else None
		}
	
	@classmethod
	def from_json(cls, jsonFile, dirData):
		with open(jsonFile, 'r') as file:
			
			data = json.load(file)
			obj = cls()
			obj.name = dirData["name"]
			obj.path = dirData["path"]
			obj.tags = data.get("tags", [])
			obj.difficulty = data.get("difficulty", 1)
			obj.status = data.get("status", "Idea")
			obj.hasHRInfo = dirData["hasHRInfo"]
			obj.hasGen = data.get("hasGen", False)
			obj.description = data.get("description", "")
			obj.link = data.get("link", "")
			creation = data.get("creation")
			obj.creation = date.fromisoformat(creation) if creation else None
			return obj
		return None
	
	def to_json(self):
		print(self.to_dict())
		return json.dumps(self.to_dict())




def parseProblemCatalog(path: str) -> list[dict]:
	print("Parsing problem catalog...")
	print(path)

	pathLength = len(path)

	res = []
	for root, dirs, files in os.walk(path):
		if not files or len(files)==0: continue
		if "scribe.json" not in files: continue

		root = root.replace("\\", "/")
		splitPath = root.split("/")

		if splitPath[-1] == "Template": continue

		dirData = {
			"name": splitPath[-1],
			"path": root[pathLength+1:],
			"hasHRInfo": "hr_info" in dirs
		}

		problemData = ProblemData.from_json(os.path.join(root, "scribe.json"), dirData)
		res.append(problemData)
	
	# data = [
	# 	ProblemData(),
	# 	ProblemData()
	# ]


	return list(map(lambda data: data.to_dict(), res))