$(function () {
  function setIframeSrc() {
    var url_hostname = window.location.hostname;
    var url_pathname = window.location.pathname;
    var $viz_iframe = $("#viz-iframe");
    var src = "";
    if (url_hostname.indexOf("localhost") >= 0) {
      // Is localhost
      if (url_pathname.indexOf("smell-pittsburgh-website") >= 0) {
        // Is localhost smell pgh
        src = "http://localhost:3000/visualization?";
      } else if (url_pathname.indexOf("smell-my-city-website") >= 0) {
        // Is localhost smell my city
        src = "http://localhost:3000/visualization?client_token=c4f780294f2cef34b4b9be3fa82c6e7e&";
      }
    } else {
      // Not localhost
      if (url_hostname.indexOf("smellpgh") >= 0) {
        // Not localhost, is smell pgh
        src = "https://api.smellpittsburgh.org/visualization?";
      } else if (url_hostname.indexOf("smellmycity") >= 0) {
        // Not localhost, is smell my city
        src = "https://api.smellpittsburgh.org/visualization?client_token=c4f780294f2cef34b4b9be3fa82c6e7e&";
      }
    }
    src += window.location.search.split("?")[1];
    $viz_iframe.prop("src", src);
  }

  function init() {
    setIframeSrc();

    // Handles the cross-domain request from the iframe child
    pm.bind("update-parent-query-url", function (updated_query_url) {
      var replaced = window.location.protocol + "//" + window.location.hostname + window.location.pathname + updated_query_url;
      window.history.replaceState("shareURL", "Title", replaced);
    });
  }

  init();
});