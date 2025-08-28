import json
import os

class Config:
	_instance = None
	defaultPath: str
	templatePath: str
	cliEnabled: bool
	ignorePathsInManifest: list[str]

	def __parseConfig(self):
		config_path = os.path.join(os.path.dirname(__file__), "config.json")
		with open(config_path, "r") as f:
			config_data = json.load(f)
		return config_data

	def __new__(cls, *args, **kwargs):
		if cls._instance is None:
			cls._instance = super().__new__(cls)
			
			inst = cls._instance
			data = inst.__parseConfig()

			inst.defaultPath = str(data["defaultPath"])
			inst.cliEnabled = bool(data["cliEnabled"])
			inst.ignorePathsInManifest = list(data["ignorePathsInManifest"])
			inst.templatePath = str(data["templatePath"])
		return cls._instance