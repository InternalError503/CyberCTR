(function (global) {

if (typeof Presets == "undefined") {var Presets = {};};
if (!Presets) {Presets = {};};

    var {AddonManager} = Components.utils.import("resource://gre/modules/AddonManager.jsm", {});
    var {Services} = Components.utils.import("resource://gre/modules/Services.jsm", {});

 Presets = {

        prefs: Services.prefs.getBranch("extensions.classicthemerestorer."),
        osstring: Services.appinfo.OS,
        appversion: parseInt(Services.appinfo.version),
        tmp_tu_active: false,

        init: function () {
            // Checks to not enable tab width settings while 'TabMixPlus' or 'TabUtilities' is enabled
            AddonManager.getAddonByID('{dc572301-7619-498c-a57d-39143191b318}', function (addon) {
                if (addon && addon.isActive) {
                    Presets.tmp_tu_active = true;
                }
            });
            AddonManager.getAddonByID('tabutils@ithinc.cn', function (addon) {
                if (addon && addon.isActive) {
                    Presets.tmp_tu_active = true;
                }
            });
        },

        ClassicPreset: function () {

            if (Presets.tmp_tu_active == false) Presets.prefs.setIntPref("ctabwidth", 250);
            Presets.prefs.setBoolPref("panelmenucol", true);
            Presets.prefs.setBoolPref("verifiedcolors", true);
            Presets.prefs.setCharPref("findbar", 'findbar_bottoma');
            Presets.prefs.setBoolPref("hideprivmask", true);
            Presets.prefs.setBoolPref("cpanelmenus", true);
            Presets.prefs.setCharPref("emptyfavico_t", 'emptyfavico_t_dot');
            Presets.prefs.setBoolPref("hidezoomres", true);
            Presets.prefs.setBoolPref("faviconurl", true);
            Presets.prefs.setBoolPref("bmanimation", true);
            Presets.prefs.setBoolPref("pananimation", true);
            if (Services.appinfo.name.toLowerCase() != "Cyberfox".toLowerCase() &&
                Services.prefs.getBranch("browser.context.").getBoolPref("classic")) { } else {
                Presets.prefs.setBoolPref("noconicons", true);
            }
            Presets.prefs.setBoolPref("alt_newtabp", true);
            Presets.prefs.setBoolPref("skipprintpr", true);
            Presets.prefs.setBoolPref("tbconmenu", true);
            Presets.prefs.setBoolPref("activndicat", true);
            Presets.prefs.setBoolPref("tbconmenu", true);

            Presets.prefs.setCharPref("altoptions", 'options_win_alt');

            Presets.prefs.setBoolPref("alt_addonsm", true);
            Presets.prefs.setBoolPref("addonversion", true);

            Presets.prefs.setBoolPref("hideurlsrg", true);

            Presets.prefs.setBoolPref("oldsearch", true);

            if (this.appversion >= 48)
                Presets.prefs.setBoolPref("altautocompl", true);

            setTimeout(function () {
                Presets.prefs.setBoolPref("starinurl", true);
                Presets.prefs.setBoolPref("feedinurl", true);
            }, 1350);// If changed here must update CustomizableUI timer in restore defaults.	

            if (Presets.osstring == "WINNT" && Presets.tmp_tu_active == false)
                Presets.prefs.setBoolPref("dblclnewtab", true);
        },

        AustralisPreset: function () {
            Services.prefs.getBranch("browser.tabs.").setBoolPref("drawInTitlebar", true);
            Presets.prefssetCharPref("tabs", 'tabs_default');
            Presets.prefs.setCharPref("appbutton", 'appbutton_off');

            Presets.prefs.setBoolPref("statusbar", false);
            Presets.prefs.setBoolPref("activndicat", false);
            Presets.prefs.setBoolPref("cuibuttons", false);

            if (Presets.osstring == "WINNT") Presets.prefs.setBoolPref("dblclnewtab", true);
        }
    }
    // Make cyberctrFirstrun a global variable
    global.Presets = Presets.init;
} (this));