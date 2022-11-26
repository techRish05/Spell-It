let words = {};
async function loadWords() {
	const response = await fetch("words.json");
	const json = await response.json();
	words = json;
	return json;
}

loadWords();

function hammingDist(str1, str2) {
	let i = 0,
		count = 0,
		minLen;
	minLen = Math.min(str1.length, str2.length);
	while (i < minLen) {
		if (str1[i] == str2[i]) count++;
		else break;
		i++;
	}
	return count;
}

function min(x, y, z) {
	if (x <= y && x <= z) return x;
	if (y <= x && y <= z) return y;
	else return z;
}

function editDistDP(str1, str2, m, n) {
	let dp = new Array(m + 1);
	for (let i = 0; i < m + 1; i++) {
		dp[i] = new Array(n + 1);
		for (let j = 0; j < n + 1; j++) {
			dp[i][j] = 0;
		}
	}
	for (let i = 0; i <= m; i++) {
		for (let j = 0; j <= n; j++) {
			if (i == 0) dp[i][j] = j; // Min. operations = j
			else if (j == 0) dp[i][j] = i; // Min. operations = i
			else if (str1[i - 1] == str2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
			else
				dp[i][j] =
					1 +
					min(
						dp[i][j - 1], // Insert
						dp[i - 1][j], // Remove
						dp[i - 1][j - 1]
					); // Replace
		}
	}
	return dp[m][n];
}

function handleCorrectClick(clicked) {
	document.getElementById("enteredWord").value = clicked;
}
// Driver code
async function handleClick() {
	let userWord = document.getElementById("enteredWord").value;
	let resultDiv = document.getElementById("result");

	let isCorrect = false;
	if (userWord in words) {
		resultDiv.innerHTML = "<p>Spelled Correctly!</p>";
		isCorrect = true;
	} else {
		Object.entries(words).forEach(([k, v]) => {
			let dist = editDistDP(userWord, k, userWord.length, k.length);
			words[k] = dist;
		});

		const sortable = Object.fromEntries(Object.entries(words).sort(([, a], [, b]) => a - b));
		const top10 = Object.keys(sortable).slice(0, 6);

		document.getElementById("databaseAdd").classList.remove("d-none");
		resultDiv.innerHTML = "";
		top10.forEach((word) => {
			resultDiv.innerHTML += `<input type="button" class="btn btn-outline-secondary mx-1" id =${word} onClick="handleCorrectClick(this.id)" value="${word}"></input>`;
		});
	}

	let res = await fetch("/addSearchedWord", {
		method: "POST",
		mode: "cors",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ word: userWord, isCorrect: isCorrect }),
	});
}

async function handleAddToDatabase() {
	let userWord = document.getElementById("enteredWord").value;
	document.getElementById("databaseAdd").value = "Adding";
	const response = await fetch("/addNewWord", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ word: userWord }),
	});
	document.getElementById("databaseAdd").value = "Added";
	console.log(response);
}
