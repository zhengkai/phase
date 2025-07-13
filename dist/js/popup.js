document.getElementById('options').addEventListener('click', () => {
	chrome.runtime.openOptionsPage();
});

const fill = (rsp) => {
	const o = document.getElementById('list');
	o.innerHTML = '';
	rsp.list.forEach((a, idx) => {
		const row = document.createElement('div');
		row.classList.add('btn');
		if (rsp.use === a.serial) {
			row.classList.add('active');
		}
		if (['system', 'direct'].includes(a.mode)) {
			idx = '<div></div>';
		} else {
			idx = `<div>${idx + 1}.</div>`;
		}
		row.innerHTML = `${idx}<div>${a.name}</div>`;
		o.appendChild(row);
		row.addEventListener('click', () => {
			chrome.runtime.sendMessage({
				action: 'useProxy',
				parm: a.serial,
			});
			window.close();
		});
	});
};

(async () => {

	while (true) {
		const re = await chrome.runtime?.sendMessage({
			action: 'getInit',
		});
		if (re) {
			break;
		}
		await new Promise((resolve) => setTimeout(resolve, 100));
	}
	chrome.runtime?.sendMessage({
		action: 'getList',
	}, fill);
})()
