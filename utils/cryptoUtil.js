import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Settings from '../settings.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import St from 'gi://St';
import * as Config from 'resource:///org/gnome/shell/misc/config.js';

var coingecko_data = null;

export var createUUID = () => {
  let dt = new Date().getTime();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};

var _get_coingecko_data = async () => {
  if (coingecko_data) return coingecko_data;

  //TODO update json file, if one coin not found. get from https://api.coingecko.com/api/v3/coins/list
  const file = Gio.File.new_for_path(Extension.lookupByUUID('crypto@alipirpiran.github').path + '/assets/coingecko.json');

  const [, contents, etag] = await new Promise((resolve, reject) => {
    file.load_contents_async(null, (file_, result) => {
      try {
        resolve(file.load_contents_finish(result));
      } catch (e) {
        reject(e);
      }
    });
  });

  var contentsString = '';
  
  if (+Config.PACKAGE_VERSION >= 41) {
    const decoder = new TextDecoder('utf-8');
    contentsString = decoder.decode(contents);
  } else {
    const ByteArray = imports.byteArray;
    contentsString = ByteArray.toString(contents);
  }

  coingecko_data = JSON.parse(contentsString);
  return coingecko_data;
};

export var coingecko_symbol_to_id = async (symbol) => {
  try {
    const data = await _get_coingecko_data();
    for (const item of data) {
      if (item['symbol'].toLowerCase() === symbol.toLowerCase())
        return item['id'];
    }
  } catch (error) {
    console.log(error);
  }
};

export var getHeight = (vboxHeight) => {
  const ratio = 0.4;
  const monitor = global.display.get_primary_monitor();
  const workAreaHeight =
    Main.layoutManager.getWorkAreaForMonitor(monitor).height;
  const maxHeight = ratio * workAreaHeight;

  return Math.min(vboxHeight, maxHeight);
};
