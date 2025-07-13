'use strict';

const $ = (s) => document.getElementById(s);

const tpl = $('tpl').innerHTML;

const htmlLi = $('opt-list');

let notifSerial = 0;
const notif = () => {
	notifSerial++;
	const cn = notifSerial;
	const o = $('notif')
	o.style.display = 'block';
	console.log('notif', cn, o);
	setTimeout(() => {
		if (cn !== notifSerial) {
			return;
		}
		o.style.display = 'none';
	}, 3000);
}

const setPathPlaceHolder = (c) => {
	const form = new FormData(c.querySelector('form'));
	if (form.get('mode') === 'pac') {
		c.querySelector('input[name=path]').placeholder = 'http://localhost/pac.js';
	} else if (form.get('mode') === 'socks5') {
		c.querySelector('input[name=path]').placeholder = '127.0.0.1:1080';
	} else {
		c.querySelector('input[name=path]').placeholder = '127.0.0.1:8118';
	}
};

const newOne = () => {
	chrome.runtime?.sendMessage({
		action: 'genSerial',
	}, (serial) => {
		console.log('newOne', serial);
		const c = fillOne({ serial });
		c.querySelector('input[name=name]').focus();
	});
}

const checkPath = (v, t) => {

	if (!v?.length) {
		return { error: 'empty path', path: '' };
	}

	if (t === 'pac') {
		if (!v.startsWith('http://') && !v.startsWith('https://')) {
			return { error: 'PAC URL must start with http://', path: v };
		};
		let u = null;
		try {
			u = new URL(v);
		} catch (e) {
		}
		if (!u) {
			return { error: 'Invalid URL', path: v };
		}
		return { error: '', path: v };
	}

	v = v.replace(/\/+$/, '').toLowerCase();
	const lastSlash = v.lastIndexOf('/');
	if (lastSlash > -1) {
		v = v.substring(lastSlash + 1);
	}
	if (!/^[0-9a-z\.\-]+:[\d]{1,5}$/.test(v)) {
		console.log(v);
		return { error: 'Invalid path, must be "host:port"', path: v };
	}
	return { error: '', path: v };
};

const saveAll = () => {
	htmlLi.querySelectorAll('div.alert').forEach((el) => {
		el.innerHTML = '';
	});
	const li = [];
	let firstError = false;
	for (const o of htmlLi.querySelectorAll('form')) {
		const form = new FormData(o);
		const serial = o.dataset.serial | 0;
		const icon = o.dataset.icon | 0;
		const mode = form.get('mode') || 'http';
		const name = (form.get('name') || '').trim();
		const { error, path } = checkPath((form.get('path') || '').trim(), mode)
		if (error) {
			o.querySelector('div.alert').innerHTML = error;
			if (!firstError) {
				o.querySelector('input[name=path]').focus();
				firstError = true;
			}
			continue;
		}
		if (!firstError) {
			li.push({ serial, name, mode, path, icon });
		}
	};
	if (firstError) {
		return;
	}

	notif();
	chrome.runtime.sendMessage({
		action: 'setList',
		parm: li,
	})
};

const fillIcon = (da, f) => {
	const ic = f.querySelector('div.icon');
	const dl = [];
	Array.from({ length: 8 }).forEach((_, i) => {
		const d = document.createElement('div');
		d.innerHTML = `<img src="/img/icon/s${i}.svg">`;
		dl.push(d);
		ic.appendChild(d);
	});

	let is = da?.icon | 0;
	if (is < 0 || is >= dl.length) {
		is = 0;
	}
	dl[is].classList.add('active');
	f.dataset.icon = is;

	dl.forEach((d, i) => {
		d.addEventListener('click', () => {
			dl.forEach((el, si) => {
				el.classList[(si === i ? 'add' : 'remove')]('active');
			});
			f.dataset.icon = i;
		});
	});
}

const fillOne = (d) => {

	const c = document.createElement('div');
	c.className = 'opt';
	c.innerHTML = tpl;

	if (['system', 'direct'].includes(d?.mode)) {
		return;
	}

	const f = c.querySelector('form');
	f.dataset.serial = d.serial;

	fillIcon(d, f);

	switch (d?.mode) {
		case 'pac':
			c.querySelector('input[name=mode][value=pac]').checked = true;
			break;
		case 'socks5':
			c.querySelector('input[name=mode][value=socks5]').checked = true;
			break;
		default:
			c.querySelector('input[name=mode][value=http]').checked = true;
			break;
	}

	setPathPlaceHolder(c);
	f.querySelectorAll('input[name=mode]').forEach((el) => {
		el.addEventListener('click', () => {
			setPathPlaceHolder(c);
		});
	});

	c.querySelector('button.delete').addEventListener('click', () => {
		console.log('delete', c);
		c.remove();
	});

	f.querySelector('input[name=name]').value = d?.name || '';

	f.querySelector('input[name=path]').value = d?.path || '';

	$('opt-list').appendChild(c);

	return c;
};

const setIdx = () => {
	htmlLi.querySelectorAll('div.name > span').forEach((el, idx) => {
		el.innerText = `${idx + 1}.`;
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

	document.querySelectorAll('button.new').forEach((btn) => {
		btn.style.display = 'inline-block';
		btn.addEventListener('click', newOne)
	});

	document.querySelectorAll('button.save').forEach((btn) => {
		btn.style.display = 'inline-block';
		btn.addEventListener('click', saveAll);
	});

	chrome.runtime?.sendMessage({
		action: 'getList',
	}, (re) => {
		re.list.forEach(fillOne);
		if (!htmlLi.querySelector('form')) {
			newOne();
		}
		setIdx();
		$('loading').remove();
	})
})()
