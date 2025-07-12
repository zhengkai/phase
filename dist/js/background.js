'use strict';

const origin = new URL(chrome.runtime.getURL('')).origin;

const converSetting = (name, mode, path) => {
	console.log('converSetting', name, mode, path);

	let cfg = {};
	if (mode === 'pac') {
		cfg = {
			mode: 'auto_detect',
			pacScript: {
				url: path,
				mandatory: true,
			}
		};
	} else {
		cfg = {
			mode: 'fixed_servers',
			rules: {
				singleProxy: {
					scheme: 'socks5',
					host: '1.2.3.4',
					port: 1080,
				},
				bypassList: [],
			}
		};
	}
	return {
		name,
		cfg,
	}
};

class Setting {

	data = {
		list: [],
	};

	constructor() {
		chrome.storage.local.get(['proxy-list'], function(o) {
			let li = o['proxy-list'];
			if (Array.isArray(li)) {
				this.data.list = li;
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
				// this._setProxy(item.cfg);
			}
		});
	}

	_setProxy(cfg) {
		chrome.proxy.settings.set(
			{ value: cfg, scope: 'regular' },
			() => { },
		);
	}

	setList(li) {
		console.log('setList', li);
		this.data.list = li;
		chrome.storage.local.set({ 'proxy-list': li });
		return true;
	}

	getList() {
		const re = (this.data.list?.length ? this.data.list : []).concat(...[
			{
				name: 'System',
				mode: 'system',
				path: '',
			},
			{
				name: 'Direct',
				mode: 'direct',
				path: '',
			},
		]);
		console.log('getList', re);
		return re;
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
