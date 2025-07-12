(() => {
	document.getElementById('options-link').addEventListener('click', () => {
		chrome.runtime.openOptionsPage();
	});
})();
