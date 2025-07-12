document.getElementById('options').addEventListener('click', () => {
	chrome.runtime.openOptionsPage();
});

const fill = (rsp) => {
	const o = document.getElementById('list');
	o.innerHTML = '';
	rsp.forEach((item, idx) => {
		const row = document.createElement('div');
		row.className = 'btn';
		row.innerHTML = `<div>${idx}.</div><div>${item.name}</div>`;
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
			'mode': 'system',
		},
	},
	{
		name: 'Direct',
		cfg: {
			'mode': 'direct',
		},
	},
]);
