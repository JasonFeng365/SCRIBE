const { createApp } = Vue;

let print = console.log

const vue = createApp({
	data() {
		return {
			vue: null,
			items: [],

			nameFilter: "",
			nameFilterEditingEnabled: true,
			nameFilterValue: true,
			tagsFilter: "",
			tagsFilterEditingEnabled: true,
			tagsFilterValue: true,

			hasGenFilterEnabled: false,
			hasGenFilterValue: true,
			hasHRInfoFilterEnabled: false,
			hasHRInfoFilterValue: true,
			doneFilterEnabled: false,
			doneFilterValue: true,
			
			sortBy: "path",
			sortAsc: true,

			lastActive: null,
			
			hrItem: null,
			// id, name, difficulty, preview, samples, sampleDataMap
			hrInfo: {},

			hrDifficultyStrings: ["Easy", "Medium", "Hard", "Advanced", "Expert"]
		}
	},
	methods: {
		openLink(link) {
			window.open(link, '_blank')
		},
		getPathWithoutName(item) {
			let idx = item.path.lastIndexOf("/")
			if (idx==-1) return ""
			return item.path.substring(0, idx)
		},
		sortItems(arr) {
			let compare;
			switch (this.sortBy) {
				case 'creation':
					compare = (a, b) => new Date(a.creation) - new Date(b.creation);
					break;
				case 'difficulty':
					compare = (a, b) => a.difficulty - b.difficulty;
					break;
				case 'name':
					compare = (a, b) => (a.name || '').localeCompare(b.name || '');
					break;
				case 'path':
					compare = (a, b) => (a.path || '').localeCompare(b.path || '');
					break;
				default:
					return;
			}
			arr.sort((a, b) => {
				const result = compare(a, b);
				return this.sortAsc ? result : -result;
			});
		},
		filterTags(arr) {
			let tagsArray = this.tagsFilter.toLowerCase().split(/\s+/).filter(Boolean);
			return arr.filter(item => {
				return tagsArray.every(tag => item.tagsText.includes(tag)) == this.tagsFilterValue;
			})
		},
		filterItems () {
			var res = this.items

			if (this.hasGenFilterEnabled) {
				res = res.filter(item => item.hasGen==this.hasGenFilterValue)
			}
			if (this.hasHRInfoFilterEnabled) {
				res = res.filter(item => item.hasHRInfo==this.hasHRInfoFilterValue)
			}
			if (this.doneFilterEnabled) {
				res = res.filter(item => (item.status=="Done")==this.doneFilterValue)
			}

			if (this.nameFilterEditingEnabled && this.nameFilter.trim()) {
				const filter = this.nameFilter.trim().toLowerCase();
				res = res.filter(item =>
					(
						(item.name && item.name.toLowerCase().includes(filter)) ||
						(item.path && item.path.toLowerCase().includes(filter))
					) == this.nameFilterValue
				);
			}

			if (this.tagsFilterEditingEnabled && this.tagsFilter.trim()) {
				res = this.filterTags(res)
			}


			this.sortItems(res)

			return res
		},
		saveChanges(item) {
			this.setItemTags(item)

			fetch(`/save/${item.path}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(item),
			})
				.then(data => {
					if (data.ok) {
						item.hasUnsavedChanges = false;
						item.previousVersion = JSON.parse(JSON.stringify(item));
						console.log("Saved data successfully!")
						console.log(item)
					} else {
						alert('Failed to save changes.');
					}
				})
				.catch(error => {
					console.error('Error saving changes:', error);
					alert('Error saving changes.');
				});

		},
		revertChanges(item) {
			for (const key in item.previousVersion) {
				item[key] = item.previousVersion[key];
			}
			item.hasUnsavedChanges = false;
		},
		setItemTags(item) {
			const newTags = item.tagsText
			const tagsArr = newTags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length)
			console.log(newTags)
			console.log(tagsArr)
			item.tags = tagsArr
			item.tagsText = tagsArr.join(', ');
			this.$forceUpdate();
		},
		openHRInfoEditor(item) {
			console.log("Opening HR info editor...")
			this.hrItem = item
			this.hrInfo = {}
			
			let endpoint = `/hr/getExtraInfo/${item.path}`
			if (item.hasHRInfo) {
				fetch(endpoint, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
				})
					.then(response => response.json())
					.then(response => {
						console.log(response)
						this.hrInfo = response
						this.hrInfo.initialized = true
						this.hrInfo.difficultyString = this.hrDifficultyStrings[this.hrInfo.difficulty]
						console.log("Loaded HR info successfully!")
					})
					.catch(error => {
						console.error('Error loading HR info:', error);
						alert('Error loading HR info.');
					});
			}
			
		},
		saveHRInfo() {
			console.log("Saving HR info editor...")
			if (this.hrInfo.id==="") delete this.hrInfo.id
			this.hrInfo.difficulty = this.hrDifficultyStrings.indexOf(this.hrInfo.difficultyString)
			console.log(this.hrInfo)
			
			
			let endpoint = `/hr/setExtraInfo/${this.hrItem.path}`
			fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(this.hrInfo)
			})
				.then(response => response.json())
				.then(response => {
					console.log(response)
					console.log("Saved HR info successfully!")
				})
				.catch(error => {
					console.error('Error saving HR info:', error);
					alert('Error saving HR info.');
				});
			
		},
		setupNewIntegration() {
			const vue = this
			let endpoint = `/hr/newIntegration/${this.hrItem.path}`

			console.log(endpoint)

			const body = {}
			if (this.hrInfo.id) body.id = this.hrInfo.id

			fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body)
			})
				.then(response => {
					if (response.ok) {
						console.log("Saved HR info successfully!")
						vue.hrItem.hasHRInfo = true

						this.openHRInfoEditor(this.hrItem)
					} else {
						alert('Failed to save HR info.');
					}
				})
				.catch(error => {
					console.error('Error saving HR info:', error);
					alert('Error saving HR info.');
				});
		},

		getManifest() {
			fetch('/generatePublicManifest')
				.then(response => response.json())
				.then(async data => {

					const jsonString = JSON.stringify(data, null, '\t');
					const blob = new Blob([jsonString], { type: 'application/json' });

					const downloadLink = document.createElement('a');
					downloadLink.href = URL.createObjectURL(blob);
					downloadLink.download = "manifest.json";

					document.body.appendChild(downloadLink);
					downloadLink.click();
					document.body.removeChild(downloadLink);

					URL.revokeObjectURL(downloadLink.href); // Release the object URL
					// try {
					// 	// Convert the JavaScript object to a JSON string
					// 	const jsonString = JSON.stringify(data, null, 2); // null and 2 for pretty-printing

					// 	// Create a Blob from the JSON string
					// 	const blob = new Blob([jsonString], { type: 'application/json' });

					// 	// Prompt the user to choose a save location and file name
					// 	const fileHandle = await window.showSaveFilePicker({
					// 	suggestedName: "manifest.json",
					// 	types: [{
					// 		description: 'JSON Files',
					// 		accept: {
					// 		'application/json': ['.json'],
					// 		},
					// 	}],
					// 	});

					// 	// Create a WritableStream to write the Blob content to the chosen file
					// 	const writableStream = await fileHandle.createWritable();
					// 	await writableStream.write(blob);
					// 	await writableStream.close();

					// 	console.log('JSON file saved successfully!');

					// } catch (error) {
					// 	if (error.name === 'AbortError') {
					// 	console.log('File save operation cancelled by the user.');
					// 	} else {
					// 	console.error('Error saving JSON file:', error);
					// 	}
					// }
				})
				.catch(error => print('Error fetching problems:', error));
		}
	},
	mounted() {
		this.vue = this
		const vue = this
		// https://stackoverflow.com/questions/4446987/overriding-controls-save-functionality-in-browser
		document.addEventListener(
			"keydown",
			function (e) {
				if ((e.metaKey || e.ctrlKey) && e.code === "KeyS") {
					if (vue.lastActive == null) return
					vue.saveChanges(vue.lastActive)
					e.preventDefault(); // Prevent default browser behavior
				}
			},
			false
		);

		fetch('/problems')
			.then(response => response.json())
			.then(data => {
				this.items = data;
				this.items.forEach(item => {
					item.tagsText = item.tags.join(", ")
					item.previousVersion = JSON.parse(JSON.stringify(item));
				});
			})
			.catch(error => print('Error fetching problems:', error));
	}
}).mount('#app');

window.onbeforeunload = function() {
	const unsavedItems = vue.items.filter(item => item.hasUnsavedChanges);
	if (unsavedItems.length > 0) {
		const itemNames = unsavedItems.map(item => item.name).join(', ');
		return `You have unsaved changes in the following items: ${itemNames}. Are you sure you want to leave?`;
	}
};