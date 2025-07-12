document.getElementById('options').addEventListener('click', () => {
	chrome.runtime.openOptionsPage();
});

const fill = (rsp) => {
	const o = document.getElementById('list');
	o.innerHTML = '';
	rsp.forEach((item) => {
		const row = document.createElement('div');
		row.className = 'btn';
		let serial = `<div>${idx}.</div>`;
		if (!['system', 'direct'].includes(item.cfg?.mode)) {
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
