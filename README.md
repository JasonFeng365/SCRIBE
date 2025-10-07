# SCRIBE
**S**pecialty **C**hallenge **R**epository **I**n-**B**rowser **E**ditor

## What is Scribe?

Scribe is a locally-hosted web application designed to help you manage a repository of programming challenges. It provides a rich, in-browser user interface to view, edit, create, and organize your problems, all without needing an internet connection.

## Installation

```
git clone https://github.com/JasonFeng365/SCRIBE
cd SCRIBE
python app.py
```

## Stack

- **Frontend**: Vue.js, Bootstrap
- **Backend**: Flask

## Features
- Scribe runs entirely on your local machine. No internet connection required.
- View and edit problem metadata directly from your web browser. Changes are saved back to the `scribe.json` files on your disk.
- Easily create new problems from a pre-configured template directory.
- Filters and sorting allows for custom views of your problem catalog:
    - Filter problems by name or path.
    - Filter by tags, with options to include or exclude problems containing specific tags.
    - Filter by status, such as whether a problem has a generator (`hasGen`), is integrated with HackerRank (`hasHRInfo`), or is marked as `Done`.
    - Sort your problem list by path, name, difficulty, or creation date in ascending or descending order.
- Generate a public `manifest.json` file for your problem set, with the ability to exclude specific directories.
- Open problem folders directly in Visual Studio Code.
- Open problem statement PDFs in a new browser tab.
- **HackerRank/SeleneHR Integration**: Manage HackerRank-specific information for your problems through a dedicated modal. Requires [SeleneHR](https://github.com/JasonFeng365/selenehr/) to be installed.

## Workflow

The server uses a `config.json` file in the root directory to understand your setup:

```json
{
	// Path containing your problem folders. Each problem must have its own sub-folder.
	// See samples/SampleProblemFolder for an example of a problem, and two problems within a path.
	"defaultPath": "C:/Users/jason/Documents/GitHub/ContestProblems",
	// Set to true if SeleneHR can be used from defaultPath, and false if not.
	"cliEnabled": true,
	// These paths won't be included in the public manifest.
	"ignorePathsInManifest": ["Others"],
	// Path of a sample template, copied into your directory when a problem is created from the web interface.
	// See samples/Template for an example of a problem template.
	"templatePath": "C:/Users/jason/Documents/GitHub/ContestProblems/Template"
}
```

Server scans through files in `defaultPath` and looks for directories containing `scribe.json`:

```json
{
	"tags": ["hidden"],
	"difficulty": 1,
	"status": "Done",
	"hasGen": true,
	"description": "...",
	"creation": "2022-09-14"
}
```
