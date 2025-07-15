'use strict';

const setIcon = (id) => {
	chrome.action.setIcon({
		path: {
			'32': `/img/icon/s${id % 8}.png`,
		}
	});
};

const specMode = ['system', 'direct'];

class Setting {

	init = false;

	serial = 0;
	use = 0;
	list = [];

	constructor() {
		chrome.storage.local.get(['list', 'use', 'serial'], (o) => {
			const serial = o.serial | 0;
			let li = o.list || [];
			let maxSerial = 0;
			if (li?.length) {
				this.list = li;
				let save = false;
				li.forEach((o) => {
					o.icon = (o.icon | 0) % 8;
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
		});
		chrome.proxy.settings.get(
			{ 'incognito': false },
			function() { }
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
			this.useProxy(-1);
			return;
		}
		chrome.storage.local.set({ use: serial });
		this.use = serial;
		setIcon(p.icon | 0);
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
		chrome.proxy.settings.set(
			{ value: cfg, scope: 'regular' },
			() => { },
		);
	}

	setList(li) {
		this.list = li;
		this.useProxy(this.use);
		chrome.storage.local.set({ list: li });
		return true;
	}

	getInit() {
		return this.init;
	}

	genSerial() {
		this.serial++;
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
				icon: -1,
			},
			{
				name: 'Direct',
				mode: 'direct',
				serial: -2,
				path: '',
				icon: -2,
			},
		]);
		const re = {
			list,
			use: this.use,
		};
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
		const re = fn.call(setting, req?.parm);
		if (action.startsWith('set')) {
			return;
		}
		sendRsp(re);
		return true;
	}
});

chrome.runtime.onStartup.addListener(() => {
	setting?.getInit();
})
