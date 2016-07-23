(function (global) {

	const {
		classes: Cc,
		interfaces: Ci,
		utils: Cu,
		results: Cr,
		Constructor, ctor
	} = Components;

	//Import services use one service for preferences.
	var {Services} = Cu.import("resource://gre/modules/Services.jsm", {});

	if (typeof cyberctrFirstrun == "undefined") {
		var cyberctrFirstrun = {};
	};
	if (!cyberctrFirstrun) {
		cyberctrFirstrun = {};
	};

	cyberctrFirstrun = {
		getMessage: Services.strings.createBundle("chrome://classic_theme_restorer/locale/firstrun.file"),
		OS: Services.appinfo.OS,
		initialize_Firstrun: function () {

			if (!Services.prefs.getBoolPref("extensions.classicthemerestorer.firstrun")) {
				Services.prefs.setBoolPref("extensions.classicthemerestorer.firstrun", true);
			}

			// Localize UI elements.
			try {
				document.getElementById("spn-title").textContent = cyberctrFirstrun.i18n("spn-title");
				document.getElementById("tab-menustyletab").textContent = cyberctrFirstrun.i18n("tab-menustyletab");
				document.getElementById("tab-themestyletab").textContent = cyberctrFirstrun.i18n("tab-themestyletab");
				document.getElementById("tab-homestyletab").textContent = cyberctrFirstrun.i18n("tab-homestyletab");
				document.getElementById("tab-syncstyletab").textContent = cyberctrFirstrun.i18n("tab-syncstyletab");
				document.getElementById("tab-title-menustyle").textContent = cyberctrFirstrun.i18n("tab-title-menustyle");
				document.getElementById("tab-title-themestyle").textContent = cyberctrFirstrun.i18n("tab-title-themestyle");
				document.getElementById("tab-title-homestyle").textContent = cyberctrFirstrun.i18n("tab-title-homestyle");
				document.getElementById("tab-title-syncstyle").textContent = cyberctrFirstrun.i18n("tab-title-syncstyle");
				document.getElementById("menunextbutton").textContent = cyberctrFirstrun.i18n("nav-tab-next");
				document.getElementById("themenextbutton").textContent = cyberctrFirstrun.i18n("nav-tab-next");
				document.getElementById("homenextbutton").textContent = cyberctrFirstrun.i18n("nav-tab-next");
				document.getElementById("menuskipbutton").textContent = cyberctrFirstrun.i18n("nav-tab-skip");
				document.getElementById("themeskipbutton").textContent = cyberctrFirstrun.i18n("nav-tab-skip");
				document.getElementById("homeskipbutton").textContent = cyberctrFirstrun.i18n("nav-tab-skip");
				document.getElementById("nav-tab-done").textContent = cyberctrFirstrun.i18n("nav-tab-done");
				document.getElementById("menunextbuttonclear").textContent = cyberctrFirstrun.i18n("nav-tab-clear");
				document.getElementById("themenextbuttonclear").textContent = cyberctrFirstrun.i18n("nav-tab-clear");
				document.getElementById("homenextbuttonclear").textContent = cyberctrFirstrun.i18n("nav-tab-clear");
				document.getElementById("nav-tab-doneclear").textContent = cyberctrFirstrun.i18n("nav-tab-clear");
			} catch (e) {
				throw new Error("Error document.getElementById(id) is null!");
			}

			// Set operating system specific features for linux.
			// TODO: Maybe make operating system specific css.
			try {
				if (this.OS === "Linux") {
					document.getElementById("appmenubutton_img").src = "images/appmenubutton_linux.jpg";
					document.getElementById("appmenu_img").src = "images/appmenu_linux.jpg";
					document.getElementById("classicthemestyle_img").src = "images/classicthemestyle_linux.jpg";
					document.getElementById("australisthemestyle_img").src = "images/australisthemestyle_linux.jpg";
				}
			} catch (e) {
				throw new Error("Error unable to set images for linux!");
			}

			// Setup event listeners for feature clicks.
			try {
				// AppMenu Tab
				document.getElementById('appmenubuttonradio').addEventListener('click', function () {
					document.getElementById("menunextbutton").style.display = 'inline-block';
					document.getElementById("menunextbuttonclear").style.display = 'inline-block';
				}, false);
				document.getElementById('appmenuradio').addEventListener('click', function () {
					document.getElementById("menunextbutton").style.display = 'inline-block';
					document.getElementById("menunextbuttonclear").style.display = 'inline-block';
				}, false);

				// Tab Style
				document.getElementById('classicthemestyleradio').addEventListener('click', function () {
					document.getElementById("themenextbutton").style.display = 'inline-block';
					document.getElementById("themenextbuttonclear").style.display = 'inline-block';
				}, false);
				document.getElementById('australisthemestyleradio').addEventListener('click', function () {
					document.getElementById("themenextbutton").style.display = 'inline-block';
					document.getElementById("themenextbuttonclear").style.display = 'inline-block';
				}, false);

				// Home Page Color
				document.getElementById('homestyledarkradio').addEventListener('click', function () {
					document.getElementById("homenextbutton").style.display = 'inline-block';
					document.getElementById("homenextbuttonclear").style.display = 'inline-block';
				}, false);
				document.getElementById('homestylelightradio').addEventListener('click', function () {
					document.getElementById("homenextbutton").style.display = 'inline-block';
					document.getElementById("homenextbuttonclear").style.display = 'inline-block';
				}, false);
				document.getElementById('syncstyleradio').addEventListener('click', function () {
					document.getElementById("nav-tab-doneclear").style.display = 'inline-block';
				}, false);
			} catch (e) {
				throw new Error("Error unable to setup event listeners!");
			}
		},

		nav_to: function (aTab) {
			try {
				document.getElementById(aTab).checked = true;
			} catch (e) {
				throw new Error("Error aTab is null!");
			}
		},

		clearSelection: function (aName, aTab) {
			try {
				for (var i = 0; i < document.getElementsByName(aName).length; i++) {
					document.getElementsByName(aName)[i].checked = false;
				}
				if (aTab != 'nav-tab-done') {
					document.getElementById(aTab).style.display = 'none';
				}
				document.getElementById(aTab + "clear").style.display = 'none';
			} catch (e) {
				throw new Error("Error aName or aTab is null!");
			}
		},

		userDone: function () {

			if (Services.prompt.confirm(null, this.getMessage.GetStringFromName("change-confirm-title"), this.getMessage.GetStringFromName("change-confirm-message"))) {
				var _tabbrowser = Cc["@mozilla.org/appshell/window-mediator;1"]
					.getService(Ci.nsIWindowMediator).getEnumerator('navigator:browser').getNext().gBrowser;
				var _doc = null;
				var canCloseWindow = false;
				for (var found = false, index = 0; index < _tabbrowser.tabContainer.childNodes.length && !found; index++) {
					if (_tabbrowser.tabContainer.childNodes.length >= 2) {
						canCloseWindow = true
					}
					_doc = _tabbrowser.ownerDocument;
				}
				if (document.getElementById("appmenubuttonradio").checked) {
					try {

						switch (this.OS) {
							case "WINNT":
								Services.prefs.setCharPref("extensions.classicthemerestorer.appbutton", "appbutton_v2");
								break;
							case "Linux":
								Services.prefs.setCharPref("extensions.classicthemerestorer.appbutton", "appbutton_v1");
								break;
						}

						_doc.getElementById("toolbar-menubar").setAttribute('autohide', true);

					} catch (e) { }
				}
				if (document.getElementById("appmenuradio").checked) {
					try {
						Services.prefs.setCharPref("extensions.classicthemerestorer.appbutton", "appbutton_off");
						_doc.getElementById("toolbar-menubar").setAttribute('autohide', false);
					} catch (e) { }
				}
				if (document.getElementById("classicthemestyleradio").checked) {
					Services.prefs.setCharPref("extensions.classicthemerestorer.tabs", "tabs_squared");
				}
				if (document.getElementById("australisthemestyleradio").checked) {
					Services.prefs.setCharPref("extensions.classicthemerestorer.tabs", "tabs_default");
				}
				if (document.getElementById("homestyledarkradio").checked) {
					Services.prefs.setCharPref("extensions.classicthemerestorer.abouthome", "dark");
				}
				if (document.getElementById("homestylelightradio").checked) {
					Services.prefs.setCharPref("extensions.classicthemerestorer.abouthome", "light");
				}
				if (document.getElementById("syncstyleradio").checked) {
					Services.prefs.setBoolPref("extensions.classicthemerestorer.syncprefs", true);
				}
				if (canCloseWindow)
					window.close();
			}
		},

		i18n: function (message_id) {
			try {
				return cyberctrFirstrun.getMessage.GetStringFromName(message_id);
			} catch (e) {
				throw new Error("Error getting localized text!");
			}
		}

	}
	window.addEventListener("load", function () {
		window.removeEventListener("load", cyberctrFirstrun.initialize_Firstrun(), false);
		cyberctrFirstrun.initialize_Firstrun();
	}, false);

	// Make cyberctrFirstrun a global variable
	global.cyberctrFirstrun = cyberctrFirstrun;
} (this));