document.getElementById('options').addEventListener('click', () => {
	chrome.runtime.openOptionsPage();
});

const fill = (rsp) => {
	const o = document.getElementById('list');
	o.innerHTML = '';
	console.log(rsp);
	rsp.forEach((item, idx) => {
		const row = document.createElement('div');
		row.className = 'btn';
		let serial = `<div>${idx + 1}.</div>`;
		if (['system', 'direct'].includes(item.mode)) {
			serial = '<div></div>';
		}
		row.innerHTML = `${serial}<div>${item.name}</div>`;
		o.appendChild(row);
		row.addEventListener('click', () => {
			chrome.runtime.sendMessage({
				action: 'useIndex',
				parm: idx,
			});
			window.close();
		});
	});
};

chrome.runtime?.sendMessage({
	action: 'getList',
}, fill) || fill([
	{
		name: 'System',
		cfg: {
			mode: 'system',
		},
	},
	{
		name: 'Direct',
		cfg: {
			mode: 'direct',
		},
	},
]);
