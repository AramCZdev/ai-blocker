"use strict";

if (typeof browser == "undefined") {
  // `browser` is not defined in Chrome, but Manifest V3 extensions in Chrome
  // also support promises in the `chrome` namespace, like Firefox. To easily
  // test the example without modifications, polyfill "browser" to "chrome".
  globalThis.browser = chrome;
}

const permissions = {
  // This origin is listed in host_permissions:
  origins: ["<all_urls>"],
};

const checkbox_host_permission = document.getElementById("checkbox_host_permission");
checkbox_host_permission.onchange = async () => {
  if (checkbox_host_permission.checked) {
    let granted = await browser.permissions.request(permissions);
    if (!granted) {
      // Permission request was denied by the user.
      checkbox_host_permission.checked = false;
    }
  } else {
    try {
      await browser.permissions.remove(permissions);
    } catch (e) {
      // While Chrome allows granting of host_permissions that have manually
      // been revoked by the user, it fails when revoking them, with
      // "Error: You cannot remove required permissions."
      console.error(e);
      checkbox_host_permission.checked = true;
    }
  }
};
browser.permissions.contains(permissions).then(granted => {
  checkbox_host_permission.checked = granted;
});

const checkbox_wildcard = document.getElementById("checkbox_wildcard_ai");
checkbox_wildcard.onchange = async () => {
  if (checkbox_wildcard.checked) {
    await browser.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: ["wildcard-ai"]
    });
  } else {
    await browser.declarativeNetRequest.updateEnabledRulesets({
      disableRulesetIds: ["wildcard-ai"]
    });
  }
};
// The browser persists which static rulesets are enabled, so the checkbox
// state is restored from there instead of needing the "storage" permission.
browser.declarativeNetRequest.getEnabledRulesets().then(ids => {
  checkbox_wildcard.checked = ids.includes("wildcard-ai");
});