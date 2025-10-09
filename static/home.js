const { createApp } = Vue;

let print = console.log

const vue = createApp({
	data() {
		return {
			vue: null,
			items: [],
			paths: new Set(),

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
			hrDifficultyStrings: ["Easy", "Medium", "Hard", "Advanced", "Expert"],

			newProblem: {},
		}
	},
	methods: {
		setSortBy(param) {
			if (this.sortBy == param) {
				this.sortAsc = !this.sortAsc
			} else {
				this.sortBy = param;
				this.sortAsc = true
			}
		},
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
			this.item.description = this.item.description.trim()

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

					URL.revokeObjectURL(downloadLink.href);
				})
				.catch(error => print('Error fetching problems:', error));
		},

		initNewProblemModal() {
			const date = new Date()
			const year = date.getFullYear();
			const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
			const day = date.getDate().toString().padStart(2, '0');
			const timestamp = `${year}-${month}-${day}`;
			
			this.newProblem = {
				name: "",
				path: "Others",
				creation: timestamp,
				difficulty: 1,
				status: "Idea",
				tags: [],
				tagsText: ""
			}
		},

		saveNewProblem() {
			const endpoint = "/newProblem"
			fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(this.newProblem)
			})
				.then(response => {
					if (response.ok) {
						console.log("Created new problem successfully!")
						
						const newItem = JSON.parse(JSON.stringify(this.newProblem))
						newItem.path += "/"+newItem.name
						newItem.previousVersion = JSON.parse(JSON.stringify(newItem));
						vue.items.push(newItem)

						// vue.initNewProblemModal()
					} else {
						alert('Failed to save new problem!');
					}
				})
				.catch(error => {
					console.error('Error saving new problem:', error);
					alert('Error saving new problem.');
				});
		},
		openProblem(item) {
			const endpoint = "/open"
			fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(item)
			})
				.then(response => {
					if (response.ok) {
						console.log("Opened problem successfully!")
					} else {
						alert('Failed to open problem!');
					}
				})
				.catch(error => {
					console.error('Error opening problem:', error);
					alert('Error opening problem.');
				});
		},
		openStatement(item) {
			console.log(item.path)
			this.openLink("statement/"+item.path)
		}
	},
	mounted() {
		this.vue = this
		const vue = this
		this.initNewProblemModal()
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

		vue.paths = new Set()
		fetch('/problems')
			.then(response => response.json())
			.then(data => {
				this.items = data;
				this.items.forEach(item => {
					item.tagsText = item.tags.join(", ")
					item.previousVersion = JSON.parse(JSON.stringify(item));

					vue.paths.add(vue.getPathWithoutName(item))
				});
				
				console.log(vue.paths)
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