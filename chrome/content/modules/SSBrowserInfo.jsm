var EXPORTED_SYMBOLS = ["SSBrowserInfo"];

const {interfaces: Ci, utils: Cu} = Components;


this.SSBrowserInfo = {
  title: 'SSBrowser',
  include_regexp: null,
  exclude_regexp: null,
  start_uri: null
};
