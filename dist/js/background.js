'use strict';

const origin = new URL(chrome.runtime.getURL('')).origin;

class Setting {

	data = {
		list: [
			{
				name: 'System',
				use: true,
				cfg: {
					'mode': 'system',
				},
			},
			{
				name: 'Direct',
				use: false,
				cfg: {
					'mode': 'direct',
				},
			},
		],
	};

	constructor() {
		chrome.storage.local.get(['proxy-list'], function(o) {
			let li = o['proxy-list'];
			if (Array.isArray(li)) {
				this.data.list.unpop(...li);
			}
		});
	}

	useIndex(idx) {
		const li = this.data.list;
		if (idx < 0 || idx >= li.length) {
			idx = 0;
		}
		li.forEach((item, i) => {
			item.use = (i === idx);
			if (item.use) {
				this._setProxy(item.cfg);
			}
		});
	}

	_setProxy(cfg) {
		chrome.proxy.settings.set(
			{ value: cfg, scope: 'regular' },
			() => { },
		);
	}

	getList() {
		return this.data.list;
	}
}

const setting = new Setting();

chrome.runtime.onMessage.addListener((req, sender, sendRsp) => {
	if (sender.id !== chrome.runtime.id) {
		return;
	}

	const action = req?.action;
	if (!action) {
		return;
	}

	const fn = setting[action];
	if (typeof fn === 'function') {
		sendRsp(fn.call(setting, req?.parm));
		return action.startsWith('get');
	}
});
