document.getElementById('options').addEventListener('click', () => {
	chrome.runtime.openOptionsPage();
});

const fill = (rsp) => {
	const o = document.getElementById('list');
	o.innerHTML = '';
	console.log(rsp);
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
		row.innerHTML = `${idx}<div>${a.name} ${a.serial}</div>`;
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

chrome.runtime?.sendMessage({
	action: 'getList',
}, fill);
