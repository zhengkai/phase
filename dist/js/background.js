'use strict';

const origin = new URL(chrome.runtime.getURL('')).origin;

const specMode = ['system', 'direct'];

class Setting {

	init = false;

	serial = 0;
	use = 0;
	list = [];

	constructor() {
		chrome.storage.local.get(['list', 'use', 'serial'], (o) => {
			console.log('local.get', o);
			const serial = o.serial | 0;
			let li = o.list || [];
			let maxSerial = 0;
			if (li?.length) {
				this.list = li;
				let save = false;
				li.forEach((o) => {
					if (!(o.serial > 0)) {
						o.serial = this.genSerial();
						save = true;
					}
					if (maxSerial < o.serial) {
						maxSerial = o.serial;
					}
					if (save) {
						chrome.storage.local.set({ list: li });
					}
				});
			}
			if (maxSerial < serial) {
				maxSerial = serial;
			}
			this.serial = maxSerial;
			this.useProxy(o.use | 0);

			this.init = true;

			console.log('init', serial, o.use, this.list);
		});
		chrome.proxy.settings.get(
			{ 'incognito': false },
			function(cfg) {
				console.log('init proxy get', JSON.stringify(cfg));
			}
		);
	}

	useProxy(serial) {
		let p = null;
		for (const o of this.getList().list) {
			if (o.serial === serial) {
				p = o;
				break;
			}
		}
		if (!p) {

			console.log('useProxy ', serial, this.getList().list);

			this.useProxy(-1);
			return;
		}
		chrome.storage.local.set({ use: serial });
		this.use = serial;
		this._setProxy(p.mode, p.path);
	}

	_makeProxyCfg(mode, path) {
		if (specMode.includes(mode)) {
			return {
				mode,
			};
		}
		if (mode === 'pac') {
			return {
				mode: 'pac_script',
				pacScript: {
					url: path,
					mandatory: false, // comment in doc : If true, an invalid PAC script will prevent the network stack from falling back to direct connections. Defaults to false.
				},
			}
		}
		const [host, port] = path.split(':');
		return {
			mode: 'fixed_servers',
			rules: {
				singleProxy: {
					scheme: mode,
					host,
					port: parseInt(port, 10),
				},
				bypassList: ['localhost', '127.0.0.1'],
			}
		};
	}

	_setProxy(mode, path) {
		const cfg = this._makeProxyCfg(mode, path);
		console.log('_set proxy', cfg);
		chrome.proxy.settings.set(
			{ value: cfg, scope: 'regular' },
			() => { },
		);
	}

	setList(li) {
		this.list = li;
		this.useProxy(this.use);
		console.log('save', this.use, li);
		chrome.storage.local.set({ list: li });
		return true;
	}

	getInit() {
		return this.init;
	}

	genSerial() {
		this.serial++;
		console.log('save serial', this.serial);
		chrome.storage.local.set({ serial: this.serial });
		return this.serial;
	}

	getList() {
		const list = this.list.concat(...[
			{
				name: 'System',
				mode: 'system',
				serial: -1,
				path: '',
			},
			{
				name: 'Direct',
				mode: 'direct',
				serial: -2,
				path: '',
			},
		]);
		const re = {
			list,
			use: this.use,
		};
		console.log('bg getList', list.length, re);
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
		return !action.startsWith('set');
	}
});
