(function () {
  "use strict";

  var timezone_val_array = [encodeURIComponent(moment.tz.guess(true)), ""];
  var timezone_txt_array = ["Your Local Time", "UTC Time"];

  function init() {
    var widgets = new edaplotjs.Widgets();
    var $zipcode_input_container = $("#zipcode-input-container");
    var $zipcode_input = $("#zipcode-input");
    var $download_button = $("#download-button");
    var cached_url_settings = {};

    var updateDownloadUrl = function () {
      $download_button.attr("href", getUrl(cached_url_settings));
    };

    // Get city names and ids
    var city_names = ["Pittsburgh", "ZIP Code"];
    var city_ids = [1, -1];

    // Set region UI
    var init_city_index = 0;
    widgets.setCustomDropdown($("#region-dropdown"), {
      items: city_names,
      init_index: init_city_index,
      on_item_click_callback: function ($ui) {
        delete cached_url_settings["city_id"];
        delete cached_url_settings["zipcodes"];
        if ($ui.data("id") == -1) {
          $zipcode_input_container.show();
          cached_url_settings["zipcodes"] = $zipcode_input.val().replace(/\s/g, "");
        } else {
          $zipcode_input_container.hide();
          var cid = $ui.data("id");
          if (typeof cid !== "undefined" && cid !== null) {
            cached_url_settings["city_id"] = cid;
          }
        }
        updateDownloadUrl();
      },
      on_item_create_callback: function ($ui, i) {
        $ui.data("id", city_ids[i]);
      }
    });

    // Set zipcode UI
    $zipcode_input.on("change", function () {
      delete cached_url_settings["city_id"];
      cached_url_settings["zipcodes"] = $zipcode_input.val().replace(/\s/g, "");
      updateDownloadUrl();
    });

    // Set timezone UI
    var init_timezone_index = 0;
    widgets.setCustomDropdown($("#timezone-dropdown"), {
      items: timezone_txt_array,
      init_index: init_timezone_index,
      on_item_click_callback: function ($ui) {
        cached_url_settings["timezone_string"] = $ui.data("timezone_string");
        updateDownloadUrl();
      },
      on_item_create_callback: function ($ui, i) {
        $ui.data("timezone_string", timezone_val_array[i]);
      }
    });

    // Set datepicker UI
    var $from = $("#from-time-input").datepicker({}).on("change", function () {
      $to.datepicker("option", "minDate", getDate(this));
      cached_url_settings["start_time"] = $from.datepicker("getDate");
      updateDownloadUrl();
    });
    var $to = $("#to-time-input").datepicker({}).on("change", function () {
      $from.datepicker("option", "maxDate", getDate(this));
      cached_url_settings["end_time"] = $to.datepicker("getDate");
      updateDownloadUrl();
    });
    var from_date = new Date(new Date().setDate(new Date().getDate() - 30));
    var to_date = new Date();
    $from.datepicker("setDate", from_date);
    $to.datepicker("setDate", to_date);
    $to.datepicker("option", "minDate", $from.datepicker("getDate"));
    $from.datepicker("option", "maxDate", $to.datepicker("getDate"));
    $("#all-time-checkbox").on("change", function () {
      if (this.checked) {
        $from.datepicker("option", "disabled", true);
        $to.datepicker("option", "disabled", true);
        delete cached_url_settings["start_time"];
        delete cached_url_settings["end_time"];
        updateDownloadUrl();
      } else {
        $from.datepicker("option", "disabled", false);
        $to.datepicker("option", "disabled", false);
        $from.trigger("change");
        $to.trigger("change");
      }
    });

    // Initialize and show the download button
    cached_url_settings = {
      "city_id": city_ids[init_city_index],
      "timezone_string": timezone_val_array[init_timezone_index]
    };
    $from.trigger("change");
    $to.trigger("change");
    updateDownloadUrl();
    $("#download-button-container").show();
  }

  function getDate(element) {
    var dateFormat = "mm/dd/yy";
    var date;
    try {
      date = $.datepicker.parseDate(dateFormat, element.value);
    } catch (error) {
      date = null;
    }
    return date;
  }

  function safeGet(v, default_val) {
    if (typeof default_val === "undefined") default_val = "";
    return (typeof v === "undefined") ? default_val : v;
  }

  function getUrl(settings) {
    var root_url = "https://api.smellpittsburgh.org/";
    var api_url = "api/v2/smell_reports?format=csv";
    var url = root_url + api_url;
    settings = safeGet(settings, {});
    var city_id = settings["city_id"];
    var zipcodes = settings["zipcodes"];
    var start_time = settings["start_time"];
    var end_time = settings["end_time"];
    var timezone_string = settings["timezone_string"];
    var timezone_offset = timezone_string === "" ? new Date().getTimezoneOffset() : 0;
    if (typeof city_id !== "undefined" && city_id !== "") {
      url += "&city_ids=" + city_id;
    }
    if (typeof zipcodes !== "undefined" && zipcodes !== "") {
      url += "&zipcodes=" + zipcodes;
    }
    if (typeof start_time !== "undefined" && start_time !== "") {
      var desired_start_time = new Date(start_time.getTime());
      desired_start_time.setHours(0, 0 - timezone_offset, 0, 0);
      url += "&start_time=" + parseInt(desired_start_time.getTime() / 1000);
    }
    if (typeof end_time !== "undefined" && end_time !== "") {
      var desired_end_time = new Date(end_time.getTime());
      desired_end_time.setHours(23, 59 - timezone_offset, 59, 999);
      url += "&end_time=" + parseInt(desired_end_time.getTime() / 1000);
    }
    if (typeof timezone_string !== "undefined" && timezone_string !== "") {
      url += "&timezone_string=" + timezone_string;
    }
    return url;
  }

  $(init);
})();
