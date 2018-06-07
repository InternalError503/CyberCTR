"use strict";

(function(global) {
/*
 There are a few "timeouts" on this document. In almost all cases they are needed to
 make sure a 'get' call looks only for items already in DOM.
*/

var Cc = Components.classes, Ci = Components.interfaces, Cu = Components.utils;

var {CustomizableUI} = Cu.import("resource:///modules/CustomizableUI.jsm", {});
var {AddonManager} = Cu.import("resource://gre/modules/AddonManager.jsm", {});
var {FileUtils} = Cu.import("resource://gre/modules/FileUtils.jsm", {});
var {NetUtil} = Cu.import("resource://gre/modules/NetUtil.jsm", {});
var {osfile} = Cu.import("resource://gre/modules/osfile.jsm", {});    // load the OS module
//Import services
var {Services} = Cu.import("resource://gre/modules/Services.jsm", {});

if (typeof classicthemerestorerjs == "undefined") {var classicthemerestorerjs = {};};
if (!classicthemerestorerjs.ctr) {classicthemerestorerjs.ctr = {};};
window.addEventListener("load", function () { 
	window.removeEventListener("load", classicthemerestorerjs.ctr.customCTRPrefSettings(), false); 
	classicthemerestorerjs.ctr.customCTRPrefSettings(); 
}, false);  
var treeStyleCompatMode;
var sheetIO = Services.io.newURI("data:text/css;charset=utf-8," + encodeURIComponent(''), null, null);
classicthemerestorerjs.ctr = {

  // initialize custom sheets for tab color settings

  ctabsheet_def: sheetIO,
  ctabsheet_act: sheetIO,
  ctabsheet_hov: sheetIO,
  ctabsheet_pen: sheetIO,
  ctabsheet_unr: sheetIO,
  cntabsheet_def: sheetIO,
  cntabsheet_hov: sheetIO,
  tabtxtcsheet_def: sheetIO,
  tabtxtcsheet_act: sheetIO,
  tabtxtcsheet_hov: sheetIO,
  tabtxtcsheet_pen: sheetIO,
  tabtxtcsheet_unr: sheetIO,
  tabtxtshsheet_def: sheetIO,
  tabtxtshsheet_act: sheetIO,
  tabtxtshsheet_hov: sheetIO,
  tabtxtshsheet_pen: sheetIO,
  tabtxtshsheet_unr: sheetIO,
  
  tabboldsheet_def: sheetIO,
  tabboldsheet_act: sheetIO,
  tabboldsheet_hov: sheetIO,
  tabboldsheet_pen: sheetIO,
  tabboldsheet_unr: sheetIO,
  tabitasheet_def: sheetIO,
  tabitasheet_act: sheetIO,
  tabitasheet_hov: sheetIO,
  tabitasheet_pen: sheetIO,
  tabitasheet_unr: sheetIO,
 
  tablowsheet_pen:	sheetIO,
  tablowopa_unr:		sheetIO,
  
  aerocolors: sheetIO,
  
  tabheight: sheetIO,
  
  findbarwidth: sheetIO,

  locationbarsize:		sheetIO,
  searchbarsize:		sheetIO,
  locationbarradius:	sheetIO,
  searchbarradius:		sheetIO,
  searchpopupwidth:	sheetIO,

  navbarpadding: sheetIO,
  
  appbutton_color: sheetIO,
  
  cuiButtonssheet: sheetIO,

  searchbarsheet: sheetIO,
  bookmarkbarfontsize: sheetIO,
  tabfontsize: sheetIO,
  abouthome_bg: sheetIO,
  abouthome_custcolor: sheetIO,
  abouthome_custbasecolor: sheetIO,
  aboutnewtab_custcolor: sheetIO,
  hideElements: sheetIO,
  aboutnewtab_bg: sheetIO,
  custtabthorbber: sheetIO,
  cctrcustomcsss: sheetIO,
  
  prefs:				Services.prefs.getBranch("extensions.classicthemerestorer."),
  
  fxdefaulttheme:		Services.prefs.getBranch("general.skins.").getCharPref("selectedSkin") == 'classic/1.0',
  fxdevelopertheme:		false,
  osstring:				Services.appinfo.OS,
  appversion:			parseInt(Services.appinfo.version),
  stringBundle:			Services.strings.createBundle("chrome://classic_theme_restorer/locale/messages.file"),
  
  fullscreeduration:	false,
  html5warning:			false,
  oldfontgfxOn:			false,
  moveStarIntoUrlbar:	false,
  moveFeedIntoUrlbar:	false,
  altnewtabpageOn:		false,
  removeRecentBmOn:		false,
  
  devthemeinterval: 	null,
  ctrcontentprefswin: 	null,
 
  activityObserver: 	new MutationObserver(function() {}), // define empty, (CTR) global observer
  activityObserverOn:	false, // activity observer is always disabled, when a window get initialized

  init: function() {

	// Here we do first run globally, Show firstrun page.
	if (Services.prefs.getBoolPref("extensions.classicthemerestorer.firstrun") == false){
		Services.prefs.setBoolPref("extensions.classicthemerestorer.firstrun", true);
		try {
			if (typeof openUILinkIn != "undefined") {
				setTimeout(function() {
					// Open next to current tab so user can see the first run page, User may not see the page it they have allot of tabs.
					openUILinkIn("chrome://classic_theme_restorer/content/cctr/firstrun.html", "tab", { relatedToCurrent: true });
				}, 2000); // Wait 2 seconds before showing to allow time after browser restart.
			}
		} catch(e){}
	}

	// Listen for addon uninstall and clear firstrun preference.
	try {
		AddonManager.addAddonListener({
			onUninstalling: function(addon){
				if (addon.id === "CTR@8pecxstudios.com"){
					Services.prefs.clearUserPref("extensions.classicthemerestorer.firstrun");
				}
			}
		});
	} catch(e){}
	
	// move default non-movable PanelUI-button/PanelUI-menu-button into a movable container
	window.addEventListener("DOMContentLoaded", function toggleNavBarSwitch(event){
	  window.removeEventListener("DOMContentLoaded", toggleNavBarSwitch, false);
	    try{
		  document.getElementById("ctraddon_panelui-button").insertBefore(document.getElementById("PanelUI-button"),null);
	    }catch(e){}
	},false);

	// adds a new global attribute 'defaultfxtheme' -> better parting css for default and non-default themes
	try{
		if (this.fxdefaulttheme){
		  document.getElementById("main-window").setAttribute('defaultfxtheme',true);
		}
		else {
		  var thirdpartytheme = Services.prefs.getBranch("general.skins.").getCharPref("selectedSkin");
		  document.getElementById("main-window").setAttribute('currenttheme',thirdpartytheme);
	  
		  // these themes = default theme + different toolbar button icons
		  if(thirdpartytheme=="Tangerinefox" || thirdpartytheme=="Tangofox") {
			this.fxdefaulttheme=true;
			document.getElementById("main-window").setAttribute('defaultfxtheme',true);
		  }
		 
		  // Don't animateFadeIn options window in nautipolis theme.	
		  if(thirdpartytheme=="nautipolis" && classicthemerestorerjs.ctr.osstring=="WINNT"){Services.prefs.setBoolPref("browser.preferences.animateFadeIn", false);}
		  
		  classicthemerestorerjs.ctr.loadUnloadCSS("thirdpartythemes",true);
		}
	} catch(e){}

	// add a new global attributes -> better parting css between Fx versions
	try{if (this.appversion >= 52) document.getElementById("main-window").setAttribute('fx52plus',true);} catch(e){}

	// add CTR version number to '#main-window' node, so other add-ons/themes can easier distinguish between versions
	AddonManager.getAddonByID('ClassicThemeRestorer@ArisT2Noia4dev', function(addon) {
	  try{
		document.getElementById("main-window").setAttribute('ctraddon_version',addon.version);
	  } catch(e){}
	});
	
	// CTRs appbutton for Windows titlebar
	this.createTitlebarButton();
	
	// prevent location bar moving to palette or panel menu
	this.preventLocationbarRemoval();
	
	// prevent location bar hiding by ac-popup
	this.preventLocationbarHidingByACPopup();
	
	// additional toolbars
	this.createAdditionalToolbars();
	
	// add-on fixes
	this.addonCompatibilityImprovements();
	
	// handle max/min tab-width for every new window
	this.updateTabWidth();
	
	// move menubar to other toolbars
	this.moveMenubarToToolbar();

	// not all CTR features are suitable for third party themes
	this.disableSettingsforThemes();
	
	treeStyleCompatMode = Services.prefs.getBoolPref("extensions.classicthemerestorer.compatibility.treestyle.disable");
		//Check if browser Firefox\Other (Added just in-case users decide to install in firefox reported: https://8pecxstudios.com/Forums/viewtopic.php?f=3&t=475&p=4368#p4366)
		if (Services.appinfo.name.toLowerCase() != "Cyberfox".toLowerCase()) {
			Services.prefs.setBoolPref("browser.restart.enabled", false);	
			Services.prefs.setBoolPref("clean.ram.cache", false);
			Services.prefs.setBoolPref("browser.menu.aboutconfig", false);
			Services.prefs.setBoolPref("browser.context.classic", false);			
		}
		if (Services.appinfo.name.toLowerCase() === "Cyberfox".toLowerCase() && this.appversion <= 34) {
				Services.prefs.setBoolPref("browser.menu.aboutconfig", true);
		}
	  
		//Personal Menu				
		AddonManager.getAddonByID('CompactMenuCE@Merci.chao', function(addon) {
			if(addon && addon.isActive && Services.prefs.getBoolPref("extensions.classicthemerestorer.compatibility.personalmenu") === true) { 
				if (Services.prompt.confirm(null, classicthemerestorerjs.ctr.stringBundle.GetStringFromName("popup_compatibility_title"), 
				classicthemerestorerjs.ctr.stringBundle.GetStringFromName("popup_compatibility_permenu"))){
					Services.prefs.setCharPref("extensions.classicthemerestorer.appbutton", "appbutton_off");
					Services.prefs.setBoolPref("extensions.classicthemerestorer.compatibility.personalmenu", false);
				}
			}
		});

		//Animate animated lwtheme's
		if (Services.prefs.getBoolPref("extensions.classicthemerestorer.animatedlwtthemes")){
				try{
								//addition restart maybe required. (Less start-up intensive).
								Services.prefs.setBoolPref("lightweightThemes.persisted.headerURL", false);
								Services.prefs.setBoolPref("lightweightThemes.persisted.footerURL", false);
				}catch(e){}	
		}	
	
	// style CTRs 'customize-ui' option buttons
	this.loadUnloadCSS('cui_buttons',true);
	
	// CTRs extra add-on bar keys
	this.CTRextraLocationBarKeyset();
	
	// skip print buttons print preview
	this.CTRextraSkipPrintPreview();
	
	// prevent developer theme from being enabled in Fx40+
	this.PreventDevThemeEnabling();
	
	// add tab title to browsers titlebar
	this.tabTitleInBrowsersTitlebar();
	
	// prevent accidental location bar removal by using context menu 
	this.removeContextItemsFromLocationbarContext();
	
	// move 'Tools' menus dev tools into application buttons popup 
	this.moveDevtoolsmenu();
	
	// prevent browser from disabling CTRs reload button for no reason
	this.preventReloaddisabling();

	// CTR Preferences listener
	function PrefListener(branch_name, callback) {
	  // Keeping a reference to the observed preference branch or it will get
	  // garbage collected.
	  this._branch = Services.prefs.getBranch(branch_name);
	  this._branch.QueryInterface(Ci.nsIPrefBranch2);
	  this._callback = callback;
	}

	PrefListener.prototype.observe = function(subject, topic, data) {
	  if (topic == 'nsPref:changed')
		this._callback(this._branch, data);
	};

	PrefListener.prototype.register = function(trigger) {
	  this._branch.addObserver('', this, false);
	  if (trigger) {
		var that = this;
		this._branch.getChildList('', {}).
		  forEach(function (pref_leaf_name)
			{ that._callback(that._branch, pref_leaf_name); });
	  }
	};

	PrefListener.prototype.unregister = function() {
	  if (this._branch)
		this._branch.removeObserver('', this);
	};
	
	//Pocket (Restart Required)
	try{	
		if (Services.prefs.getBoolPref("extensions.pocket.enabled")) {
			classicthemerestorerjs.ctr.loadUnloadCSS("nopocket",false);
		}else{
			classicthemerestorerjs.ctr.loadUnloadCSS("nopocket",true);
		}
	} catch(e){}	

	// DevEdition tweaks for Fx 40+
	// This ugly hack is required to keep track of dev edition theme preference
	// thanks to horrible implementation of "lightweightThemes.selectedThemeID" pref,
	// which gets removed once default theme is enabled again.
	var ctrSettingsListener_forDevtheme2 = new PrefListener(
	  "lightweightThemes.",
	  function(branch, name) {
		switch (name) {

		  case "selectedThemeID":
			try{
			  if (
				(branch.getCharPref("selectedThemeID")=='firefox-devedition@mozilla.org'
					|| branch.getCharPref("selectedThemeID")=='firefox-compact-dark@mozilla.org'
					|| branch.getCharPref("selectedThemeID")=='firefox-compact-light@mozilla.org'
				) && Services.prefs.getBranch("extensions.classicthemerestorer.").getBoolPref("nodevtheme2")==false) {
				
				classicthemerestorerjs.ctr.fxdevelopertheme=true;
			  
				if (classicthemerestorerjs.ctr.fxdefaulttheme){
				  try{
					document.getElementById("main-window").setAttribute('developertheme',true);
				  } catch(e){}
				}

				setTimeout(function(){
				  Services.prefs.getBranch("extensions.classicthemerestorer.").setCharPref('tabs','tabs_default');
				},50);
				setTimeout(function(){
				  Services.prefs.getBranch("extensions.classicthemerestorer.").setCharPref('tabs','tabs_squared');
				},100);
			  
				if(Services.prefs.getBranch("extensions.classicthemerestorer.").getBoolPref('aerocolors'))
				  Services.prefs.getBranch("extensions.classicthemerestorer.").setBoolPref('aerocolors',false);
			
				// make sure previous interval gets cleared before new one can be 'started', when
				// switching between dark and light compact themes in Firefox 53+
				clearInterval(classicthemerestorerjs.ctr.devthemeinterval);
				
				classicthemerestorerjs.ctr.devthemeinterval = setInterval(function(){
				  
				  var selectedThemeID = null;
				  try {
					selectedThemeID = Services.prefs.getBranch("lightweightThemes.").getCharPref("selectedThemeID");
				  } catch (e) {}
				  
				  if (selectedThemeID=='firefox-devedition@mozilla.org' 
					|| selectedThemeID=='firefox-compact-dark@mozilla.org'
					|| selectedThemeID=='firefox-compact-light@mozilla.org') {
					document.getElementById("main-window").setAttribute('developertheme',true);
				  } else {
					document.getElementById("main-window").setAttribute('developertheme',false);
					//this is required to stop interval once it is not needed any more
					clearInterval(classicthemerestorerjs.ctr.devthemeinterval);
					
					classicthemerestorerjs.ctr.fxdevelopertheme=false;
					
					setTimeout(function(){
					  Services.prefs.getBranch("extensions.classicthemerestorer.").setCharPref('tabs','tabs_default');
					},50);
					setTimeout(function(){
					  Services.prefs.getBranch("extensions.classicthemerestorer.").setCharPref('tabs','tabs_squared');
					},100);
				  }
				  
				},1000);
				
			  }

			
			} catch(e){}

		  break;
		}
	  }
	);
	
	ctrSettingsListener_forDevtheme2.register(true);


	var ctrSettingsListener = new PrefListener(
	  "extensions.classicthemerestorer.",
	  function(branch, name) {
		switch (name) {

		  // first run/reset
		  case "ctrreset":
			if (branch.getBoolPref("ctrreset") ) {
			
			  try {

				// move CTRs items on 'first run' or 'reset' onto toolbars
				CustomizableUI.addWidgetToArea("ctraddon_back-forward-button", CustomizableUI.AREA_NAVBAR);
				CustomizableUI.addWidgetToArea("ctraddon_appbutton", CustomizableUI.AREA_NAVBAR);
				CustomizableUI.addWidgetToArea("ctraddon_panelui-button", CustomizableUI.AREA_NAVBAR);
				if (classicthemerestorerjs.ctr.osstring=="WINNT") CustomizableUI.addWidgetToArea("ctraddon_window-controls", CustomizableUI.AREA_NAVBAR);
				
				//Remove this to stop creating 2 bookmark buttons on first run
				//CustomizableUI.addWidgetToArea("ctraddon_bookmarks-menu-toolbar-button", CustomizableUI.AREA_BOOKMARKS);						

				var tabsintitlebar = Services.prefs.getBranch("browser.tabs.").getBoolPref("drawInTitlebar");
										
				// TMPs/TUs colors for rounded tabs in Fx29+ are not compatible with CTRs (squared) tabs.
				// This just disables TMPs/TUs non-compatible tab color options on first run (once).
				try{
				  var tmpprefs = Services.prefs.getBranch("extensions.tabmix.");
				  if(tmpprefs.getBoolPref("currentTab")) tmpprefs.setBoolPref("currentTab",false);
				  if(tmpprefs.getBoolPref("unloadedTab")) tmpprefs.setBoolPref("unloadedTab",false);
				  if(tmpprefs.getBoolPref("unreadTab")) tmpprefs.setBoolPref("unreadTab",false);
				  if(tmpprefs.getBoolPref("otherTab")) tmpprefs.setBoolPref("otherTab",false);
				} catch(e){}

				try{
				  var tuprefs = Services.prefs.getBranch("extensions.tabutils.");
				  if(tuprefs.getBoolPref("highlightCurrent")) tuprefs.setBoolPref("highlightCurrent",false);
				  if(tuprefs.getBoolPref("highlightRead")) tuprefs.setBoolPref("highlightRead",false);
				  if(tuprefs.getBoolPref("highlightSelected")) tuprefs.setBoolPref("highlightSelected",false);
				  if(tuprefs.getBoolPref("highlightUnloaded")) tuprefs.setBoolPref("highlightUnloaded",false);
				  if(tuprefs.getBoolPref("highlightUnread")) tuprefs.setBoolPref("highlightUnread",false);
				} catch(e){}
				
				// switch to 'appbutton on titlebar', if using Fx titlebar on Windows
				if (classicthemerestorerjs.ctr.osstring=="WINNT" && tabsintitlebar) {
					branch.setCharPref("appbutton",'appbutton_v2');
				}
					
			  } catch(e){}
			  
			  try{
				  // try to move buttons to nav-bars start
				  setTimeout(function(){
					CustomizableUI.moveWidgetWithinArea("ctraddon_back-forward-button",0);
					CustomizableUI.moveWidgetWithinArea("ctraddon_appbutton",0);
				  },1000);
			  }catch(e){}
			  
			  // TreeStyleTabs add-on works better with tabs not on top, so this is enabled on reset/first run
			  AddonManager.getAddonByID('treestyletab@piro.sakura.ne.jp', function(addon) {
				if(addon && addon.isActive && classicthemerestorerjs.ctr.osstring=="WINNT"){
				  Services.prefs.getBranch("extensions.classicthemerestorer.").setCharPref('tabsontop','false');
				  classicthemerestorerjs.ctr.fixThatTreeStyleBro();			
				  Services.prefs.setBoolPref("extensions.classicthemerestorer.compatibility.treestyle", true);											
				}else{ Services.prefs.setBoolPref("extensions.classicthemerestorer.compatibility.treestyle", false);}
				
			  });
			  
			  // set 'first run' & 'ctrreset' to false
			  setTimeout(function(){
				branch.setBoolPref("ctrreset",false);
			  },3000);
			
			}
		  break;
		  
		  //start page style
		  case "abouthome":
				classicthemerestorerjs.ctr.loadUnloadCSS('abouthomedark', branch.getCharPref("abouthome") === "dark");				
				classicthemerestorerjs.ctr.loadUnloadCSS('abouthomedarkalt', branch.getCharPref("abouthome") === "darkalt");	
				classicthemerestorerjs.ctr.loadUnloadCSS('abouthomelight', branch.getCharPref("abouthome") === "light");	
				classicthemerestorerjs.ctr.loadUnloadCSS('abouthomelightalt', branch.getCharPref("abouthome") === "lightalt");		  
				classicthemerestorerjs.ctr.loadUnloadCSS('abouthomesimplicityblue', branch.getCharPref("abouthome") === "simplicityblue");
				classicthemerestorerjs.ctr.loadUnloadCSS('abouthomesimplicityred', branch.getCharPref("abouthome") === "simplicityred");
				classicthemerestorerjs.ctr.loadUnloadCSS('abouthomesimplicitygreen', branch.getCharPref("abouthome") === "simplicitygreen");
				classicthemerestorerjs.ctr.loadUnloadCSS('abouthomesimplicityyellow', branch.getCharPref("abouthome") === "simplicityyellow");
				classicthemerestorerjs.ctr.loadUnloadCSS('abouthomesimplicity', branch.getCharPref("abouthome") === "simplicityblue" ||
						branch.getCharPref("abouthome") === "simplicityred" ||
						branch.getCharPref("abouthome") === "simplicitygreen" || 
						branch.getCharPref("abouthome") === "simplicityyellow" ||
						branch.getCharPref("abouthome") === "simplicitycustom");					
		  break;
		 
		 //No links on about:home page in cyberfox.
		case "abouthomenobar":
				classicthemerestorerjs.ctr.loadUnloadCSS('abouthomenobar', branch.getBoolPref("abouthomenobar"));	
		  break;
		  
		 //No apps on about:home page.
		case "abouthomenoappsbar":
				classicthemerestorerjs.ctr.loadUnloadCSS('abouthomenoappsbar', branch.getBoolPref("abouthomenoappsbar"));	
		  break;
		  
		//No logo on about:home page
		case "abouthomenologo":		  
				classicthemerestorerjs.ctr.loadUnloadCSS('abouthomenologo', branch.getBoolPref("abouthomenologo"));	
		  break;		  
		  
		//No icons on about:home page
		case "abouthomenoicons":		  
				classicthemerestorerjs.ctr.loadUnloadCSS('abouthomenoicons', branch.getBoolPref("abouthomenoicons"));
		  break;
		  
		//No snippets on about:home page
		case "abouthomenosnippets":		  
				classicthemerestorerjs.ctr.loadUnloadCSS('abouthomenosnippets', branch.getBoolPref("abouthomenosnippets"));
		  break;

		//Use animations on about:home page
		case "abouthomeanimate":		  
				classicthemerestorerjs.ctr.loadUnloadCSS('abouthomeanimate', branch.getBoolPref("abouthomeanimate"));
		  break;			  
		  
		  // Tabs
		  case "tabs":
			classicthemerestorerjs.ctr.loadUnloadCSS('tabs_squared',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('tabs_squaredc2',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('tabs_squared2',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('tabs_squared2c2',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('tabs_curved',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('tabs_curvedall',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('tabs_devedextra',false);

			var devtheme=false;
		
			if(classicthemerestorerjs.ctr.fxdevelopertheme==true) devtheme=true;

			if (branch.getCharPref("tabs")!="tabs_default" && classicthemerestorerjs.ctr.fxdefaulttheme==true && devtheme==false){
			  classicthemerestorerjs.ctr.loadUnloadCSS(branch.getCharPref("tabs"),true);
			}
			
			if (classicthemerestorerjs.ctr.fxdefaulttheme==true && devtheme==true){
			  classicthemerestorerjs.ctr.loadUnloadCSS('tabs_devedextra',true);
			}

			if (branch.getBoolPref("aerocolors") && classicthemerestorerjs.ctr.fxdefaulttheme==true && devtheme==false) { 
			  classicthemerestorerjs.ctr.loadUnloadCSS("aerocolors",false);
			  classicthemerestorerjs.ctr.loadUnloadCSS("aerocolors",true);
			}
			
			if (branch.getCharPref("tabs")=="tabs_squaredc2" || branch.getCharPref("tabs")=="tabs_squared2c2") {
			  if (branch.getBoolPref("square_edges") && classicthemerestorerjs.ctr.fxdefaulttheme==true && devtheme==false) {
				classicthemerestorerjs.ctr.loadUnloadCSS("square_edges",false);
				classicthemerestorerjs.ctr.loadUnloadCSS("square_edges",true);
			  }
			}
			
			/* tab color changes */	
			if(branch.getBoolPref('tabcolor_def')) {
			  branch.setBoolPref('tabcolor_def',false);
			  setTimeout(function(){
				Services.prefs.getBranch("extensions.classicthemerestorer.").setBoolPref('tabcolor_def',true);
			  },200);
			}
			
			if(branch.getBoolPref('tabcolor_act')) {
			  branch.setBoolPref('tabcolor_act',false);
			  setTimeout(function(){
				Services.prefs.getBranch("extensions.classicthemerestorer.").setBoolPref('tabcolor_act',true);
			  },200);
			}
			
			if(branch.getBoolPref('tabcolor_pen')) {
			  branch.setBoolPref('tabcolor_pen',false);
			  setTimeout(function(){
				Services.prefs.getBranch("extensions.classicthemerestorer.").setBoolPref('tabcolor_pen',true);
			  },200);
			}
			
			if(branch.getBoolPref('tabcolor_unr')) {
			  branch.setBoolPref('tabcolor_unr',false);
			  setTimeout(function(){
				Services.prefs.getBranch("extensions.classicthemerestorer.").setBoolPref('tabcolor_unr',true);
			  },200);
			}
			
			if(branch.getBoolPref('tabcolor_hov')) {
			  branch.setBoolPref('tabcolor_hov',false);
			  setTimeout(function(){
				Services.prefs.getBranch("extensions.classicthemerestorer.").setBoolPref('tabcolor_hov',true);
			  },200);
			}

			if(branch.getBoolPref('ntabcolor_def')) {
			  branch.setBoolPref('ntabcolor_def',false);
			  setTimeout(function(){
				Services.prefs.getBranch("extensions.classicthemerestorer.").setBoolPref('ntabcolor_def',true);
			  },200);
			}

			if(branch.getBoolPref('ntabcolor_hov')) {
			  branch.setBoolPref('ntabcolor_hov',false);
			  setTimeout(function(){
				Services.prefs.getBranch("extensions.classicthemerestorer.").setBoolPref('ntabcolor_hov',true);
			  },200);
			}
			
			/* */
			if(branch.getBoolPref('closeonleft')) {
			  branch.setBoolPref('closeonleft',false);
			  setTimeout(function(){
				Services.prefs.getBranch("extensions.classicthemerestorer.").setBoolPref('closeonleft',true);
			  },20);
			}
				  
		  break;
		  
		  case "tabsontop":
		    
			var tabsont = branch.getCharPref("tabsontop");
			
			if (tabsont=='false') {
			  classicthemerestorerjs.ctr.loadUnloadCSS("tabsotoff2",false);
			  classicthemerestorerjs.ctr.loadUnloadCSS("tabsotoff",true);
			} else if (tabsont=='false2') {
			  classicthemerestorerjs.ctr.loadUnloadCSS("tabsotoff",false);
			  classicthemerestorerjs.ctr.loadUnloadCSS("tabsotoff2",true);
			} else {
			  classicthemerestorerjs.ctr.loadUnloadCSS("tabsotoff",false);
			  classicthemerestorerjs.ctr.loadUnloadCSS("tabsotoff2",false);
			}
			
			// only try to remove attributes, if they exist
			// they are set for many nodes at once by CTR, so if one has it all others have too	
			if (tabsont=='unset') {
			  try {
				if(document.getElementById("main-window").hasAttribute('tabsontop')) {
					document.getElementById("main-window").removeAttribute('tabsontop');
					document.getElementById("navigator-toolbox").removeAttribute('tabsontop');
					document.getElementById("TabsToolbar").removeAttribute('tabsontop');
					document.getElementById("nav-bar").removeAttribute('tabsontop');
					document.getElementById("PersonalToolbar").removeAttribute('tabsontop');
				}
			  } catch(e){}
			}
			else if (tabsont=='true') {
			  try {
				document.getElementById("main-window").setAttribute('tabsontop','true');
				document.getElementById("navigator-toolbox").setAttribute('tabsontop','true');
				document.getElementById("TabsToolbar").setAttribute('tabsontop','true');
				document.getElementById("nav-bar").setAttribute('tabsontop','true');
				document.getElementById("PersonalToolbar").setAttribute('tabsontop','true');
			  } catch(e){}
			}
			else {
			  try {
				document.getElementById("main-window").setAttribute('tabsontop','false');
				document.getElementById("navigator-toolbox").setAttribute('tabsontop','false');
				document.getElementById("TabsToolbar").setAttribute('tabsontop','false');
				document.getElementById("nav-bar").setAttribute('tabsontop','false');
				document.getElementById("PersonalToolbar").setAttribute('tabsontop','false');
			  } catch(e){}
			}
			
			classicthemerestorerjs.ctr.loadUnloadCSS('cui_buttons',true);
			
		  break;
		  
		  case "square_edges":
			if (branch.getBoolPref("square_edges") && classicthemerestorerjs.ctr.fxdefaulttheme==true) {
			  if (branch.getCharPref("tabs")=="tabs_squaredc2" || branch.getCharPref("tabs")=="tabs_squared2c2")
				classicthemerestorerjs.ctr.loadUnloadCSS("square_edges",true);
			}
			else classicthemerestorerjs.ctr.loadUnloadCSS("square_edges",false);
		  break;
		  
		  case "tttitlebar_c":
			if (branch.getBoolPref("tttitlebar_c") && branch.getBoolPref("tttitlebar")) classicthemerestorerjs.ctr.loadUnloadCSS("tttitlebar_c",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tttitlebar_c",false);
		  break;
		  
		  case "ttoverflow":
		  
			classicthemerestorerjs.ctr.loadUnloadCSS('ttoverfl_no1',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('ttoverfl_no2',false);

			if (branch.getCharPref("ttoverflow")!="default" && classicthemerestorerjs.ctr.appversion >= 53)
				classicthemerestorerjs.ctr.loadUnloadCSS(branch.getCharPref("ttoverflow"),true);

		  break;
		  
		  case "tabtitlepos":
		  
			classicthemerestorerjs.ctr.loadUnloadCSS('tabtitlepos_left',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('tabtitlepos_centered',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('tabtitlepos_right',false);
			
			if (branch.getCharPref("tabtitlepos")!="tabtitlepos_default")
			  classicthemerestorerjs.ctr.loadUnloadCSS(branch.getCharPref("tabtitlepos"),true);

		  break;
		  
		  case "ctabheightcb":
			if (branch.getBoolPref("ctabheightcb")) classicthemerestorerjs.ctr.loadUnloadCSS("ctabheight",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("ctabheight",false);
		  break;
		  
		  case "ctabheight":
			if (branch.getBoolPref("ctabheightcb")) classicthemerestorerjs.ctr.loadUnloadCSS("ctabheight",true);
		  break;
		  
		  case "ctabwidth": case "ctabmwidth":
			classicthemerestorerjs.ctr._updateTabWidth();
		  break;
		  
		  case "closetab":
		  
			classicthemerestorerjs.ctr.loadUnloadCSS('closetab_active',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('closetab_none',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('closetab_forced',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('closetab_tb_end',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('closetab_tb_start',false);
			
			if (branch.getCharPref("closetab")!="closetab_default"){
			  
			  if (branch.getCharPref("closetab")=="closetab_forced") {
				classicthemerestorerjs.ctr.loadUnloadCSS('closetab_forced',true);
			  }
			  else {
			    classicthemerestorerjs.ctr.loadUnloadCSS(branch.getCharPref("closetab"),true);
			  }

			}

		  break;

		  case "closetabhfl":
			if (branch.getBoolPref("closetabhfl")) classicthemerestorerjs.ctr.loadUnloadCSS("closetabhfl",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("closetabhfl",false);
		  break;

		  case "closeicon":
			
			classicthemerestorerjs.ctr.loadUnloadCSS('closeicon_red',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('closeicon_w7',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('closeicon_w7v2',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('closeicon_w8',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('closeicon_w10',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('closeicon_w10i',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('closeicon_w10red',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('closeicon_gc',false);
			  
			if (branch.getCharPref("closeicon")!="closeicon_default"){
			  classicthemerestorerjs.ctr.loadUnloadCSS(branch.getCharPref("closeicon"),true);
			}

		  break;
		  
		  case "closeicong":
			
			classicthemerestorerjs.ctr.loadUnloadCSS('closeicong_red',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('closeicong_w7',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('closeicong_w7v2',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('closeicong_w8',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('closeicong_w10',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('closeicong_w10i',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('closeicong_w10red',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('closeicong_gc',false);
			  
			if (branch.getCharPref("closeicong")!="closeicong_default"){
			  classicthemerestorerjs.ctr.loadUnloadCSS(branch.getCharPref("closeicong"),true);
			}

		  break;

		  case "closeonleft":
			if (branch.getBoolPref("closeonleft") && classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("closeonleft",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("closeonleft",false);
		  break;
		  
		  case "closetabbig":
			if (branch.getBoolPref("closetabbig")) classicthemerestorerjs.ctr.loadUnloadCSS("closetabbig",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("closetabbig",false);
		  break;


		  // Appbutton
		  case "appbutton":
			classicthemerestorerjs.ctr.loadUnloadCSS('appbutton_v1',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('appbutton_v1wt',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('appbutton_v2',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('appbutton_v2wt2',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('appbutton_v2io',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('appbutton_v2io2',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('appbutton_v2h',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('appbutton_pm',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('appbutton_pm2',false);
		
			if (branch.getCharPref("appbutton")!="appbutton_off"){
			  classicthemerestorerjs.ctr.loadUnloadCSS(branch.getCharPref("appbutton"),true);
			  classicthemerestorerjs.ctr.checkAppbuttonOnNavbar();
			}
		    classicthemerestorerjs.ctr.fixThatTreeStyleBro();	
        		
			if (branch.getCharPref("appbuttonc")=="appbuttonc_custom") classicthemerestorerjs.ctr.loadUnloadCSS("appbuttonc_custom",true);
		
    if (Services.appinfo.name.toLowerCase() === "Firefox".toLowerCase()) {
				// custom button title for 'appbutton on toolbar'
				if (branch.getCharPref("appbutton")=="appbutton_v1wt"){
					
					var buttontitle = "Firefox"; // init with default title
					var custombuttontitle = Services.prefs.getBranch("extensions.classicthemerestorer.").getCharPref('appbuttontxt');
					
					var converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
					converter.charset = 'UTF-8';
					
					if(custombuttontitle!='') buttontitle = converter.ConvertToUnicode(custombuttontitle);
					else {
						try{
						  // make sure appbutton gets correct title
						  buttontitle = document.getElementById("main-window").getAttribute("title_normal");
						  if(buttontitle=="Mozilla Firefox") buttontitle="Firefox";
						  else if(buttontitle=="Firefox Developer Edition") buttontitle="DevFox";
						
						} catch(e){}
					}
					
					setTimeout(function(){
					  try{
						document.getElementById("ctraddon_appbutton").setAttribute("label", buttontitle);
					  } catch(e){}
					},500);

				}
      }

 			//custom tab height adjustment
			if (branch.getBoolPref("ctabheightcb")) classicthemerestorerjs.ctr.loadUnloadCSS("ctabheight",true);

		  break;
		  
		  case "appbuttonc": case "appbuttonct":
			classicthemerestorerjs.ctr.loadUnloadCSS('appbuttonc_orange',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('appbuttonc_aurora',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('appbuttonc_nightly',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('appbuttonc_transp',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('appbuttonc_palemo',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('appbuttonc_red',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('appbuttonc_green',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('appbuttonc_gray',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('appbuttonc_purple',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('appbuttonc_white',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('appbuttonc_custom',false);
			
			classicthemerestorerjs.ctr.loadUnloadCSS('appbuttonc_cyan',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('appbuttonc_default',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('appbuttonc_green_dark',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('appbuttonc_orange_dark',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('appbuttonc_red_dark',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('appbuttonc_salmon',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('appbuttonc_custom1',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('appbuttonc_ontoolbar',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('appbuttonc_buttoncolor',false);

			if (branch.getCharPref("appbuttonc")!="off"){
			  classicthemerestorerjs.ctr.loadUnloadCSS(branch.getCharPref("appbuttonc"),true);
			}
		  break;
		  
		  case "appbautocol":
		  
		    if (branch.getBoolPref("appbautocol")) {
		      var buttontitle = "firefox";
			
			  try{
				// make sure appbutton gets correct title
				buttontitle = document.getElementById("main-window").getAttribute("title_normal");
				switch (buttontitle.toLowerCase()){
					case "firefox developer edition": case "devfox": case "aurora":
						branch.setCharPref("appbuttonc",'appbuttonc_aurora');
					break;
					case "nightly":
						branch.setCharPref("appbuttonc",'appbuttonc_nightly');
					break;
					case "firefox": case "mozilla firefox":
						branch.setCharPref("appbuttonc",'appbuttonc_orange');
					break;
					case "cyberfox":
						branch.setCharPref("appbuttonc",'appbuttonc_default');
					break;	
					default:
						branch.setCharPref("appbuttonc",'appbuttonc_gray');
					break;	
				}

			  } catch(e){}
			
			}

		  break;
		  
		  case "cappbutc1": case "cappbutc2": case "cappbutpc1": case "cappbutpc2": case "cappbutcm": case "cappbutcpercent": case "cappbuttxtc": case "cappbutnotxtsh":
			if (branch.getCharPref("appbuttonc")=="appbuttonc_custom") classicthemerestorerjs.ctr.loadUnloadCSS("appbuttonc_custom",true);
			if (branch.getCharPref("appbuttonc")=="appbuttonc_custom1") classicthemerestorerjs.ctr.loadUnloadCSS("appbuttonc_custom1",true);
		  break;
		  
		  case "altabico":
			classicthemerestorerjs.ctr.loadUnloadCSS('altabico_dark',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('altabico_white_nd',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('altabico_dark_nd',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('altabico_grey',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('altabico_grey_nd',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('altabico_white_pm',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('altabico_dark_pm',false);
		
			if (branch.getCharPref("altabico")!="altabico_white"){
			  classicthemerestorerjs.ctr.loadUnloadCSS(branch.getCharPref("altabico"),true);
			}

		  break;
		  
		  case "appbutmhi":
			if (branch.getBoolPref("appbutmhi") && classicthemerestorerjs.ctr.fxdefaulttheme==true) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("appbutmhi",true);
			  branch.setBoolPref("hightabpososx",false);
			}
			else classicthemerestorerjs.ctr.loadUnloadCSS("appbutmhi",false);
		  break;
		  
		  case "appbutbdl":
			if (branch.getBoolPref("appbutbdl")) classicthemerestorerjs.ctr.loadUnloadCSS("appbutbdl",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("appbutbdl",false);
		  break;
		  
		  /*Aero Colors*/
		  case "aerocolors": case "aerocolorsg":
		 
			var devtheme=false;
	
			if(classicthemerestorerjs.ctr.fxdevelopertheme==true) devtheme=true;
	
			if (branch.getBoolPref("aerocolors") && classicthemerestorerjs.ctr.fxdefaulttheme==true && devtheme==false) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("aerocolors",true);
			  branch.setBoolPref("tabc_act_tb",false);
			  if (branch.getBoolPref("tabcolor_act") && classicthemerestorerjs.ctr.fxdefaulttheme==true) {
				classicthemerestorerjs.ctr.loadUnloadCSS("tabcolor_act",true);
			  }
			}
			else classicthemerestorerjs.ctr.loadUnloadCSS("aerocolors",false);
		  break;

		  //General UI options
		  case "nbiconsize":
		  
		    var currentAttribute = document.getElementById("nav-bar").getAttribute("iconsize");
			var selectedAttribute = Services.prefs.getBranch("extensions.classicthemerestorer.").getCharPref("nbiconsize");
			
			// if nav-bar current and CTRs selected attribute are both 'small', CTR does not need to change nav-bars attribute
			if(currentAttribute=="small" && selectedAttribute=="small") {return;}
			else {
				// needs a delay or Cyberfox may override attribute in some cases
				setTimeout(function(){
				  try {
					document.getElementById("nav-bar").setAttribute('iconsize',Services.prefs.getBranch("extensions.classicthemerestorer.").getCharPref("nbiconsize"));
				  } catch(e){}
				},Services.prefs.getBranch("extensions.classicthemerestorer.").getIntPref("nbisizedelay"));
				
				window.addEventListener("load", function setCTRnavbariconsize(event){
					window.removeEventListener("load", setCTRnavbariconsize, false);

					// needs a delay or Cyberfox may override attribute in some cases
					setTimeout(function(){
					  try {
						document.getElementById("nav-bar").setAttribute('iconsize',Services.prefs.getBranch("extensions.classicthemerestorer.").getCharPref("nbiconsize"));
					  } catch(e){}
					},Services.prefs.getBranch("extensions.classicthemerestorer.").getIntPref("nbisizedelay"));

				},false);
			}

		  break;

		  case "smallnavbut":
		  
			var cstbb = false;
			//if CTB add-on is installed and navbar buttons option is not off
			try {
			  if(Services.prefs.getBranch("extensions.cstbb-extension.").getCharPref("navbarbuttons")!="nabbuttons_off")
			   cstbb = true;
			} catch(e){}
	
			if(branch.getBoolPref("smallnavbut") && classicthemerestorerjs.ctr.fxdefaulttheme==true && cstbb==false) {			
			  classicthemerestorerjs.ctr.loadUnloadCSS("smallnavbut",true);
			  if(branch.getBoolPref("nbcompact"))
			    classicthemerestorerjs.ctr.loadUnloadCSS("nbcompact",false);
			}
			else {
			  classicthemerestorerjs.ctr.loadUnloadCSS("smallnavbut",false);
			  if(branch.getBoolPref("nbcompact") && branch.getBoolPref("smallnavbut")==false)
			    classicthemerestorerjs.ctr.loadUnloadCSS("nbcompact",true);
			}
			
			classicthemerestorerjs.ctr.checkAppbuttonOnNavbar();

		  break;
		  
		  case "hidenavbar":	  
			if (branch.getBoolPref("hidenavbar")) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("hidenavbar",true);
			  try{
				document.getElementById("navigator-toolbox").setAttribute('ctrnavbarhidden',true);
			  }catch(e){}
			  
			  setTimeout(function(){
				try{
				  document.getElementById("toggle_nav-bar").setAttribute("checked",false);
				}catch(e){}
			  },1500);

			}
			else {
			  classicthemerestorerjs.ctr.loadUnloadCSS("hidenavbar",false);
			  try{
				if (document.getElementById("navigator-toolbox").hasAttribute('ctrnavbarhidden'))
				  document.getElementById("navigator-toolbox").removeAttribute('ctrnavbarhidden');
			  }catch(e){}
			  
			  setTimeout(function(){
				try{
				  document.getElementById("toggle_nav-bar").setAttribute("checked",true);
				}catch(e){}
			  },1500);
			}
			
			// verify the menuitem is checked or not after dom content load
			window.addEventListener("DOMContentLoaded", function toggleNavBarSwitch(event){
			  window.removeEventListener("DOMContentLoaded", toggleNavBarSwitch, false);
				
			  if (branch.getBoolPref("hidenavbar")) {
				try{
				  document.getElementById("toggle_nav-bar").setAttribute("checked",false);
				  document.getElementById("navigator-toolbox").setAttribute('ctrnavbarhidden',true);
				}catch(e){}
			  } else {
				try{
				  document.getElementById("toggle_nav-bar").setAttribute("checked",true);
				  if (document.getElementById("navigator-toolbox").hasAttribute('ctrnavbarhidden'))
				    document.getElementById("navigator-toolbox").setAttribute('ctrnavbarhidden',false);
				}catch(e){}
			  }

			},false);
		  break;
		  
		  case "navbarpad": case "navbarpad_l": case "navbarpad_r": case "navbarmar_l": case "navbarmar_r":
		    if (branch.getBoolPref("navbarpad")) 
			  classicthemerestorerjs.ctr.loadUnloadCSS("navbarpad",true);
		    else
			  classicthemerestorerjs.ctr.loadUnloadCSS("navbarpad",false);
		  break;
		  
		  case "lb_width": case "lbsize_minw": case "lbsize_maxw":
		    if (branch.getBoolPref("lb_width")) 
			  classicthemerestorerjs.ctr.loadUnloadCSS("lb_width",true);
		    else
			  classicthemerestorerjs.ctr.loadUnloadCSS("lb_width",false);
		  break;
		  
		  case "sb_width": case "sbsize_minw": case "sbsize_maxw":
		    if (branch.getBoolPref("sb_width")) 
			  classicthemerestorerjs.ctr.loadUnloadCSS("sb_width",true);
		    else
			  classicthemerestorerjs.ctr.loadUnloadCSS("sb_width",false);
		  break;
		  
		  case "lb_roundness": case "lbradius_left": case "lbradius_right":
		    if (branch.getBoolPref("lb_roundness")) 
			  classicthemerestorerjs.ctr.loadUnloadCSS("lb_roundness",true);
		    else
			  classicthemerestorerjs.ctr.loadUnloadCSS("lb_roundness",false);
		  break;
		  
		  case "sb_roundness": case "sbradius_left": case "sbradius_right":
		    if (branch.getBoolPref("sb_roundness")) 
			  classicthemerestorerjs.ctr.loadUnloadCSS("sb_roundness",true);
		    else
			  classicthemerestorerjs.ctr.loadUnloadCSS("sb_roundness",false);
		  break;

		  case "backforward":
			if (branch.getBoolPref("backforward")) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("backforward",true);
			  
			  if (branch.getBoolPref("nbcompact") && branch.getBoolPref("smallnavbut")==false){
				classicthemerestorerjs.ctr.loadUnloadCSS("nbcompact",true);
			  }
			}
			else { 
			  classicthemerestorerjs.ctr.loadUnloadCSS("backforward",false);
			  
			  if (branch.getBoolPref("nbcompact")&& branch.getBoolPref("smallnavbut")==false){
				classicthemerestorerjs.ctr.loadUnloadCSS("nbcompact",false);
			  }
			}
		  break;
		  
		  case "nbcompact":
			if (branch.getBoolPref("nbcompact") && branch.getBoolPref("backforward") && branch.getBoolPref("smallnavbut")==false){
			  classicthemerestorerjs.ctr.loadUnloadCSS("nbcompact",true);

			  if (branch.getCharPref("nav_txt_ico").indexOf('iconstxt')!=-1)
				branch.setCharPref("nav_txt_ico",'icons');
			}
			else classicthemerestorerjs.ctr.loadUnloadCSS("nbcompact",false);
		  break;

		  case "noconicons":
			if (branch.getBoolPref("noconicons") && classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("noconicons",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("noconicons",false);
		  break;
		  
		  case "altoptions":
			  classicthemerestorerjs.ctr.loadUnloadCSS("options_alt",false);
			  classicthemerestorerjs.ctr.loadUnloadCSS("options_alt2",false);
			  classicthemerestorerjs.ctr.loadUnloadCSS("options_alt3",false);
			  classicthemerestorerjs.ctr.loadUnloadCSS("options_alt4",false);
			  classicthemerestorerjs.ctr.loadUnloadCSS("options_win",false);
			  classicthemerestorerjs.ctr.loadUnloadCSS("options_win_alt",false);
			  classicthemerestorerjs.ctr.loadUnloadCSS("options_win_ct",false);
			  classicthemerestorerjs.ctr.closeContentPrefsInWin();
		
			if (branch.getCharPref("altoptions")!="options_default"){
			  if (branch.getCharPref("altoptions")=="options_win" && classicthemerestorerjs.ctr.fxdefaulttheme==true)
				classicthemerestorerjs.ctr.loadUnloadCSS("options_win",true);
			  else if (branch.getCharPref("altoptions")=="options_win" && classicthemerestorerjs.ctr.fxdefaulttheme==false)
				classicthemerestorerjs.ctr.loadUnloadCSS("options_win_ct",true);
			  else if (branch.getCharPref("altoptions")=="options_win_alt" && classicthemerestorerjs.ctr.fxdefaulttheme==false)
				classicthemerestorerjs.ctr.loadUnloadCSS("options_win_ct",true);
			  else if (classicthemerestorerjs.ctr.fxdefaulttheme==true)		  
			    classicthemerestorerjs.ctr.loadUnloadCSS(branch.getCharPref("altoptions"),true);	  
			}
			
			if (branch.getCharPref("altoptions")=="options_win" || branch.getCharPref("altoptions")=="options_win_alt") {
			  classicthemerestorerjs.ctr.loadUnloadCSS('altoptionsmitem',true);
			} else {
			  classicthemerestorerjs.ctr.loadUnloadCSS('altoptionsmitem',false);
			}
			
			// for MacOSX: hide items using js instead of css or it won't work
			if (classicthemerestorerjs.ctr.osstring=="Darwin"){
				if (branch.getCharPref("altoptions")=="options_win" || branch.getCharPref("altoptions")=="options_win_alt") {
					setTimeout(function(){
					  try{
						document.getElementById("ctraddon_toolsmenu_preferencesOSX").collapsed = false;
					  } catch(e){}
					},1000);
				}
				else {
				  setTimeout(function(){
					try{
					  document.getElementById("ctraddon_toolsmenu_preferencesOSX").collapsed = true;
					} catch(e){}
				  },1000);
				}
			}

		  break;
		  
		  case "aboutpages":
			if (branch.getBoolPref("aboutpages") && classicthemerestorerjs.ctr.appversion >= 48) classicthemerestorerjs.ctr.loadUnloadCSS("aboutpages",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("aboutpages",false);
		  break;

		  case "svgfilters":
			if (branch.getBoolPref("svgfilters")) classicthemerestorerjs.ctr.loadUnloadCSS("svgfilters",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("svgfilters",false);
		  break;

		  case "wincontrols":
			if (branch.getBoolPref("wincontrols")) classicthemerestorerjs.ctr.loadUnloadCSS("wincontrols",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("wincontrols",false);
		  break;
		  
		  case "puibuttonsep":
			classicthemerestorerjs.ctr.loadUnloadCSS('puib_leftsep',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('puib_rightsep',false);
		
			if (branch.getCharPref("puibuttonsep")!="puib_nosep"){
			  classicthemerestorerjs.ctr.loadUnloadCSS(branch.getCharPref("puibuttonsep"),true);
			}

		  break;
		  
		  case "altdlprogbar":
			if (branch.getBoolPref("altdlprogbar") && classicthemerestorerjs.ctr.appversion >= 52
				&& classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("altdlprogbar",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("altdlprogbar",false);
		  break;

		  case "altalertbox":
			if (branch.getBoolPref("altalertbox")
				&& classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("altalertbox",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("altalertbox",false);
		  break;

		  case "oldtoplevimg": case "oldtoplevimg2":
			if (branch.getBoolPref("oldtoplevimg") && branch.getBoolPref("oldtoplevimg2")) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("oldtoplevimg",false);
			  classicthemerestorerjs.ctr.loadUnloadCSS("oldtoplevimg2",true);
			} else if (branch.getBoolPref("oldtoplevimg") && branch.getBoolPref("oldtoplevimg2")==false) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("oldtoplevimg",true);
			  classicthemerestorerjs.ctr.loadUnloadCSS("oldtoplevimg2",false);
			} else {
			  classicthemerestorerjs.ctr.loadUnloadCSS("oldtoplevimg",false);
			  classicthemerestorerjs.ctr.loadUnloadCSS("oldtoplevimg2",false);
			}
		  break;
		  
		  case "activndicat":
			if (branch.getBoolPref('activndicat')) {
				classicthemerestorerjs.ctr.loadUnloadCSS("navthrobber",true);
				classicthemerestorerjs.ctr.activityObserverOn = true;
			    classicthemerestorerjs.ctr.restoreActivityThrobber();
			}
			else {
			  if(classicthemerestorerjs.ctr.activityObserverOn == true){
				classicthemerestorerjs.ctr.loadUnloadCSS("navthrobber",false);
				classicthemerestorerjs.ctr.activityObserverOn = false;
				classicthemerestorerjs.ctr.restoreActivityThrobber();
			  } else {
				try{
				  classicthemerestorerjs.ctr.activityObserver.disconnect();
				}catch(e){}
			  }
			}
		  break;

		  case "hideprbutton":
			if (branch.getBoolPref("hideprbutton")) classicthemerestorerjs.ctr.loadUnloadCSS("hideprbutton",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("hideprbutton",false);
		  break;
		  
		  case "statusbar":
	  
			if (branch.getBoolPref("statusbar")) {
				classicthemerestorerjs.ctr.loadUnloadCSS("statusbar",true);
			
				// add status bar shim to CTRs status bar area
				setTimeout(function(){
				  try{
					  if(document.getElementById("status-bar").parentNode.id=="addon-bar")
						document.getElementById("ctraddon_statusbar").insertBefore(document.getElementById("status-bar"), null);
				  } catch(e){}
				},1100);
				
				// recheck position of CTRs status bar area after DOM content loaded
				window.addEventListener("DOMContentLoaded", function loadCTRstatusbar(event){
					window.removeEventListener("DOMContentLoaded", loadCTRstatusbar, false);
			
					setTimeout(function(){
					  try{
						  if(document.getElementById("status-bar").parentNode.id=="addon-bar")
							document.getElementById("ctraddon_statusbar").insertBefore(document.getElementById("status-bar"), null);
					  } catch(e){}
					},1250);

				},false);

			}
			else { 
				classicthemerestorerjs.ctr.loadUnloadCSS("statusbar",false);
				
				window.removeEventListener("DOMContentLoaded", function loadCTRstatusbar(event){},false);
				
				// move status bar shim back to where it came from, if it is not already there
				setTimeout(function(){
				  try{
					if(document.getElementById("status-bar").parentNode.id=="ctraddon_statusbar")
						document.getElementById("addon-bar").insertBefore(document.getElementById("status-bar"), null);
				  } catch(e){}
				},450);
			}
		  break;
		  
		  case "starinurl":
			if (branch.getBoolPref("starinurl")) {
			
				classicthemerestorerjs.ctr.moveStarIntoUrlbar = true;
				
				classicthemerestorerjs.ctr.loadUnloadCSS("starinurl",true);

				// 'timeout' prevents issues with add-ons, which also insert own (h-)boxes/items into urlbar.
				// If "bookmarks-menu-button" can not be found on ui, it gets added to nav-bar first and
				// moved to urlbar afterwards (workaround because of some Australis UI issues).
				try{
				  setTimeout(function(){
					if (branch.getBoolPref("starinurl")) {
					  try{
						if(CustomizableUI.getPlacementOfWidget("bookmarks-menu-button")==null) {
							CustomizableUI.addWidgetToArea("bookmarks-menu-button", CustomizableUI.AREA_NAVBAR);
							CustomizableUI.moveWidgetWithinArea("bookmarks-menu-button",0);
						} else if(CustomizableUI.getPlacementOfWidget("bookmarks-menu-button").area=="nav-bar") {
							CustomizableUI.moveWidgetWithinArea("bookmarks-menu-button",0);
						} else {
							CustomizableUI.addWidgetToArea("bookmarks-menu-button", CustomizableUI.AREA_NAVBAR);
							CustomizableUI.moveWidgetWithinArea("bookmarks-menu-button",0);
						}

						var urlbaricons = document.getElementById("urlbar-icons");
						
						// keep default order, if star and feed button are both in location bar
						if (branch.getBoolPref("feedinurl") && urlbaricons.firstChild.id=="feed-button")
							urlbaricons.insertBefore(document.getElementById("bookmarks-menu-button"), urlbaricons.firstChild.nextSibling);
						else
							urlbaricons.insertBefore(document.getElementById("bookmarks-menu-button"), urlbaricons.firstChild);
						
						/* Fx 38+ adds reader mode buttons to urlbar icons area. They have to be moved to first position.*/
						try{
							if(document.getElementById("reader-mode-button").parentNode.id=="urlbar-icons") {
							  urlbaricons.insertBefore(document.getElementById("reader-mode-button"), urlbaricons.firstChild);
							}
						} catch(e){}
						
						
					  } catch(e){}
					}

				  },1000);
				} catch(e){}
			  } else {
			  
			  if (classicthemerestorerjs.ctr.moveStarIntoUrlbar==true) {
			  
			    classicthemerestorerjs.ctr.moveStarIntoUrlbar = false;
				try{
				  setTimeout(function(){
					try{
						if(document.getElementById("bookmarks-menu-button").parentNode.id=="urlbar-icons") {
							CustomizableUI.removeWidgetFromArea("bookmarks-menu-button");
							CustomizableUI.addWidgetToArea("bookmarks-menu-button", CustomizableUI.AREA_NAVBAR);
							
							classicthemerestorerjs.ctr.loadUnloadCSS("starinurl",false);
						}
					} catch(e){}
				  },1000);
				} catch(e){}
			  }

			}
		  break;
		  
		  case "feedinurl":
			if (branch.getBoolPref("feedinurl")) {

				classicthemerestorerjs.ctr.moveFeedIntoUrlbar = true;
				
				classicthemerestorerjs.ctr.loadUnloadCSS("feedinurl",true);
				
				// 'timeout' prevents issues with add-ons, which also insert own (h-)boxes/items into urlbar.
				// If "feed-button" can not be found on ui, it gets added to tabs toolbar first and
				// moved to urlbar afterwards (workaround because of some Australis UI issues).
				try{
				  setTimeout(function(){
					if (branch.getBoolPref("feedinurl")) {
					  try{
						if(CustomizableUI.getPlacementOfWidget("feed-button")==null) {
						  CustomizableUI.addWidgetToArea("feed-button", CustomizableUI.AREA_TABSTRIP);
						} else if(CustomizableUI.getPlacementOfWidget("feed-button").area!="TabsToolbar") {
						  CustomizableUI.addWidgetToArea("feed-button", CustomizableUI.AREA_TABSTRIP);
						} 

						var urlbaricons = document.getElementById("urlbar-icons");
						urlbaricons.insertBefore(document.getElementById("feed-button"), urlbaricons.firstChild);
						
						/* Fx 38+ adds reader mode buttons to urlbar icons area. They have to be moved to first position.*/
						try{
							if(document.getElementById("reader-mode-button").parentNode.id=="urlbar-icons") {
							  urlbaricons.insertBefore(document.getElementById("reader-mode-button"), urlbaricons.firstChild);
							}
						} catch(e){}


					  } catch(e){}
					}
				  },1300);
				} catch(e){}

			} else {
			
			  if (classicthemerestorerjs.ctr.moveFeedIntoUrlbar==true) {
			  
			    classicthemerestorerjs.ctr.moveFeedIntoUrlbar = false;
				
				try{
				  setTimeout(function(){
					try{
						if(document.getElementById("feed-button").parentNode.id=="urlbar-icons") {
						  CustomizableUI.addWidgetToArea("feed-button", CustomizableUI.AREA_NAVBAR);
						  classicthemerestorerjs.ctr.loadUnloadCSS("feedinurl",false);
						}
					} catch(e){}
				  },1300);
				} catch(e){}
			
			  }

			}
		  break;
		  
		  case "hideurelstop":
			if (branch.getBoolPref("hideurelstop")) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("hideurelstop",true);
			  
			  if (branch.getBoolPref("hideurelstop2") && branch.getBoolPref("hideurlgo")==false) classicthemerestorerjs.ctr.loadUnloadCSS("hideurelstop2",true);
			}
			else { 
			  classicthemerestorerjs.ctr.loadUnloadCSS("hideurelstop",false);
			  classicthemerestorerjs.ctr.loadUnloadCSS("hideurelstop2",false);
			}
		  break;
		  
		  case "hideurelstop2":
			if (branch.getBoolPref("hideurelstop2") && branch.getBoolPref("hideurelstop") && branch.getBoolPref("hideurlgo")==false) classicthemerestorerjs.ctr.loadUnloadCSS("hideurelstop2",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("hideurelstop2",false);
		  break;
		  
		  case "hideurlgo":
			if (branch.getBoolPref("hideurlgo")) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("hideurlgo",true);

			  if (branch.getBoolPref("hideurelstop2") && branch.getBoolPref("hideurelstop")) classicthemerestorerjs.ctr.loadUnloadCSS("hideurelstop2",false);
			}
			else {
			  classicthemerestorerjs.ctr.loadUnloadCSS("hideurlgo",false);

			  if (branch.getBoolPref("hideurelstop2") && branch.getBoolPref("hideurelstop")) classicthemerestorerjs.ctr.loadUnloadCSS("hideurelstop2",true);
			}
		  break;

		  case "hideurlsrg":
			if (branch.getBoolPref("hideurlsrg")) classicthemerestorerjs.ctr.loadUnloadCSS("hideurlsrg",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("hideurlsrg",false);
		  break;

		  case "urlbardropm":
			if (branch.getBoolPref("urlbardropm")) classicthemerestorerjs.ctr.loadUnloadCSS("urlbardropm",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("urlbardropm",false);
		  break;

		  case "urlbardropm2":
			if (branch.getBoolPref("urlbardropm2")) classicthemerestorerjs.ctr.loadUnloadCSS("urlbardropm2",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("urlbardropm2",false);
		  break;

		  case "altreaderico":
			if (branch.getBoolPref("altreaderico") && classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("altreaderico",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("altreaderico",false);
		  break;
		  
		  case "hideurlzoom":
			if (branch.getBoolPref("hideurlzoom") && classicthemerestorerjs.ctr.appversion >= 51) classicthemerestorerjs.ctr.loadUnloadCSS("hideurlzoom",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("hideurlzoom",false);
		  break;
		  
		  case "urlbardark":
			if (branch.getBoolPref("urlbardark") && classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("urlbardark",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("urlbardark",false);
		  break;

		  case "altautocompl":
			if (branch.getBoolPref("altautocompl") && branch.getBoolPref("autocompl_not")==false && classicthemerestorerjs.ctr.appversion >= 48) classicthemerestorerjs.ctr.loadUnloadCSS("altautocompl",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("altautocompl",false);
		  break;
		  
		  case "urlresults": case "autocompl_it":
			if (branch.getBoolPref("urlresults")) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("urlresults",true);
			  
			  if(branch.getBoolPref("altautocompl")==false) {
				classicthemerestorerjs.ctr.ctrGetId('PopupAutoCompleteRichResult').addEventListener("popupshown", function unlockACPopupHeight(event){
				  try {
					var navbarpos = document.getElementById("nav-bar").boxObject.screenY + document.getElementById("nav-bar").boxObject.height - window.screen.top;
					classicthemerestorerjs.ctr.ctrGetId('PopupAutoCompleteRichResult').setAttribute("maxheight",document.getElementById("main-window").boxObject.height-navbarpos);
				  } catch(e){}
				}, false);
			  }
			  
			} else classicthemerestorerjs.ctr.loadUnloadCSS("urlresults",false);
		  
			if (branch.getBoolPref("autocompl_it") && branch.getBoolPref("urlresults")
				&& classicthemerestorerjs.ctr.appversion >= 48
					&& classicthemerestorerjs.ctr.appversion < 50)
						classicthemerestorerjs.ctr.loadUnloadCSS("autocompl_it",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("autocompl_it",false);
		  break;
		  
		  case "cresultshcb":  
			if (branch.getBoolPref("cresultshcb") && branch.getBoolPref("altautocompl") && classicthemerestorerjs.ctr.appversion >= 48)
			  classicthemerestorerjs.ctr.loadUnloadCSS("cresultshcb",true);
			else classicthemerestorerjs.ctr.loadUnloadCSS("cresultshcb",false);
		  break;
		  
		  case "autocompl_it2":
			if (branch.getBoolPref("autocompl_it2") && classicthemerestorerjs.ctr.appversion >= 50) {
			  
			  document.getElementById('PopupAutoCompleteRichResult').addEventListener("popupshowing", function unlockACPopupHeight(event){
				
				//get inner 'autocomplete richlistbox' of '#PopupAutoCompleteRichResult' panel
				var acrichlistbox = document.getElementById("PopupAutoCompleteRichResult").boxObject.firstChild.nextSibling;
				
				var ACObserver = new MutationObserver(function(mutations) {
				  mutations.forEach(function(mutation) {
					document.getElementById("PopupAutoCompleteRichResult").setAttribute('ctrsubboxstyle', acrichlistbox.getAttribute('style'));
				  });    
				});
				
				ACObserver.observe(acrichlistbox, { attributes: true, attributeFilter: ['style'] });
			  }, false);
			  
			  classicthemerestorerjs.ctr.loadUnloadCSS("autocompl_it2",true);
			}
			else classicthemerestorerjs.ctr.loadUnloadCSS("autocompl_it2",false);
		  break;
	  
		  case "autocompl_hlb":
			if (branch.getBoolPref("autocompl_hlb")) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("autocompl_hlb",true);
			  
			  if (branch.getBoolPref("autocompl_hln")) branch.setBoolPref("autocompl_hln",false);
			}
			else classicthemerestorerjs.ctr.loadUnloadCSS("autocompl_hlb",false);
		  break;

		  case "autocompl_hlu":
			if (branch.getBoolPref("autocompl_hlu")) classicthemerestorerjs.ctr.loadUnloadCSS("autocompl_hlu",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("autocompl_hlu",false);
		  break;

		  case "autocompl_hli":
			if (branch.getBoolPref("autocompl_hli")) classicthemerestorerjs.ctr.loadUnloadCSS("autocompl_hli",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("autocompl_hli",false);
		  break;
		  
		  case "autocompl_hln":
			if (branch.getBoolPref("autocompl_hln")) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("autocompl_hln",true);
			  
			  if (branch.getBoolPref("autocompl_hlb")) branch.setBoolPref("autocompl_hlb",false);
			}
			else classicthemerestorerjs.ctr.loadUnloadCSS("autocompl_hln",false);
		  break;
		  
		  case "autocompl_not":
			if (branch.getBoolPref("autocompl_not") && classicthemerestorerjs.ctr.appversion >= 48) {
				
			  if (branch.getBoolPref("altautocompl")) {
			    classicthemerestorerjs.ctr.loadUnloadCSS("altautocompl",false);
				classicthemerestorerjs.ctr.loadUnloadCSS("autocompl_no_t1",false);
				classicthemerestorerjs.ctr.loadUnloadCSS("autocompl_no_t2",true);  // for alt ac popup
			  } else {
			    classicthemerestorerjs.ctr.loadUnloadCSS("autocompl_no_t1",true); // for default ac popup
				classicthemerestorerjs.ctr.loadUnloadCSS("autocompl_no_t2",false);
			  }
			} else {
			  classicthemerestorerjs.ctr.loadUnloadCSS("autocompl_no_t1",false);
			  classicthemerestorerjs.ctr.loadUnloadCSS("autocompl_no_t2",false);
			  
			  if (branch.getBoolPref("altautocompl"))
			    classicthemerestorerjs.ctr.loadUnloadCSS("altautocompl",true);
			}
		  break;

		  case "autocompl_sep":
			if (branch.getBoolPref("autocompl_sep")) classicthemerestorerjs.ctr.loadUnloadCSS("autocompl_sep",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("autocompl_sep",false);
		  break;
		  
		  case "autocompl_rhl":
			if (branch.getBoolPref("autocompl_rhl") && classicthemerestorerjs.ctr.appversion >= 48) classicthemerestorerjs.ctr.loadUnloadCSS("autocompl_rhl",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("autocompl_rhl",false);
		  break;
	  
		  case "locsearchbw10":
			if (branch.getBoolPref("locsearchbw10") && classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("locsearchbw10",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("locsearchbw10",false);
		  break;

		  case "combrelstop":
			if (branch.getBoolPref("combrelstop")) classicthemerestorerjs.ctr.loadUnloadCSS("combrelstop",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("combrelstop",false);
		  break;
		  
		  case "findbar":
			classicthemerestorerjs.ctr.loadUnloadCSS('findbar_top',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('findbar_topa',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('findbar_bottoma',false);

			if (branch.getCharPref("findbar")!="findbar_default"){
			  classicthemerestorerjs.ctr.loadUnloadCSS(branch.getCharPref("findbar"),true);
			}
		  break;
		  
		  case "findb_hide_ws":
		    if (branch.getBoolPref("findb_hide_ws")) {
				// close findbar, once mouse wheel is used
				window.addEventListener("wheel", function() {
				  if(!gFindBar.hidden) gFindBar.close();
				}, false);
				
				// close findbar, once UP/DOWN keys are used
				window.addEventListener("keydown", function(event) {
				  if(event.key=="ArrowUp" || event.key=="ArrowDown")
					if(!gFindBar.hidden) gFindBar.close();
				}, false);
			}
		  break;
		  
		  case "findb_widthcb":
			if (branch.getBoolPref("findb_widthcb")) classicthemerestorerjs.ctr.loadUnloadCSS("findb_widthva",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("findb_widthva",false);
		  break;
		  
		  case "findb_widthva":
			if (branch.getBoolPref("findb_widthcb")) classicthemerestorerjs.ctr.loadUnloadCSS("findb_widthva",true);
		  break;
		  
		  case "nav_txt_ico":
			classicthemerestorerjs.ctr.loadUnloadCSS('iconsbig',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('iconstxt',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('iconstxt2',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('iconstxt3',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('iconstxt4',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('txtonly',false);
			classicthemerestorerjs.ctr.loadUnloadCSS("iat_notf_vt",false);
			classicthemerestorerjs.ctr.loadUnloadCSS("to_notf_vt",false);
			classicthemerestorerjs.ctr.loadUnloadCSS("iconstxtfull2",false);
			
			classicthemerestorerjs.ctr.setCTRModeAttributes('icons');
			
			if (branch.getBoolPref("nbcompact") && branch.getBoolPref("smallnavbut")==false)
			  classicthemerestorerjs.ctr.loadUnloadCSS("nbcompact",true);
			
			switch (branch.getCharPref("nav_txt_ico")) {

			  case "iconsbig":

				  var cstbb_used = false;
				  
				  try{
					if(Services.prefs.getBranch("extensions.cstbb-extension.").getCharPref("navbarbuttons")!="nabbuttons_off" &&
					  Services.prefs.getBranch("extensions.cstbb-extension.").getCharPref("navbarbuttons")!="nabbuttons_light") {
						cstbb_used = true;
					}
				  } catch(e) {}
					
				  if(cstbb_used==false){
					classicthemerestorerjs.ctr.loadUnloadCSS('iconsbig',true);
				  }
			
			  break;
			  case "iconstxt":
				classicthemerestorerjs.ctr.loadUnloadCSS('iconstxt',true);
				if (branch.getBoolPref("iat_notf_vt"))
				  classicthemerestorerjs.ctr.loadUnloadCSS("iat_notf_vt",true);
			    if (branch.getBoolPref("nbcompact"))
				  classicthemerestorerjs.ctr.loadUnloadCSS("nbcompact",false);
			  break;
			  case "iconstxt2":
				classicthemerestorerjs.ctr.loadUnloadCSS('iconstxt2',true);
				if (branch.getBoolPref("iat_notf_vt"))
				  classicthemerestorerjs.ctr.loadUnloadCSS("iat_notf_vt",true);
			    if (branch.getBoolPref("nbcompact"))
				  classicthemerestorerjs.ctr.loadUnloadCSS("nbcompact",false);
			  break;
			  case "iconstxt3":
				classicthemerestorerjs.ctr.loadUnloadCSS('iconstxt3',true);
				if (branch.getBoolPref("iat_notf_vt"))
				  classicthemerestorerjs.ctr.loadUnloadCSS("iat_notf_vt",true);
			    if (branch.getBoolPref("nbcompact"))
				  classicthemerestorerjs.ctr.loadUnloadCSS("nbcompact",false);
			  break;
			  case "iconstxt4":
				classicthemerestorerjs.ctr.loadUnloadCSS('iconstxt4',true);
				if (branch.getBoolPref("iat_notf_vt"))
				  classicthemerestorerjs.ctr.loadUnloadCSS("iat_notf_vt",true);
			    if (branch.getBoolPref("nbcompact"))
				  classicthemerestorerjs.ctr.loadUnloadCSS("nbcompact",false);
			  break;
			  case "txtonly":
				classicthemerestorerjs.ctr.loadUnloadCSS('txtonly',true);
				if (branch.getBoolPref("iat_notf_vt"))
				  classicthemerestorerjs.ctr.loadUnloadCSS("to_notf_vt",true);
			    if (branch.getBoolPref("nbcompact"))
				  classicthemerestorerjs.ctr.loadUnloadCSS("nbcompact",false);
			  break;
			  case "text":
				classicthemerestorerjs.ctr.setCTRModeAttributes('text');
			  break;
			  case "full":
				classicthemerestorerjs.ctr.setCTRModeAttributes('full');
			  break;
			  case "full2":
				classicthemerestorerjs.ctr.setCTRModeAttributes('full');
				classicthemerestorerjs.ctr.loadUnloadCSS("iconstxtfull2",true);
			  break;
			}

		  break;
		  
		  case "iat_notf_vt":
			if (branch.getBoolPref("iat_notf_vt")) {
			  if (branch.getCharPref("nav_txt_ico")=="iconstxt" || branch.getCharPref("nav_txt_ico")=="iconstxt2"
					|| branch.getCharPref("nav_txt_ico")=="iconstxt3" || branch.getCharPref("nav_txt_ico")=="iconstxt4")
			    classicthemerestorerjs.ctr.loadUnloadCSS("iat_notf_vt",true);
			  else if(branch.getCharPref("nav_txt_ico")=="txtonly")
			    classicthemerestorerjs.ctr.loadUnloadCSS("to_notf_vt",true);
			} else {
			  classicthemerestorerjs.ctr.loadUnloadCSS("iat_notf_vt",false);
			  classicthemerestorerjs.ctr.loadUnloadCSS("to_notf_vt",false);
			}
		  break;
		  
		  case "mbarforceleft":
			if (branch.getBoolPref("mbarforceleft")){
			  classicthemerestorerjs.ctr.loadUnloadCSS("mbarforceleft",true);
			  branch.setBoolPref("mbarforceright",false);
			}
			else classicthemerestorerjs.ctr.loadUnloadCSS("mbarforceleft",false);
		  break;
		  
		  case "mbarforceright":
			if (branch.getBoolPref("mbarforceright")){
			  classicthemerestorerjs.ctr.loadUnloadCSS("mbarforceright",true);
			  branch.setBoolPref("mbarforceleft",false);
			}
			else classicthemerestorerjs.ctr.loadUnloadCSS("mbarforceright",false);
		  break;

		  // Color settings (checkboxes)
		  
		  case "tabcolor_def":
			if (branch.getBoolPref("tabcolor_def")) classicthemerestorerjs.ctr.loadUnloadCSS("tabcolor_def",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tabcolor_def",false);
		  break;
		  
		  case "tabcolor_act":
			if (branch.getBoolPref("tabcolor_act")) classicthemerestorerjs.ctr.loadUnloadCSS("tabcolor_act",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tabcolor_act",false);
		  break;
		  
		  case "tabcolor_hov":
			if (branch.getBoolPref("tabcolor_hov")) classicthemerestorerjs.ctr.loadUnloadCSS("tabcolor_hov",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tabcolor_hov",false);
		  break;
		  
		  case "tabcolor_pen":
			if (branch.getBoolPref("tabcolor_pen")) classicthemerestorerjs.ctr.loadUnloadCSS("tabcolor_pen",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tabcolor_pen",false);
		  break;
		  
		  case "tabcolor_unr":
			if (branch.getBoolPref("tabcolor_unr")) classicthemerestorerjs.ctr.loadUnloadCSS("tabcolor_unr",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tabcolor_unr",false);
		  break;

		  
		  case "ntabcolor_def":
			if (branch.getBoolPref("ntabcolor_def")) classicthemerestorerjs.ctr.loadUnloadCSS("ntabcolor_def",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("ntabcolor_def",false);
		  break;
		  
		  case "ntabcolor_hov":
			if (branch.getBoolPref("ntabcolor_hov")) classicthemerestorerjs.ctr.loadUnloadCSS("ntabcolor_hov",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("ntabcolor_hov",false);
		  break;
		  

		  case "tabtextc_def":
			if (branch.getBoolPref("tabtextc_def")) classicthemerestorerjs.ctr.loadUnloadCSS("tabtextc_def",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tabtextc_def",false);
		  break;
		  
		  case "tabtextc_act":
			if (branch.getBoolPref("tabtextc_act")) classicthemerestorerjs.ctr.loadUnloadCSS("tabtextc_act",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tabtextc_act",false);
		  break;
		  
		  case "tabtextc_hov":
			if (branch.getBoolPref("tabtextc_hov")) classicthemerestorerjs.ctr.loadUnloadCSS("tabtextc_hov",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tabtextc_hov",false);
		  break;
		  
		  case "tabtextc_pen":
			if (branch.getBoolPref("tabtextc_pen")) classicthemerestorerjs.ctr.loadUnloadCSS("tabtextc_pen",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tabtextc_pen",false);
		  break;
		  
		  case "tabtextc_unr":
			if (branch.getBoolPref("tabtextc_unr")) classicthemerestorerjs.ctr.loadUnloadCSS("tabtextc_unr",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tabtextc_unr",false);
		  break;
		  
		  case "tabtextsh_def":
			if (branch.getBoolPref("tabtextsh_def")) classicthemerestorerjs.ctr.loadUnloadCSS("tabtextsh_def",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tabtextsh_def",false);
		  break;
		  
		  case "tabtextsh_act":
			if (branch.getBoolPref("tabtextsh_act")) classicthemerestorerjs.ctr.loadUnloadCSS("tabtextsh_act",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tabtextsh_act",false);
		  break;
		  
		  case "tabtextsh_hov":
			if (branch.getBoolPref("tabtextsh_hov")) classicthemerestorerjs.ctr.loadUnloadCSS("tabtextsh_hov",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tabtextsh_hov",false);
		  break;
		  
		  case "tabtextsh_pen":
			if (branch.getBoolPref("tabtextsh_pen")) classicthemerestorerjs.ctr.loadUnloadCSS("tabtextsh_pen",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tabtextsh_pen",false);
		  break;
		  
		  case "tabtextsh_unr":
			if (branch.getBoolPref("tabtextsh_unr")) classicthemerestorerjs.ctr.loadUnloadCSS("tabtextsh_unr",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tabtextsh_unr",false);
		  break;
		  
	  
		  // Color settings (colorpickers)
		  
		  case "ctab1": case "ctab2":
			if (branch.getBoolPref("tabcolor_def")) classicthemerestorerjs.ctr.loadUnloadCSS("tabcolor_def",true);
		  break;
		  
		  case "ctabact1": case "ctabact2":
			if (branch.getBoolPref("tabcolor_act")) classicthemerestorerjs.ctr.loadUnloadCSS("tabcolor_act",true);
		  break;
		  
		  case "ctabhov1": case "ctabhov2":
			if (branch.getBoolPref("tabcolor_hov")) classicthemerestorerjs.ctr.loadUnloadCSS("tabcolor_hov",true);
		  break;

		  case "ctabpen1": case "ctabpen2":
			if (branch.getBoolPref("tabcolor_pen")) classicthemerestorerjs.ctr.loadUnloadCSS("tabcolor_pen",true);
		  break;
		  
		  case "ctabunr1": case "ctabunr2":
			if (branch.getBoolPref("tabcolor_unr")) classicthemerestorerjs.ctr.loadUnloadCSS("tabcolor_unr",true);
		  break;

		  case "cntab1": case "cntab2":
			if (branch.getBoolPref("ntabcolor_def")) classicthemerestorerjs.ctr.loadUnloadCSS("ntabcolor_def",true);
		  break;
		  
		  case "cntabhov1": case "cntabhov2":
			if (branch.getBoolPref("ntabcolor_hov")) classicthemerestorerjs.ctr.loadUnloadCSS("ntabcolor_hov",true);
		  break;
		  
		  case "ctabt":
			if (branch.getBoolPref("tabtextc_def")) classicthemerestorerjs.ctr.loadUnloadCSS("tabtextc_def",true);
		  break;
		  
		  case "ctabhovt":
			if (branch.getBoolPref("tabtextc_hov")) classicthemerestorerjs.ctr.loadUnloadCSS("tabtextc_hov",true);
		  break;
		  
		  case "ctabactt":
			if (branch.getBoolPref("tabtextc_act")) classicthemerestorerjs.ctr.loadUnloadCSS("tabtextc_act",true);
		  break;
		  
		  case "ctabpent":
			if (branch.getBoolPref("tabtextc_pen")) classicthemerestorerjs.ctr.loadUnloadCSS("tabtextc_pen",true);
		  break;
		  
		  case "ctabunrt":
			if (branch.getBoolPref("tabtextc_unr")) classicthemerestorerjs.ctr.loadUnloadCSS("tabtextc_unr",true);
		  break;
		  
		  case 'ctabtsh':
			if (branch.getBoolPref("tabtextsh_def")) classicthemerestorerjs.ctr.loadUnloadCSS("tabtextsh_def",true);
		  break;
		  
		  case 'ctabhovtsh':
			if (branch.getBoolPref("tabtextsh_hov")) classicthemerestorerjs.ctr.loadUnloadCSS("tabtextsh_hov",true);
		  break;
		  
		  case 'ctabacttsh':
			if (branch.getBoolPref("tabtextsh_act")) classicthemerestorerjs.ctr.loadUnloadCSS("tabtextsh_act",true);
		  break;
		  
		  case 'ctabpentsh':
			if (branch.getBoolPref("tabtextsh_pen")) classicthemerestorerjs.ctr.loadUnloadCSS("tabtextsh_pen",true);
		  break;
		  
		  case 'ctabunrtsh':
			if (branch.getBoolPref("tabtextsh_unr")) classicthemerestorerjs.ctr.loadUnloadCSS("tabtextsh_unr",true);
		  break;
		  
		  
		  case "tabfbold_def":
			if (branch.getBoolPref("tabfbold_def")) classicthemerestorerjs.ctr.loadUnloadCSS("tabfbold_def",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tabfbold_def",false);
		  break;
		  
		  case "tabfbold_act":
			if (branch.getBoolPref("tabfbold_act")) classicthemerestorerjs.ctr.loadUnloadCSS("tabfbold_act",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tabfbold_act",false);
		  break;

		  case "tabfbold_hov":
			if (branch.getBoolPref("tabfbold_hov")) classicthemerestorerjs.ctr.loadUnloadCSS("tabfbold_hov",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tabfbold_hov",false);
		  break;
		  
		  case "tabfbold_pen":
			if (branch.getBoolPref("tabfbold_pen")) classicthemerestorerjs.ctr.loadUnloadCSS("tabfbold_pen",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tabfbold_pen",false);
		  break;
		  
		  case "tabfbold_unr":
			if (branch.getBoolPref("tabfbold_unr")) classicthemerestorerjs.ctr.loadUnloadCSS("tabfbold_unr",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tabfbold_unr",false);
		  break;

		  case "tabfita_def":
			if (branch.getBoolPref("tabfita_def")) classicthemerestorerjs.ctr.loadUnloadCSS("tabfita_def",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tabfita_def",false);
		  break;
		  
		  case "tabfita_act":
			if (branch.getBoolPref("tabfita_act")) classicthemerestorerjs.ctr.loadUnloadCSS("tabfita_act",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tabfita_act",false);
		  break;

		  case "tabfita_hov":
			if (branch.getBoolPref("tabfita_hov")) classicthemerestorerjs.ctr.loadUnloadCSS("tabfita_hov",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tabfita_hov",false);
		  break;
		  
		  case "tabfita_pen":
			if (branch.getBoolPref("tabfita_pen")) classicthemerestorerjs.ctr.loadUnloadCSS("tabfita_pen",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tabfita_pen",false);
		  break;
		  
		  case "tabfita_unr":
			if (branch.getBoolPref("tabfita_unr")) classicthemerestorerjs.ctr.loadUnloadCSS("tabfita_unr",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tabfita_unr",false);
		  break;
		  
		  case "tablowopa_pen":
			if (branch.getBoolPref("tablowopa_pen")) classicthemerestorerjs.ctr.loadUnloadCSS("tablowopa_pen",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tablowopa_pen",false);
		  break;
		  
		  case "tablowopa_unr":
			if (branch.getBoolPref("tablowopa_unr")) classicthemerestorerjs.ctr.loadUnloadCSS("tablowopa_unr",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tablowopa_unr",false);
		  break;
		  
		  /* exclude hover settings from unloaded/pending tab */
		  case "tabc_hov_unl":
		    if (branch.getBoolPref("tabcolor_pen")) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("tabcolor_pen",false);
			  setTimeout(function(){
				classicthemerestorerjs.ctr.loadUnloadCSS("tabcolor_pen",true);
			  },400);
			} else classicthemerestorerjs.ctr.loadUnloadCSS("tabcolor_pen",false);

		    if (branch.getBoolPref("tabtextc_pen")) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("tabtextc_pen",false);
			  setTimeout(function(){
				classicthemerestorerjs.ctr.loadUnloadCSS("tabtextc_pen",true);
			  },400);
			} else classicthemerestorerjs.ctr.loadUnloadCSS("tabtextc_pen",false);
			
		    if (branch.getBoolPref("tabtextsh_pen")) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("tabtextsh_pen",false);
			  setTimeout(function(){
				classicthemerestorerjs.ctr.loadUnloadCSS("tabtextsh_pen",true);
			  },400);
			} else classicthemerestorerjs.ctr.loadUnloadCSS("tabtextsh_pen",false);
			
		    if (branch.getBoolPref("tabfbold_pen")) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("tabfbold_pen",false);
			  setTimeout(function(){
				classicthemerestorerjs.ctr.loadUnloadCSS("tabfbold_pen",true);
			  },400);
			} else classicthemerestorerjs.ctr.loadUnloadCSS("tabfbold_pen",false);
			
		    if (branch.getBoolPref("tabfita_pen")) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("tabfita_pen",false);
			  setTimeout(function(){
				classicthemerestorerjs.ctr.loadUnloadCSS("tabfita_pen",true);
			  },400);
			} else classicthemerestorerjs.ctr.loadUnloadCSS("tabfita_pen",false);
			
			if(branch.getBoolPref("tabfbold_hov"))
			  classicthemerestorerjs.ctr.loadUnloadCSS("tabfbold_hov",true);
			else classicthemerestorerjs.ctr.loadUnloadCSS("tabfbold_hov",false);
				
			if(branch.getBoolPref("tabfita_hov"))
			  classicthemerestorerjs.ctr.loadUnloadCSS("tabfita_hov",true);
			else classicthemerestorerjs.ctr.loadUnloadCSS("tabfita_hov",false);
			
		  break;
		  
		  /* exclude hover settings from unread tab */
		  case "tabc_hov_unr":
		    if (branch.getBoolPref("tabcolor_unr")) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("tabcolor_unr",false);
			  setTimeout(function(){
				classicthemerestorerjs.ctr.loadUnloadCSS("tabcolor_unr",true);
			  },400);
			} else classicthemerestorerjs.ctr.loadUnloadCSS("tabcolor_unr",false);

		    if (branch.getBoolPref("tabtextc_unr")) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("tabtextc_unr",false);
			  setTimeout(function(){
				classicthemerestorerjs.ctr.loadUnloadCSS("tabtextc_unr",true);
			  },400);
			} else classicthemerestorerjs.ctr.loadUnloadCSS("tabtextc_unr",false);
			
		    if (branch.getBoolPref("tabtextsh_unr")) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("tabtextsh_unr",false);
			  setTimeout(function(){
				classicthemerestorerjs.ctr.loadUnloadCSS("tabtextsh_unr",true);
			  },400);
			} else classicthemerestorerjs.ctr.loadUnloadCSS("tabtextsh_unr",false);
			
		    if (branch.getBoolPref("tabfbold_unr")) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("tabfbold_unr",false);
			  setTimeout(function(){
				classicthemerestorerjs.ctr.loadUnloadCSS("tabfbold_unr",true);
			  },400);
			} else classicthemerestorerjs.ctr.loadUnloadCSS("tabfbold_unr",false);
			
		    if (branch.getBoolPref("tabfita_unr")) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("tabfita_unr",false);
			  setTimeout(function(){
				classicthemerestorerjs.ctr.loadUnloadCSS("tabfita_unr",true);
			  },400);
			} else classicthemerestorerjs.ctr.loadUnloadCSS("tabfita_unr",false);
			
			if(branch.getBoolPref("tabfbold_hov"))
			  classicthemerestorerjs.ctr.loadUnloadCSS("tabfbold_hov",true);
			else classicthemerestorerjs.ctr.loadUnloadCSS("tabfbold_hov",false);
				
			if(branch.getBoolPref("tabfita_hov"))
			  classicthemerestorerjs.ctr.loadUnloadCSS("tabfita_hov",true);
			else classicthemerestorerjs.ctr.loadUnloadCSS("tabfita_hov",false);

		  break;
		  
		  case "tabc_act_tb":
			if (branch.getBoolPref("tabc_act_tb")) branch.setBoolPref("aerocolors",false);
			
			if (branch.getBoolPref("tabcolor_act")) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("tabcolor_act",true);
			}
			else classicthemerestorerjs.ctr.loadUnloadCSS("tabcolor_act",false);
		  break;

		  // Special	  
		  case "altmenubar":
			if (branch.getBoolPref("altmenubar") && classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("altmenubar",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("altmenubar",false);
		  break;
		  
		  case "altmbarpos":
			classicthemerestorerjs.ctr.loadUnloadCSS('altmbarpos1',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('altmbarpos2',false);
		
			if (branch.getCharPref("altmbarpos")!="altmbarpos0"){
			  classicthemerestorerjs.ctr.loadUnloadCSS(branch.getCharPref("altmbarpos"),true);
			}
		  break;
	  
		  case "menubarnofog":
			if (branch.getBoolPref("menubarnofog") && classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("menubarnofog",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("menubarnofog",false);
		  break;
		  
		  case "menubarfs":
			if (branch.getBoolPref("menubarfs") && classicthemerestorerjs.ctr.fxdefaulttheme==true) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("menubarfs",true);
		      try {
				document.getElementById("navigator-toolbox").setAttribute('ctrmenubarfs',true);
			  } catch(e) {}
			}
			else {
			  classicthemerestorerjs.ctr.loadUnloadCSS("menubarfs",false);
			  try {
				if (document.getElementById("navigator-toolbox").hasAttribute('ctrmenubarfs'))
				  document.getElementById("navigator-toolbox").removeAttribute('ctrmenubarfs');
			  } catch(e) {}
			} 			  
		  break;
		  
		  case "noaddonbarbg":
			if (branch.getBoolPref("noaddonbarbg") && classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("noaddonbarbg",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("noaddonbarbg",false);
		  break;
		  
		  case "notabfog":
			if (branch.getBoolPref("notabfog")) {
				classicthemerestorerjs.ctr.loadUnloadCSS("notabfog",true);
				branch.setBoolPref("alttabstb",false);
			}
			else classicthemerestorerjs.ctr.loadUnloadCSS("notabfog",false);
		  break;
		  
		  case "notabbg":
			if (branch.getBoolPref("notabbg")) {
				classicthemerestorerjs.ctr.loadUnloadCSS("notabbg",true);
				branch.setBoolPref("alttabstb",false);
			}
			else classicthemerestorerjs.ctr.loadUnloadCSS("notabbg",false);
		  break;
		  
		  case "nobookbarbg":
			if (branch.getBoolPref("nobookbarbg") && classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("nobookbarbg",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("nobookbarbg",false);
		  break;

		  case "bookbarfs":
			if (branch.getBoolPref("bookbarfs") && classicthemerestorerjs.ctr.fxdefaulttheme==true) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("bookbarfs",true);
			  try {
				document.getElementById("navigator-toolbox").setAttribute('ctrbookbarfs',true);
			  } catch(e) {}
			}
			else {
			  classicthemerestorerjs.ctr.loadUnloadCSS("bookbarfs",false);
			  try {
				if (document.getElementById("navigator-toolbox").hasAttribute('ctrbookbarfs'))
				  document.getElementById("navigator-toolbox").removeAttribute('ctrbookbarfs');
			  } catch(e) {}
			}
		  break;

		  case "transpttbw10":
			if (branch.getBoolPref("transpttbw10") && classicthemerestorerjs.ctr.fxdefaulttheme==true) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("transpttbw10",true);
			  
			  if (branch.getBoolPref("transptcw10"))
				classicthemerestorerjs.ctr.loadUnloadCSS("transptcw10",true);

			  if (branch.getBoolPref("transpttbew10"))
				classicthemerestorerjs.ctr.loadUnloadCSS("transpttbew10",true);
			}
			else {
			  classicthemerestorerjs.ctr.loadUnloadCSS("transpttbw10",false);
			  classicthemerestorerjs.ctr.loadUnloadCSS("transpttbew10",false);
			  classicthemerestorerjs.ctr.loadUnloadCSS("transptcw10",false);
			}
		  break;
		  
		  case "transptcw10":
			if (branch.getBoolPref("transptcw10") && branch.getBoolPref("transpttbw10") && classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("transptcw10",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("transptcw10",false);
		  break;
		  
		  case "transpttbew10":
			if (branch.getBoolPref("transpttbew10") && branch.getBoolPref("transpttbw10") && classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("transpttbew10",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("transpttbew10",false);
		  break;

		  case "nonavbarbg":
			if (branch.getBoolPref("nonavbarbg") && classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("nonavbarbg",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("nonavbarbg",false);
		  break;
		  
		  case "nonavborder":
			if (branch.getBoolPref("nonavborder") && classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("nonavborder",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("nonavborder",false);
		  break;
		  
		  case "nonavtbborder":
			if (branch.getBoolPref("nonavtbborder") && classicthemerestorerjs.ctr.fxdefaulttheme==true) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("nonavtbborder",true);
			  branch.setBoolPref("tbsep_winc",false);
			}
			else classicthemerestorerjs.ctr.loadUnloadCSS("nonavtbborder",false);
		  break;
		  
		  case "toptb_oldpad":
			if (branch.getBoolPref("toptb_oldpad") && classicthemerestorerjs.ctr.appversion >= 51) classicthemerestorerjs.ctr.loadUnloadCSS("toptb_oldpad",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("toptb_oldpad",false);
		  break;

		  case "hidesbclose":
			if (branch.getBoolPref("hidesbclose")) classicthemerestorerjs.ctr.loadUnloadCSS("hidesbclose",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("hidesbclose",false);
		  break;
		  
		  case "notextshadow":
			if (branch.getBoolPref("notextshadow")) classicthemerestorerjs.ctr.loadUnloadCSS("notextshadow",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("notextshadow",false);
		  break;
		  
		  case "chevronfix":
			if (branch.getBoolPref("chevronfix")) classicthemerestorerjs.ctr.loadUnloadCSS("chevronfix",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("chevronfix",false);
		  break;
		  
		  case "tbsep_winc":
			if (branch.getBoolPref("tbsep_winc") && classicthemerestorerjs.ctr.fxdefaulttheme==true) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("tbsep_winc",true);
			  branch.setBoolPref("nonavtbborder",false);
			}
			else classicthemerestorerjs.ctr.loadUnloadCSS("tbsep_winc",false);
		  break;
		  
		  case "tabseparator":
		  
			classicthemerestorerjs.ctr.loadUnloadCSS('tabsep_black',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('tabsep_white',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('tabsep_luna',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('tabsep_xp',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('tabsep_black_sol',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('tabsep_white_sol',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('tabsep_black_sol2',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('tabsep_white_sol2',false);
			
			if (branch.getCharPref("tabseparator")!="tabsep_default" && classicthemerestorerjs.ctr.fxdefaulttheme==true){
			  classicthemerestorerjs.ctr.loadUnloadCSS(branch.getCharPref("tabseparator"),true);
			}

		  break;
		  
		  case "tabmokcolor":
			if (branch.getBoolPref("tabmokcolor") && classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("tabmokcolor",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tabmokcolor",false);
		  break;

		  case "tabmokcolor2":
			if (branch.getBoolPref("tabmokcolor2") && classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("tabmokcolor2",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tabmokcolor2",false);
		  break;

		  case "tabmokcolor4":
			if (branch.getBoolPref("tabmokcolor4") && classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("tabmokcolor4",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tabmokcolor4",false);
		  break;

		  case "closeabarbut":
			if (branch.getBoolPref("closeabarbut"))	classicthemerestorerjs.ctr.loadUnloadCSS("closeabarbut",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("closeabarbut",false);
		  break;

		  case "bf_space":
			if (branch.getBoolPref("bf_space") && classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("bf_space",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("bf_space",false);
		  break;		  

		  case "emptyfavico_t":
			  
			classicthemerestorerjs.ctr.loadUnloadCSS('emptyfavico_t_dot',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('emptyfavico_t_dot2',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('emptyfavico_t_gen',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('emptyfavico_t_gen2',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('emptyfavico_t_sheet',false);
			
			if (branch.getCharPref("emptyfavico_t")!="emptyfavico_t_none"){
			  classicthemerestorerjs.ctr.loadUnloadCSS(branch.getCharPref("emptyfavico_t"),true);
			}
			
			if (branch.getBoolPref("faviconurl")) {classicthemerestorerjs.ctr.favIconinUrlbarCTR();}
		  break;

		  case "emptyfavico_g":
			  
			classicthemerestorerjs.ctr.loadUnloadCSS('emptyfavico_g_def2',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('emptyfavico_g_dot',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('emptyfavico_g_dot2',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('emptyfavico_g_sheet',false);
			
			if (branch.getCharPref("emptyfavico_g")!="emptyfavico_g_def"){
			  classicthemerestorerjs.ctr.loadUnloadCSS(branch.getCharPref("emptyfavico_g"),true);
			}

		  break;
		  
		  case "noemptypticon":
			if (branch.getBoolPref("noemptypticon")) classicthemerestorerjs.ctr.loadUnloadCSS("noemptypticon",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("noemptypticon",false);
		  break;
		  
		  case "hidezoomres":
			if (branch.getBoolPref("hidezoomres")) classicthemerestorerjs.ctr.loadUnloadCSS("hidezoomres",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("hidezoomres",false);
		  break;
		  
		  case "alt_newtabp":
			if (branch.getBoolPref("alt_newtabp")) classicthemerestorerjs.ctr.loadUnloadCSS("alt_newtabp",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("alt_newtabp",false);
		  break;
		  
		  case "ctroldsearch":
			if (branch.getBoolPref("ctroldsearch")) {
				classicthemerestorerjs.ctr.loadUnloadCSS("ctroldsearch",true);
				
				if (branch.getBoolPref("osearch_dm"))
				  classicthemerestorerjs.ctr.loadUnloadCSS("osearch_dm",true);
			}
			else { 
			  classicthemerestorerjs.ctr.loadUnloadCSS("ctroldsearch",false);
			  classicthemerestorerjs.ctr.loadUnloadCSS("osearch_dm",false);
			}
			  
			classicthemerestorerjs.ctr.loadUnloadCSS('cui_buttons',true);
		  break;
		  
		  case "osearch_iwidth":
			if (branch.getBoolPref("osearch_iwidth")) classicthemerestorerjs.ctr.loadUnloadCSS("osearch_iwidth",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("osearch_iwidth",false);
		  break;
		  
		  case "osearch_cwidth": case "os_spsize_minw": case "os_spsize_maxw":
		    if (branch.getBoolPref("osearch_cwidth")) 
			  classicthemerestorerjs.ctr.loadUnloadCSS("osearch_cwidth",true);
		    else
			  classicthemerestorerjs.ctr.loadUnloadCSS("osearch_cwidth",false);
		  break;

		  case "osearch_dm":
			if (branch.getBoolPref("osearch_dm") && branch.getBoolPref("ctroldsearch"))
				classicthemerestorerjs.ctr.loadUnloadCSS("osearch_dm",true);
			else classicthemerestorerjs.ctr.loadUnloadCSS("osearch_dm",false);
		  break;
		  
		  case "searchbardark":
			if (branch.getBoolPref("searchbardark") && classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("searchbardark",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("searchbardark",false);
		  break;

		  case "am_nowarning":
			if (branch.getBoolPref("am_nowarning")) classicthemerestorerjs.ctr.loadUnloadCSS("am_nowarning",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("am_nowarning",false);
		  break;

		  case "am_compact":
			if (branch.getBoolPref("am_compact") && classicthemerestorerjs.ctr.fxdefaulttheme==true) {
				classicthemerestorerjs.ctr.loadUnloadCSS("am_compact",true);
				if (branch.getBoolPref("am_compact2"))
				  classicthemerestorerjs.ctr.loadUnloadCSS("am_compact2",true);
			}
			else { 
			  classicthemerestorerjs.ctr.loadUnloadCSS("am_compact",false);
			  classicthemerestorerjs.ctr.loadUnloadCSS("am_compact2",false);
			}
		  break;

		  case "am_compact2":
			if (branch.getBoolPref("am_compact") && branch.getBoolPref("am_compact2")
				&& classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("am_compact2",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("am_compact2",false);
		  break;

		  case "am_highlight":
			if (branch.getBoolPref("am_highlight")) classicthemerestorerjs.ctr.loadUnloadCSS("am_highlight",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("am_highlight",false);
		  break;
		  
		  case "am_buticons":
			if (branch.getBoolPref("am_buticons")) classicthemerestorerjs.ctr.loadUnloadCSS("am_buticons",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("am_buticons",false);
		  break;
		  
		  case "am_hovshowb":
			if (branch.getBoolPref("am_hovshowb")) classicthemerestorerjs.ctr.loadUnloadCSS("am_hovshowb",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("am_hovshowb",false);
		  break;

		  case "alt_newtabpalt":
			classicthemerestorerjs.ctr.loadUnloadCSS("alt_newtabpalt",branch.getBoolPref("alt_newtabpalt"));
		  break;

		  case "alt_addonsp":
			if (branch.getBoolPref("alt_addonsp")) classicthemerestorerjs.ctr.loadUnloadCSS("alt_addonsp",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("alt_addonsp",false);
		  break;

		  case "am_showrecup":
			if (branch.getBoolPref("am_showrecup")) classicthemerestorerjs.ctr.loadUnloadCSS("am_showrecup",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("am_showrecup",false);
		  break;
		  
		  case "alt_addonsm":
			if (branch.getBoolPref("alt_addonsm") && classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("alt_addonsm",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("alt_addonsm",false);

			var devtheme=false;
			if(classicthemerestorerjs.ctr.fxdevelopertheme==true) devtheme=true;
			
			if (branch.getBoolPref("aerocolors") && classicthemerestorerjs.ctr.fxdefaulttheme==true && devtheme==false) { 
			  classicthemerestorerjs.ctr.loadUnloadCSS("aerocolors",false);
			  classicthemerestorerjs.ctr.loadUnloadCSS("aerocolors",true);
			}
		  break;

		  case "hideeditbm":
		    if(classicthemerestorerjs.ctr.appversion >= 47) {
				if (branch.getBoolPref("hideeditbm")) {

					document.getElementById("bookmarks-menu-button").addEventListener("click", function(e) {
											
						document.getElementById('editBookmarkPanel').style.visibility = 'hidden';
						
						document.getElementById('editBookmarkPanel').addEventListener("popupshown", function(){
							
						  if (document.getElementById('bookmarks-menu-button').hasAttribute('notification')) {
							StarUI.panel.hidePopup();
							StarUI.quitEditMode();
							document.getElementById('editBookmarkPanel').removeAttribute('panelopen');
							document.getElementById('editBookmarkPanel').removeAttribute('animate');

							if(e.target.localName == "toolbarbutton" && e.originalTarget.getAttribute("anonid") == "button"){
								e.originalTarget.removeAttribute('open');
							}
						  } else document.getElementById('editBookmarkPanel').style.visibility = 'visible';

						}, false);

					}, false);
				}
			}
		  break;
		  
		  case "oldplacesbut":
			if (branch.getBoolPref("oldplacesbut") && classicthemerestorerjs.ctr.appversion >= 50) classicthemerestorerjs.ctr.loadUnloadCSS("oldplacesbut",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("oldplacesbut",false);
		  break;

		  case "bmbutpanelm":
			if (branch.getBoolPref("bmbutpanelm")) classicthemerestorerjs.ctr.loadUnloadCSS("bmbutpanelm",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("bmbutpanelm",false);
		  break;

		  case "bmbunsortbm": case "bmbunsortbm2":
			if (branch.getBoolPref("bmbunsortbm") && branch.getBoolPref("bmbunsortbm2")==false) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("bmbunsortbm",true);
			  classicthemerestorerjs.ctr.loadUnloadCSS("bmbunsortbm2",false);
			} else if (branch.getBoolPref("bmbunsortbm") && branch.getBoolPref("bmbunsortbm2")) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("bmbunsortbm",false);
			  classicthemerestorerjs.ctr.loadUnloadCSS("bmbunsortbm2",true);
			} else {
			  classicthemerestorerjs.ctr.loadUnloadCSS("bmbunsortbm",false);
			  classicthemerestorerjs.ctr.loadUnloadCSS("bmbunsortbm2",false);
			}
		  break;

		  case "bmbviewbmsb":
			if (branch.getBoolPref("bmbviewbmsb")) classicthemerestorerjs.ctr.loadUnloadCSS("bmbviewbmsb",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("bmbviewbmsb",false);
		  break;
		  
		  case "bmbviewbmtb":
			if (branch.getBoolPref("bmbviewbmtb")) classicthemerestorerjs.ctr.loadUnloadCSS("bmbviewbmtb",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("bmbviewbmtb",false);
		  break;
		  
		  case "bmbutnotb":
			if (branch.getBoolPref("bmbutnotb")) classicthemerestorerjs.ctr.loadUnloadCSS("bmbutnotb",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("bmbutnotb",false);
			  
			if (branch.getBoolPref("bmbutnotb") && branch.getBoolPref("bmbnounsort")) classicthemerestorerjs.ctr.loadUnloadCSS("bmbutnotbuns",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("bmbutnotbuns",false);
			  
			// for MacOSX: hide item using js instead of css or it won't work
			if (classicthemerestorerjs.ctr.osstring=="Darwin"){
				if (branch.getBoolPref("bmbutnotb")) {
					setTimeout(function(){
					  try{
						document.getElementById("bookmarksToolbarFolderMenu").collapsed = true;
					  } catch(e){}
					},500);
				}
				else {
				  setTimeout(function(){
					try{
					  document.getElementById("bookmarksToolbarFolderMenu").collapsed = false;
					} catch(e){}
				  },500);
				}
			}
		  break;
		  
		  case "bmbnounsort":
			if (branch.getBoolPref("bmbnounsort")) classicthemerestorerjs.ctr.loadUnloadCSS("bmbnounsort",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("bmbnounsort",false);
			  
			if (branch.getBoolPref("bmbutnotb") && branch.getBoolPref("bmbnounsort")) classicthemerestorerjs.ctr.loadUnloadCSS("bmbutnotbuns",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("bmbutnotbuns",false);
			  
			// for MacOSX: hide item using js instead of css or it won't work
			if (classicthemerestorerjs.ctr.osstring=="Darwin"){
				if (branch.getBoolPref("bmbnounsort")) {
					setTimeout(function(){
					  try{
						document.getElementById("menu_unsortedBookmarks").collapsed = true;
					  } catch(e){}
					},500);
				}
				else {
				  setTimeout(function(){
					try{
					  document.getElementById("menu_unsortedBookmarks").collapsed = false;
					} catch(e){}
				  },500);
				}
			}
		  break;
		  
		  case "bmbutclpopup":
			if (branch.getBoolPref("bmbutclpopup")) classicthemerestorerjs.ctr.loadUnloadCSS("bmbutclpopup",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("bmbutclpopup",false);
		  break;

		  case "bmbutnotext":
			if (branch.getBoolPref("bmbutnotext")) classicthemerestorerjs.ctr.loadUnloadCSS("bmbutnotext",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("bmbutnotext",false);
		  break;

		  case "tbconmenu":
			if (branch.getBoolPref("tbconmenu")) classicthemerestorerjs.ctr.loadUnloadCSS("tbconmenu",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("tbconmenu",false);
		  break;

		  case "noresizerxp":
			if (branch.getBoolPref("noresizerxp")) classicthemerestorerjs.ctr.loadUnloadCSS("noresizerxp",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("noresizerxp",false);
		  break;

		  case "pmhidelabels":
			if (branch.getBoolPref("pmhidelabels")) classicthemerestorerjs.ctr.loadUnloadCSS("pmhidelabels",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("pmhidelabels",false);
		  break;
		  
		  case "menupopupscr":
			if (branch.getBoolPref("menupopupscr")) classicthemerestorerjs.ctr.loadUnloadCSS("menupopupscr",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("menupopupscr",false);
		  break;

		  case "ib_nohovcolor":
			if (branch.getBoolPref("ib_nohovcolor") && classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("ib_nohovcolor",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("ib_nohovcolor",false);
		  break;

		  case "ib_graycolor":
			if (branch.getBoolPref("ib_graycolor") && classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("ib_graycolor",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("ib_graycolor",false);
		  break;

		  case "verifiedcolors":
			if (branch.getBoolPref("verifiedcolors") && classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("verifiedcolors",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("verifiedcolors",false);
		  break;

		  case "ibinfoico":
			if (branch.getBoolPref("ibinfoico")) classicthemerestorerjs.ctr.loadUnloadCSS("ibinfoico",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("ibinfoico",false);
		  break;

		  case "ibinfoico2":
			if (branch.getBoolPref("ibinfoico2") && branch.getBoolPref("faviconurl")==false
			  && branch.getCharPref("padlock")!="padlock_none")
				classicthemerestorerjs.ctr.loadUnloadCSS("ibinfoico2",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("ibinfoico2",false);
		  break;

		  case "iblabels":
			if (branch.getBoolPref("iblabels")) classicthemerestorerjs.ctr.loadUnloadCSS("iblabels",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("iblabels",false);
		  break;

		  case "hideprivmask":
			if (branch.getBoolPref("hideprivmask")) classicthemerestorerjs.ctr.loadUnloadCSS("hideprivmask",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("hideprivmask",false);
		  break;

		  case "highaddonsbar":
			if (branch.getBoolPref("highaddonsbar")){
			  classicthemerestorerjs.ctr.loadUnloadCSS("highaddonsbar",true);
			  branch.setBoolPref("lessaddonsbar",false);
			}
			else classicthemerestorerjs.ctr.loadUnloadCSS("highaddonsbar",false);
		  break;
		  
		  case "lessaddonsbar":
			if (branch.getBoolPref("lessaddonsbar")){
			  classicthemerestorerjs.ctr.loadUnloadCSS("lessaddonsbar",true);
			  branch.setBoolPref("highaddonsbar",false);
			}
			else classicthemerestorerjs.ctr.loadUnloadCSS("lessaddonsbar",false);
		  break;
		  
		  case "addonbarfs":
			if (branch.getBoolPref("addonbarfs")) classicthemerestorerjs.ctr.loadUnloadCSS("addonbarfs",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("addonbarfs",false);
		  break;
	  
		  case "tabthrobber":
		  
			classicthemerestorerjs.ctr.loadUnloadCSS('throbber_alt',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('throbber_fx39',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('throbber_nav',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('throbber_ub',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('cctr/throbber_alt1',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('cctr/throbber_alt2',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('cctr/throbber_alt3',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('cctr/throbber_alt4',false);
			classicthemerestorerjs.ctr.loadUnloadCSS('cctr/throbber_alt5',false);
			if (branch.getCharPref("tabthrobber")!="throbber_default"){
			  classicthemerestorerjs.ctr.loadUnloadCSS(branch.getCharPref("tabthrobber"),true);
			}

		  break;
		  
		  // reverse option to match other animation preference labels
		  case "bmanimation":
			if (branch.getBoolPref("bmanimation")) classicthemerestorerjs.ctr.loadUnloadCSS("bmanimation",false);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("bmanimation",true);
		  break;

		  case "pananimation":
			if (branch.getBoolPref("pananimation")) classicthemerestorerjs.ctr.loadUnloadCSS("pananimation",false);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("pananimation",true);
		  break;
		  // end reverse...

		  case "fsaduration":
				if (branch.getBoolPref("fsaduration")) {
				  if (classicthemerestorerjs.ctr.fullscreeduration == true) {
					try {
					  Services.prefs.getBranch("full-screen-api.transition-duration.").setCharPref('enter','200 200');
					  Services.prefs.getBranch("full-screen-api.transition-duration.").setCharPref('leave','200 200');
					} catch(e){}
				  }
				} else {
				  classicthemerestorerjs.ctr.fullscreeduration = true;
				  try {
					Services.prefs.getBranch("full-screen-api.transition-duration.").setCharPref('enter','0 0');
					Services.prefs.getBranch("full-screen-api.transition-duration.").setCharPref('leave','0 0');
				  } catch(e){}
				}
		  break;
		  
		  case "html5warning":
				if (branch.getBoolPref("html5warning")) {
				  if (classicthemerestorerjs.ctr.html5warning == true) {
					try {
					  Services.prefs.getBranch("full-screen-api.warning.").setIntPref('timeout',3000);
					  Services.prefs.getBranch("full-screen-api.warning.").setIntPref('delay',500);
					} catch(e){}
				  }
				} else {
				  classicthemerestorerjs.ctr.html5warning = true;
				  try {
					Services.prefs.getBranch("full-screen-api.warning.").setIntPref('timeout',0);
					Services.prefs.getBranch("full-screen-api.warning.").setIntPref('delay',0);
				  } catch(e){}
				}
		  break;

		  case "dblclnewtab":
			
			if (branch.getBoolPref("dblclnewtab")==true && classicthemerestorerjs.ctr.osstring=="WINNT") {
			
				document.getElementById("TabsToolbar").addEventListener("dblclick", function openNewTabOnDoubleClick(e) {
				
					// remove listener, if the preference got disabled in-between
					if (Services.prefs.getBranch("extensions.classicthemerestorer.").getBoolPref("dblclnewtab")==false) {
						document.getElementById("TabsToolbar").removeEventListener("dblclick", openNewTabOnDoubleClick, false);
						return;
					} else if(e.button==0 && e.target.localName != "tab"
						&& e.target.localName != "toolbarbutton"
						  && e.target.localName != "arrowscrollbox"
							&& e.originalTarget.getAttribute("anonid") != "scrollbutton-up"
							  && e.originalTarget.getAttribute("anonid") != "scrollbutton-down"
								&& e.originalTarget.getAttribute("anonid") != "close-button")
					{

					  if(classicthemerestorerjs.ctr.appversion >= 47 && Services.prefs.getBranch("browser.tabs.").getBoolPref("drawInTitlebar")==false
						&& (classicthemerestorerjs.ctr.fxdefaulttheme==true
							|| Services.prefs.getBranch("lightweightThemes.").getCharPref('selectedThemeID')=='firefox-devedition@mozilla.org'
							|| Services.prefs.getBranch("lightweightThemes.").getCharPref('selectedThemeID')=='firefox-compact-dark@mozilla.org'
							|| Services.prefs.getBranch("lightweightThemes.").getCharPref('selectedThemeID')=='firefox-compact-light@mozilla.org'
						   )
						) {
						//do nothing
					  } else {
						BrowserOpenTab();

						e.stopPropagation();
						e.preventDefault();
					  }
					}

				}, false);
				
			}

		  break;
		  
		  case "hidetbwot":
			if (branch.getBoolPref("hidetbwot")) {
		      classicthemerestorerjs.ctr.loadUnloadCSS("hidetbwotextra",true);
			  classicthemerestorerjs.ctr.hideTabsToolbarWithOneTab();
			} else {
			 classicthemerestorerjs.ctr.loadUnloadCSS("hidetbwotextra",false);
			}
		  break;

		  case "faviconurl": case "padlockex":
			if (branch.getBoolPref("faviconurl")) {
				classicthemerestorerjs.ctr.favIconinUrlbarCTR();
				classicthemerestorerjs.ctr.loadUnloadCSS("faviconurl",true);
			} else {
				classicthemerestorerjs.ctr.loadUnloadCSS("faviconurl",false);
			}
		  break;
		  
		  case "padlock":
			if (branch.getBoolPref("faviconurl"))
		      classicthemerestorerjs.ctr.favIconinUrlbarCTR();
			else if (branch.getCharPref("padlock")!="padlock_default"){

				classicthemerestorerjs.ctr.loadUnloadCSS('padlock_default',false);
				classicthemerestorerjs.ctr.loadUnloadCSS('padlock_classic',false);
				classicthemerestorerjs.ctr.loadUnloadCSS('padlock_amo',false);
				classicthemerestorerjs.ctr.loadUnloadCSS('padlock_modern',false);
				classicthemerestorerjs.ctr.loadUnloadCSS('padlock_modern2',false);
				classicthemerestorerjs.ctr.loadUnloadCSS('padlock_none',false);
				classicthemerestorerjs.ctr.loadUnloadCSS('padlock2_none',false);
				classicthemerestorerjs.ctr.loadUnloadCSS('padlock2_classic',false);
				classicthemerestorerjs.ctr.loadUnloadCSS('padlock2_amo',false);
				classicthemerestorerjs.ctr.loadUnloadCSS('padlock2_modern',false);
				classicthemerestorerjs.ctr.loadUnloadCSS('padlock2_modern2',false);
			
				switch (branch.getCharPref("padlock")) {

				  case "padlock_none":
				  	classicthemerestorerjs.ctr.loadUnloadCSS("padlock2_none",true);
				  break;
				  case "padlock_classic":
				  	classicthemerestorerjs.ctr.loadUnloadCSS("padlock2_classic",true);	
				  break;
				  case "padlock_amo":
				  	classicthemerestorerjs.ctr.loadUnloadCSS("padlock2_amo",true);	
				  break;
				  case "padlock_modern":
				  	classicthemerestorerjs.ctr.loadUnloadCSS("padlock2_modern",true);	
				  break;
				  case "padlock_modern2":
				  	classicthemerestorerjs.ctr.loadUnloadCSS("padlock2_modern2",true);	
				  break;

				}
				
				if(branch.getCharPref("padlock")=="padlock_none" && branch.getBoolPref("ibinfoico2"))
				  classicthemerestorerjs.ctr.loadUnloadCSS("ibinfoico2",false);
				else if(branch.getBoolPref("ibinfoico2"))
				  classicthemerestorerjs.ctr.loadUnloadCSS("ibinfoico2",true);

			} else {
				classicthemerestorerjs.ctr.loadUnloadCSS('padlock_default',false);
				classicthemerestorerjs.ctr.loadUnloadCSS('padlock_classic',false);
				classicthemerestorerjs.ctr.loadUnloadCSS('padlock_amo',false);
				classicthemerestorerjs.ctr.loadUnloadCSS('padlock_modern',false);
				classicthemerestorerjs.ctr.loadUnloadCSS('padlock_modern2',false);
				classicthemerestorerjs.ctr.loadUnloadCSS('padlock_none',false);
				classicthemerestorerjs.ctr.loadUnloadCSS('padlock2_none',false);
				classicthemerestorerjs.ctr.loadUnloadCSS('padlock2_classic',false);
				classicthemerestorerjs.ctr.loadUnloadCSS('padlock2_amo',false);
				classicthemerestorerjs.ctr.loadUnloadCSS('padlock2_modern',false);
				classicthemerestorerjs.ctr.loadUnloadCSS('padlock2_modern2',false);
				
				if(branch.getBoolPref("ibinfoico2"))
				  classicthemerestorerjs.ctr.loadUnloadCSS("ibinfoico2",true);
			}
		  break;
		  
		  case "hightabpososx":
			
			if (branch.getBoolPref("hightabpososx") && classicthemerestorerjs.ctr.osstring!="Darwin" && classicthemerestorerjs.ctr.fxdefaulttheme==true){
			  classicthemerestorerjs.ctr.loadUnloadCSS("hightabpososx",true);
			  branch.setBoolPref("appbutmhi",false);
			} else if (branch.getBoolPref("hightabpososx") && branch.getBoolPref("hidetbwot")==false && classicthemerestorerjs.ctr.fxdefaulttheme==true) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("hightabpososx",true);
			  branch.setBoolPref("appbutmhi",false);
			} else classicthemerestorerjs.ctr.loadUnloadCSS("hightabpososx",false);

		  break;
		  
		  case "showalltabsb":
			if (branch.getBoolPref("showalltabsb")) classicthemerestorerjs.ctr.loadUnloadCSS("showalltabsb",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("showalltabsb",false);
		  break;
		  
		  case "alttabstb":
			if (branch.getBoolPref("alttabstb") && classicthemerestorerjs.ctr.fxdefaulttheme==true) {
			  classicthemerestorerjs.ctr.loadUnloadCSS("alttabstb",true);
			  branch.setBoolPref("notabfog",false);
			  branch.setBoolPref("notabbg",false);
			  if (branch.getBoolPref("alttabstb2"))
				  classicthemerestorerjs.ctr.loadUnloadCSS("alttabstb2",true);
			}
			else {
			  classicthemerestorerjs.ctr.loadUnloadCSS("alttabstb",false);
			  if (branch.getBoolPref("alttabstb2"))
				  classicthemerestorerjs.ctr.loadUnloadCSS("alttabstb2",false);
			}
		  break;
		  
		  case "alttabstb2":
			if (branch.getBoolPref("alttabstb2") && branch.getBoolPref("alttabstb")
				&& classicthemerestorerjs.ctr.fxdefaulttheme==true)
					classicthemerestorerjs.ctr.loadUnloadCSS("alttabstb2",true);
			else classicthemerestorerjs.ctr.loadUnloadCSS("alttabstb2",false);
		  break;

		  case "cpanelmenus":
			if (branch.getBoolPref("cpanelmenus")) classicthemerestorerjs.ctr.loadUnloadCSS("cpanelmenus",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("cpanelmenus",false);
		  break;

		  case "panelmenucol":
			if (branch.getBoolPref("panelmenucol") && classicthemerestorerjs.ctr.fxdefaulttheme==true)
			  classicthemerestorerjs.ctr.loadUnloadCSS("panelmenucol",true);
			else classicthemerestorerjs.ctr.loadUnloadCSS("panelmenucol",false);
		  break;
		  
		  //inv icons START
		  case "invicomenubar":
			if (branch.getBoolPref("invicomenubar") && classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("invicomenubar",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("invicomenubar",false);
		  break;
		  
		  case "invicotabsbar":
			if (branch.getBoolPref("invicotabsbar") && classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("invicotabsbar",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("invicotabsbar",false);
		  break;
		  
		  case "inviconavbar":
			if (branch.getBoolPref("inviconavbar") && classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("inviconavbar",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("inviconavbar",false);
		  break;

		  case "invicoextrabar":
			if (branch.getBoolPref("invicoextrabar") && classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("invicoextrabar",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("invicoextrabar",false);
		  break;
		  
		  case "invicobookbar":
			if (branch.getBoolPref("invicobookbar") && classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("invicobookbar",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("invicobookbar",false);
		  break;
		  
		  case "invicoaddonbar":
			if (branch.getBoolPref("invicoaddonbar") && classicthemerestorerjs.ctr.fxdefaulttheme==true) classicthemerestorerjs.ctr.loadUnloadCSS("invicoaddonbar",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("invicoaddonbar",false);
		  break;
		  //inv icons END
		  
		  case "oldfontgfx":
		  
			if(classicthemerestorerjs.ctr.osstring=="WINNT" && classicthemerestorerjs.ctr.appversion >= 52){
				if (!branch.getBoolPref("oldfontgfx")) {
				  if (classicthemerestorerjs.ctr.oldfontgfxOn == true) {
					try {
					  Services.prefs.getBranch("gfx.content.azure.").setCharPref('backends','direct2d1.1,skia,cairo');
					  Services.prefs.getBranch("gfx.canvas.azure.").setCharPref('backends','direct2d1.1,skia,cairo');
					} catch(e){}
				  }
				} else {
					classicthemerestorerjs.ctr.oldfontgfxOn = true;
					try {
					  Services.prefs.getBranch("gfx.content.azure.").setCharPref('backends','direct2d1.1,cairo,skia');
					  Services.prefs.getBranch("gfx.canvas.azure.").setCharPref('backends','direct2d1.1,cairo,skia');
					} catch(e){}
				}
			}
		  
		  case "toolsitem":
			
			// for Windows & Linux
			if (classicthemerestorerjs.ctr.osstring!="Darwin"){
				if (branch.getBoolPref("toolsitem")) classicthemerestorerjs.ctr.loadUnloadCSS("toolsitem",false);
				  else classicthemerestorerjs.ctr.loadUnloadCSS("toolsitem",true);
			}
			
			// for MacOSX: hide item using js instead of css or it won't work
			if (classicthemerestorerjs.ctr.osstring=="Darwin"){
				if (branch.getBoolPref("toolsitem")) {
					setTimeout(function(){
					  try{
						document.getElementById("ctraddon_tools_menu_entry").collapsed = false;
					  } catch(e){}
					},500);
				}
				else {
				  setTimeout(function(){
					try{
					  document.getElementById("ctraddon_tools_menu_entry").collapsed = true;
					} catch(e){}
				  },500);
				}
			}
		  break;

		  case "appmenuitem":
			if (branch.getBoolPref("appmenuitem")) classicthemerestorerjs.ctr.loadUnloadCSS("appmenuitem",false);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("appmenuitem",true);
		  break;
		  
		  case "contextitem":
			if (branch.getBoolPref("contextitem")) classicthemerestorerjs.ctr.loadUnloadCSS("contextitem",false);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("contextitem",true);
		  break;
		  
		  case "puictrbutton":
			if (branch.getBoolPref("puictrbutton")) classicthemerestorerjs.ctr.loadUnloadCSS("puictrbutton",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("puictrbutton",false);
		  break;
		  
		  case "cuibuttons":
			if (branch.getBoolPref("cuibuttons")) classicthemerestorerjs.ctr.loadUnloadCSS("cuibuttons",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("cuibuttons",false);
		  break;
		  	  
		  case "restartapp":
		  
			if (branch.getBoolPref("restartapp")) classicthemerestorerjs.ctr.loadUnloadCSS("restartapp",false);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("restartapp",true);
			
			// for MacOSX: hide filemenu item using js instead of css or it won't work
			if (classicthemerestorerjs.ctr.osstring=="Darwin"){
				if (branch.getBoolPref("restartapp")) {
					setTimeout(function(){
					  try{
						document.getElementById("ctraddon_restart-menu").collapsed = false;
					  } catch(e){}
					},500);
				}
				else {
				  setTimeout(function(){
					try{
					  document.getElementById("ctraddon_restart-menu").collapsed = true;
					} catch(e){}
				  },500);
				}
			}

		  break;

		  case "searchbarwidth": case "customsearchbarwidth":
			  	try{		  
					classicthemerestorerjs.ctr.loadUnloadCSS("searchbarsheet",branch.getBoolPref("customsearchbarwidth"));
				} catch(e){}			
		  break;
		  
		  case "custbookmarkfontsize": case "cbookmarkfontsize":
			  	try{		  			
					classicthemerestorerjs.ctr.loadUnloadCSS("bookmarkbarfontsize",branch.getBoolPref("custbookmarkfontsize"));
				} catch(e){}			
		  break;
		  
		  case "custtabfontsize": case "ctabfontsize":
			  	try{		  			
					classicthemerestorerjs.ctr.loadUnloadCSS("tabfontsize",branch.getBoolPref("custtabfontsize"));
				} catch(e){}			
		  break;
		  
		  case "abouthomecustombg": case "abouthomecustomurl":
			  	try{
						setTimeout(function() {		  		
							classicthemerestorerjs.ctr.loadUnloadCSS("abouthome_bg",branch.getBoolPref("abouthomecustombg"));
						}, 90);
				} catch(e){}			
		  break;	

		   case "abouthomebgstretch":
			  	try{		  			
					classicthemerestorerjs.ctr.loadUnloadCSS("abouthomebgstretch",branch.getBoolPref("abouthomebgstretch"));
				} catch(e){}			
		  break;
		  
		  case "abouthomehighlight": case "abouthomecustomhighlightcolor":
			  	try{		  			
					classicthemerestorerjs.ctr.loadUnloadCSS("abouthome_custcolor",branch.getBoolPref("abouthomehighlight"));
				} catch(e){}			
		  break;
		  
		  case "abouthomecustombase": case "abouthomecustombasecolor": 
			  	try{		  
					classicthemerestorerjs.ctr.loadUnloadCSS("abouthome_custbasecolor",branch.getBoolPref("abouthomecustombase"));
				} catch(e){}			
		  break;
		  
		  case "aboutnewtabcustombase": case "aboutnewtabcustomhighlight": case "aboutnewtabcustombasecolor": case "aboutnewtabcustomhighlightcolor":
			  	try{		  		
					classicthemerestorerjs.ctr.loadUnloadCSS("aboutnewtab_custcolor",branch.getBoolPref("aboutnewtabcustombase") || branch.getBoolPref("aboutnewtabcustomhighlight"));
				} catch(e){}			
		  break;
		  
		  case "aboutnewtabcustombg": case "aboutnewtabcustomurl":
			  	try{
						setTimeout(function() {			  			
							classicthemerestorerjs.ctr.loadUnloadCSS("aboutnewtab_bg",branch.getBoolPref("aboutnewtabcustombg"));
						}, 90);
				} catch(e){}			
		  break;
		  
		   case "aboutnewtabbgstretch":
			  	try{		  			
					classicthemerestorerjs.ctr.loadUnloadCSS("aboutnewtabbgstretch",branch.getBoolPref("aboutnewtabbgstretch"));
				} catch(e){}			
		  break;
		  
		  case "colapsesearchaddons":
			  	try{		  
					if (branch.getBoolPref("colapsesearchaddons")) {				
							classicthemerestorerjs.ctr.loadUnloadCSS("colapsesearchaddons",true);
					}else{
						classicthemerestorerjs.ctr.loadUnloadCSS("colapsesearchaddons",false);
					}	
				} catch(e){}			
		  break;

		   case "hidexulelements": case "hidexulfilter":
			  	try{		  
					classicthemerestorerjs.ctr.loadUnloadCSS("hideElements",branch.getBoolPref("hidexulelements"));	
				} catch(e){}			
		  break;

		  case "tabthrobberusecust": case "tabthrobbercusturl":
			  	try{		  			
					classicthemerestorerjs.ctr.loadUnloadCSS("custtabthorbber",branch.getBoolPref("tabthrobberusecust"));	
				} catch(e){}			
		  break;	

		  case "loadcustomcss": case "customcssurl":
				try{ 	
					classicthemerestorerjs.ctr.loadUnloadCSS("cctrcustomcsss",branch.getBoolPref("loadcustomcss"));
			  	} catch(e){}		
		  break;
		  
		  case "alwaysshowaddonversion":
				try{ 	
				classicthemerestorerjs.ctr.loadUnloadCSS("alwaysshowaddonversion",branch.getBoolPref("alwaysshowaddonversion") );
			  	} catch(e){}	
		  break;

			// Sync CTR preferences
			case "syncprefs":
				if (branch.getBoolPref("syncprefs")){
				var preflist = Services.prefs.getChildList("extensions.classicthemerestorer.");
					// Blacklist is handled in blacklist.js, blacklist.js must be loaded first before overlay.js and options.js
					try {
						for (var i=0; i < preflist.length; i++) {
							var index = preflist.indexOf(ctrblacklist[i]);
							if (index > -1) {
								preflist.splice(index, 1);
							}
							Services.prefs.getBranch("services.sync.prefs.sync.").setBoolPref(preflist[i],'true');
						}
					} catch(e) {}
				} else if (!branch.getBoolPref("syncprefs")){
					try {
						Services.prefs.getBranch("services.sync.prefs.sync.extensions.classicthemerestorer.").deleteBranch("");
					} catch(e) {}
				}
		  break;
		}
	  }
	);

	ctrSettingsListener.register(true);

	var ctrSettingsListener_forCTB = new PrefListener(
	  "extensions.cstbb-extension.",
	  function(branch, name) {
		switch (name) {

		  case "navbarbuttons":
			if (branch.getCharPref("navbarbuttons")!="nabbuttons_off") {
			  Services.prefs.getBranch("extensions.classicthemerestorer.").setBoolPref('smallnavbut',false);
			}
			classicthemerestorerjs.ctr.checkAppbuttonOnNavbar();
			
			if(Services.prefs.getBranch("extensions.classicthemerestorer.").getCharPref("nav_txt_ico")=="iconsbig"){
			  if (branch.getCharPref("navbarbuttons")!="nabbuttons_off" && branch.getCharPref("navbarbuttons")!="nabbuttons_light") {
				Services.prefs.getBranch("extensions.classicthemerestorer.").setCharPref('nav_txt_ico','icons');
			  }
			}
			
		  break;
		}
	  }
	);
	
	ctrSettingsListener_forCTB.register(true);
	
	// hide tab audio icon and its menuitems properly
	var ctrSettingsListener_forTabSettings = new PrefListener(
	  "browser.tabs.",
	  function(branch, name) {
		switch (name) {

		  case "showAudioPlayingIcon":
			if (branch.getBoolPref("showAudioPlayingIcon")) classicthemerestorerjs.ctr.loadUnloadCSS("hidetabaudioico",false);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("hidetabaudioico",true);

		  break;
		}
	  }
	);
	
	ctrSettingsListener_forTabSettings.register(true);
	
	// adjust richlist menuitem results in suggestions popup
	var ctrSettingsListener_forUrlbarSettings = new PrefListener(
	  "browser.urlbar.",
	  function(branch, name) {
		switch (name) {

		  case "maxRichResults":
			if (classicthemerestorerjs.ctr.prefs.getBoolPref("urlresults")) classicthemerestorerjs.ctr.loadUnloadCSS("urlresults",true);
			  else classicthemerestorerjs.ctr.loadUnloadCSS("urlresults",false);

		  break;
		}
	  }
	);
	
	ctrSettingsListener_forUrlbarSettings.register(true);
	
	var ctrTreeStyleListener_forCCTR = new PrefListener(
	  "extensions.classicthemerestorer.appbutton",
	  function(appbutton) {
		if (Services.prefs.getBoolPref("extensions.classicthemerestorer.compatibility.treestyle")){return;}else{ 
		var menutoolbarHasAttribute = document.getElementById("toolbar-menubar");
			switch (appbutton) {
				case "appbutton_off":
					classicthemerestorerjs.ctr.loadUnloadCSS("tree_style_fix",false);
					if (menutoolbarHasAttribute.getAttribute('autohide', true)){
						if (!treeStyleCompatMode)
							Services.prefs.setBoolPref("browser.tabs.drawInTitlebar", false);
					}
					Services.prefs.setBoolPref("extensions.classicthemerestorer.titleintitlebar", false);
					classicthemerestorerjs.ctr.loadUnloadCSS("tabs_titlebar",false);	
				break;
			
				case "appbutton_v1": 
					menutoolbarHasAttribute.setAttribute('autohide', false);		
					classicthemerestorerjs.ctr.loadUnloadCSS("tree_style_fix",true);
					Services.prefs.setBoolPref("extensions.classicthemerestorer.titleintitlebar", false);
					classicthemerestorerjs.ctr.loadUnloadCSS("tabs_titlebar",false);			
				break;

				case "appbutton_v1wt": 
					menutoolbarHasAttribute.setAttribute('autohide', false);		
					classicthemerestorerjs.ctr.loadUnloadCSS("tree_style_fix",true);
					Services.prefs.setBoolPref("extensions.classicthemerestorer.titleintitlebar", false);
					classicthemerestorerjs.ctr.loadUnloadCSS("tabs_titlebar",false);			
				break;

				case "appbutton_v2wt2":  
					Services.prefs.setBoolPref("extensions.classicthemerestorer.titleintitlebar", false);
					classicthemerestorerjs.ctr.loadUnloadCSS("tabs_titlebar",false);	
				break;
			
				case "appbutton_v2": 
					menutoolbarHasAttribute.setAttribute('autohide', false);		
					classicthemerestorerjs.ctr.loadUnloadCSS("tree_style_fix",true);
				break;
				
				case "appbutton_v2io": 
					menutoolbarHasAttribute.setAttribute('autohide', false);		
					classicthemerestorerjs.ctr.loadUnloadCSS("tree_style_fix",true);
					Services.prefs.setBoolPref("extensions.classicthemerestorer.titleintitlebar", false);
					classicthemerestorerjs.ctr.loadUnloadCSS("tabs_titlebar",false);			
				break;

				case "appbutton_v2io2": 
					Services.prefs.setBoolPref("extensions.classicthemerestorer.titleintitlebar", false);
					classicthemerestorerjs.ctr.loadUnloadCSS("tabs_titlebar",false);	
				break;
				
				case "appbutton_pm": 
					Services.prefs.setBoolPref("extensions.classicthemerestorer.titleintitlebar", false);
					classicthemerestorerjs.ctr.loadUnloadCSS("tabs_titlebar",false);	
				break;
			}
		}
	  }
	);
	
	ctrTreeStyleListener_forCCTR.register(true);
	
	var ctrContextClassicNoIconListener_forCCTR = new PrefListener(
	  "extensions.classicthemerestorer.",
	  function(branch, name) {
		switch (name) {
		  case "noconicons":
			if (Services.prefs.getBoolPref("browser.context.classic")){
				branch.setBoolPref("noconicons", false);
			}		  
		  break;		  
		}
	  }
	);

	var ctrContextClassicListener_forCCTR = new PrefListener(
	  "browser.context.",
	  function(branch, name) {
		switch (name) {
		  case "classic":
			if (Services.prefs.getBoolPref("browser.context.classic")){
				branch.setBoolPref("noconicons", false);
			}		  
		  break;		  
		}
	  }
	);
	ctrContextClassicNoIconListener_forCCTR.register(true);
	ctrContextClassicListener_forCCTR.register(true);


	// MacOSX requires extra checks to not load CTRs tab styles for (complete) themes by accident
	if (classicthemerestorerjs.ctr.osstring=="Darwin") {
		if(this.fxdefaulttheme==false) {
			Services.prefs.getBranch("extensions.classicthemerestorer.").setCharPref('tabs','tabs_default');
		} else if(this.fxdefaulttheme==true){
			var devthemeosx=false;
			try {
			  if(Services.prefs.getBranch("browser.devedition.theme.").getBoolPref('enabled')!=false){
			    devthemeosx=true;
			  }
			} catch(e) {}
			
			if(classicthemerestorerjs.ctr.fxdevelopertheme==true) devthemeosx=true;
		  
			if(devthemeosx==true)			
			  Services.prefs.getBranch("extensions.classicthemerestorer.").setCharPref('tabs','tabs_default');
		}
	}
	
	// Remove current windows preference listeners once the window gets closed
	// to prevent memory leaks and other issues in a multi window environment.
	window.addEventListener("unload", function unregisterCTRListeners(event){
	
		ctrSettingsListener.unregister();
		ctrSettingsListener_forCTB.unregister();
		ctrSettingsListener_forTabSettings.unregister();
		ctrContextClassicNoIconListener_forCCTR.unregister();
		ctrContextClassicListener_forCCTR.unregister();
		ctrSettingsListener_forUrlbarSettings.unregister();
		//ctrSettingsListener_forDevtheme2.unregister();
		
		window.removeEventListener("unload", unregisterCTRListeners, false);
		
	},false);

  },

  // 'getElementById' would return wrongly 'null' for items in customizing palette
  ctrGetId: function(id) {
	return document.getElementById(id) || window.gNavToolbox.palette.querySelector("#" + id);
  },
   
  // show backForwardMenu popup for CTRs movable back/forward buttons 'mouse hold event'
  ctrBackMenuShow: function(anchorElem,event) {
  
   if(this.prefs.getBoolPref("hide_bf_popup")==false) {
	var timeoutID;
	
	// mouse pointers current Y position
	var positionY = event.clientY;
	
	timeoutID = window.setTimeout(function(){
	  document.getElementById("backForwardMenu").openPopupAtScreen(anchorElem.boxObject.screenX, anchorElem.boxObject.screenY+anchorElem.boxObject.height-1, false);
	  anchorElem.onmouseleave = function(event) {}
	}, 600);
		
	anchorElem.onmouseleave = function(event) {
	  window.clearTimeout(timeoutID);
	  
	  // if mouse pointer position changes vertically, display popup menu without timeout
	  if(event.clientY > positionY+5) {
		document.getElementById("backForwardMenu").openPopupAtScreen(anchorElem.boxObject.screenX, anchorElem.boxObject.screenY+anchorElem.boxObject.height-1, false);
	  }
	  anchorElem.onmouseleave = function(event) {}
	}
	anchorElem.onmouseup = function() {
	  window.clearTimeout(timeoutID);
	  anchorElem.onmouseleave = function(event) {}
	}

   }
  },
  
  // Appbutton in titlebar
  createTitlebarButton: function() {
  
	// this button can only be placed on Firefox titlebar using Windows OS
	if(classicthemerestorerjs.ctr.osstring == "WINNT"){
	
		var buttontitle = Services.appinfo.name; // init with default title
		var custombuttontitle = Services.prefs.getBranch("extensions.classicthemerestorer.").getCharPref('appbuttontxt');
		
		var converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
		converter.charset = 'UTF-8';
		
		if(custombuttontitle!='') buttontitle = converter.ConvertToUnicode(custombuttontitle);
		else {
			try{
			  // make sure appbutton gets correct title
			  buttontitle = document.getElementById("main-window").getAttribute("title_normal");
			  if(buttontitle=="Mozilla Firefox") buttontitle="Firefox";
			  else if(buttontitle=="Firefox Developer Edition") buttontitle="DevFox";
			
			} catch(e){}
		}
  
		// create button
		var ctr_titlebarbutton = document.createElement("toolbarbutton");

		// set button attributes
		ctr_titlebarbutton.setAttribute("id", "ctraddon_appbutton2");
		ctr_titlebarbutton.setAttribute("ordinal", "0");
		ctr_titlebarbutton.setAttribute("removable", "false");
		ctr_titlebarbutton.setAttribute("type", "menu");
		ctr_titlebarbutton.setAttribute("label", buttontitle);
		ctr_titlebarbutton.setAttribute("popup", "appmenu-popup");
		
		// handle 'double click to close current window' option
		ctr_titlebarbutton.addEventListener("dblclick",  function appbuttonCloseCurrentWindow() {

		  if(Services.prefs.getBranch("extensions.classicthemerestorer.").getBoolPref("dblclclosefx"))
			BrowserTryToCloseWindow();

		}, false);
		
		// handle mousedown event + popupshown/popuphidden events
		ctr_titlebarbutton.addEventListener("mousedown", function openCtrTitleAppmenuPopup() {

			var app_popup = classicthemerestorerjs.ctr.ctrGetId('appmenu-popup');
			
			//add attribute 'open'
			app_popup.addEventListener("popupshown", function onCtrTitleAppmenuPopupShown(event){
			  if (event.target == classicthemerestorerjs.ctr.ctrGetId("appmenu-popup")) {
			    classicthemerestorerjs.ctr.ctrGetId('ctraddon_appbutton2').setAttribute("open", "true");
				setTimeout(function(){
				  try {
					document.getElementById("appmenu_webDeveloper").appendChild(document.getElementById("menuWebDeveloperPopup"));
				  } catch(e){}
				},600);
			  }
			}, false);
			
			// remove attribute 'open'
			app_popup.addEventListener("popuphidden", function onCtrTitleAppmenuPopupHidden(event){
			  if (event.target == classicthemerestorerjs.ctr.ctrGetId("appmenu-popup")) {
			    classicthemerestorerjs.ctr.ctrGetId('ctraddon_appbutton2').removeAttribute("open");
				setTimeout(function(){
				  try {
					document.getElementById("webDeveloperMenu").appendChild(document.getElementById("menuWebDeveloperPopup"));
				  } catch(e){}
				},600);
			  }
			}, false);

		}, false);
		
		// add button to titlebar
		document.getElementById("titlebar-content").appendChild(ctr_titlebarbutton);
		
	}

  },
  
  // prevent location bar moving to palette or panel menu
  preventLocationbarRemoval: function() {
	
	try {
	  document.querySelector('#urlbar-container').setAttribute('removable','true');
	} catch(e){}

	try {
	  if(!document.querySelector('#urlbar-container').getAttribute('cui-areatype'))
		document.querySelector('#urlbar-container').setAttribute('cui-areatype','toolbar');
	} catch(e){}
	
  	var observer = new MutationObserver(function(mutations) {
	  mutations.forEach(function(mutation) {
		try {
			if(/*document.querySelector('#urlbar-container')==null
				&& document.querySelector('#main-window').getAttribute('chromehidden')=="menubar toolbar directories extrachrome "
					||*/ !document.querySelector('#urlbar-container').getAttribute('cui-areatype')) {
			  CustomizableUI.addWidgetToArea("urlbar-container", CustomizableUI.AREA_NAVBAR);
			}
			else if (document.querySelector('#urlbar-container').getAttribute('cui-areatype')=="menu-panel") {
			  CustomizableUI.addWidgetToArea("urlbar-container", CustomizableUI.AREA_NAVBAR);
			}
		} catch(e){}
	  });    
	});
	
	observer.observe(document.querySelector('#urlbar-container'), { attributes: true, attributeFilter: ['cui-areatype'] });
	
  },
  
  // prevent location bar hiding by ac-popup
  preventLocationbarHidingByACPopup: function() {
  
   if (classicthemerestorerjs.ctr.prefs.getBoolPref("altautocompl")==false && classicthemerestorerjs.ctr.appversion >= 48) {
	
	document.getElementById('PopupAutoCompleteRichResult').addEventListener("popupshown", function onACPopupshown(){
		
	  if(document.querySelector('#urlbar-container').parentNode.id != "nav-bar-customization-target" &&
		document.querySelector('#urlbar-container').parentNode.parentNode.id == "navigator-toolbox"){
		  
		var urlbarpos = document.getElementById("urlbar").boxObject.screenY + document.getElementById("urlbar").boxObject.height;
		var navbarpos = document.getElementById("nav-bar").boxObject.screenY + document.getElementById("nav-bar").boxObject.height;
		
		var newpos = urlbarpos - navbarpos;
		
		if(newpos>=0)
		  document.getElementById('PopupAutoCompleteRichResult').style.marginTop = ""+newpos+"px";  
	  }
	
	}, false);
		
	document.getElementById('PopupAutoCompleteRichResult').addEventListener("popuphidden", function onACPopuphidden(){
		document.getElementById('PopupAutoCompleteRichResult').style.marginTop = "0px";
	}, false);
	
   }
  },

  // create 0-20 additional toolbars on startup
  // easier and more accurate compared to adding toolbars manually to overlay.xul
  createAdditionalToolbars: function() {

	// get amount of toolbars user wants to use
	var extrabars_num=Services.prefs.getBranch("extensions.classicthemerestorer.").getIntPref('am_extrabars');
	
	// reset unsupported values
	if(extrabars_num<0) {extrabars_num=0; Services.prefs.getBranch("extensions.classicthemerestorer.").setIntPref('am_extrabars',extrabars_num);}
	if(extrabars_num>20) {extrabars_num=20; Services.prefs.getBranch("extensions.classicthemerestorer.").setIntPref('am_extrabars',extrabars_num);}
	
	// only try to add additional toolbar(s), if user enables at least one toolbar
	if(extrabars_num>0) {
	
	  var i=1;

	  while(i<=extrabars_num) {
		var ctr_tb = document.createElement("toolbar");
		
		if(i==1) {
		  ctr_tb.setAttribute("id", "ctraddon_extra-bar");
		  ctr_tb.setAttribute("toolbarname", ""+classicthemerestorerjs.ctr.stringBundle.GetStringFromName("ctr_extrabar")+"");
		  ctr_tb.setAttribute("collapsed", "true");
		}
		else {
		  ctr_tb.setAttribute("id", "ctraddon_extra-bar"+i+"");
		  ctr_tb.setAttribute("toolbarname", ""+classicthemerestorerjs.ctr.stringBundle.GetStringFromName("ctr_extrabar")+" ("+i+")");
		}
		ctr_tb.setAttribute("class", "toolbar-primary chromeclass-toolbar");
		ctr_tb.setAttribute("customizable", "true");
		ctr_tb.setAttribute("mode", "icons");
		ctr_tb.setAttribute("iconsize", "small");
		ctr_tb.setAttribute("insertafter", "nav-bar");
		ctr_tb.setAttribute("insertbefore", "PersonalToolbar");
		ctr_tb.setAttribute("context", "toolbar-context-menu");
		ctr_tb.setAttribute("lockiconsize", "true");
		ctr_tb.setAttribute("defaultset", "spring");
		
		document.getElementById("navigator-toolbox").insertBefore(ctr_tb, document.getElementById("PersonalToolbar"));
		i++;
	  }
	}
  
  },
  
  addonCompatibilityImprovements: function() {
	  
	// 'ThePuzzlePiece'/'PuzzleToolbars' add-on: check to not enable CTRs space/separator styles while add-on is enabled
	var TPPListener = {
	   onEnabled: function(addon) {
		  if(addon.id == 'thePuzzlePiece@quicksaver') { classicthemerestorerjs.ctr.loadUnloadCSS("spaces_extra",false); }
	   },
	   onDisabled: function(addon) {
		  if(addon.id == 'thePuzzlePiece@quicksaver') { classicthemerestorerjs.ctr.loadUnloadCSS("spaces_extra",true); }
	   }
	};
	AddonManager.addAddonListener(TPPListener);
	
	AddonManager.getAddonByID('thePuzzlePiece@quicksaver', function(addon) {
	   if(addon && addon.isActive) { classicthemerestorerjs.ctr.loadUnloadCSS("spaces_extra",false); }
	    else { classicthemerestorerjs.ctr.loadUnloadCSS("spaces_extra",true); }
	});
	
	// NoiaButtons
	var NBListener = {
	   onEnabled: function(addon) {
		  if(addon.id == 'NoiaButtons@ArisT2_Noia4dev') {
		  
		    if(Services.prefs.getBranch("extensions.classicthemerestorer.").getBoolPref("smallnavbut"))
			  Services.prefs.getBranch("extensions.classicthemerestorer.").setBoolPref("smallnavbut",false);

		  }
	   }
	};
	AddonManager.addAddonListener(NBListener);
	
	AddonManager.getAddonByID('NoiaButtons@ArisT2_Noia4dev', function(addon) {
	  if(addon && addon.isActive) {
		if(Services.prefs.getBranch("extensions.classicthemerestorer.").getBoolPref("smallnavbut"))
		  Services.prefs.getBranch("extensions.classicthemerestorer.").setBoolPref("smallnavbut",false);
	  }
	});

	// ShowIP add-on fix
	setTimeout(function(){
	  try{
		classicthemerestorerjs.ctr.ctrGetId("status-bar").appendChild(classicthemerestorerjs.ctr.ctrGetId("showip_status_item"));
	  } catch(e){}
	},30);
	// Gmail Manager NG
	setTimeout(function(){
	  try{
		classicthemerestorerjs.ctr.ctrGetId("status-bar").appendChild(classicthemerestorerjs.ctr.ctrGetId("gmanager-toolbar-item"));
	  } catch(e){}
	},300);
	// isAdmin add-on fix
	setTimeout(function(){
	  try{
		classicthemerestorerjs.ctr.ctrGetId("status-bar").appendChild(classicthemerestorerjs.ctr.ctrGetId("vdtisadmin_panel"));
	  } catch(e){}
	},50);
	setTimeout(function(){
	  try{
		classicthemerestorerjs.ctr.ctrGetId("ctraddon_addon-bar").appendChild(classicthemerestorerjs.ctr.ctrGetId("vdtisadmin_button"));
	  } catch(e){}
	},50);
	//Aniweather add-on fix
	setTimeout(function(){
	  try{
		classicthemerestorerjs.ctr.ctrGetId("status-bar").appendChild(classicthemerestorerjs.ctr.ctrGetId("aniweather_canvas"));
	  } catch(e){}
	},300);
	//Cache Status add-on fix
	setTimeout(function(){
	  try{
		if(Services.prefs.getBranch("extensions.classicthemerestorer.").getBoolPref('cstatextlb')==false)
		  classicthemerestorerjs.ctr.ctrGetId("status-bar").appendChild(classicthemerestorerjs.ctr.ctrGetId("cachestatus-panel"));
	  } catch(e){}
	},300);
	
	//ColorfulTabs
	setTimeout(function(){
	  AddonManager.getAddonByID('{0545b830-f0aa-4d7e-8820-50a4629a56fe}', function(addon) {
	   if(addon && addon.isActive) {
	     
	     try{
		   document.getElementById("main-window").setAttribute('colorfultabs',true);
		 } catch(e){}
		 
	   }
	  });
	},300);
	
	// Searchbar autoresizer add-on
	setTimeout(function(){
	  AddonManager.getAddonByID('{655397ca-4766-496b-b7a8-3a5b176ee4c2}', function(addon) {
	   if(addon && addon.isActive) {
	     
	      Services.prefs.getBranch("extensions.classicthemerestorer.").setBoolPref('osearch_iwidth',false);
		 
	   }
	  });
	},300);

	// Developer Edition
	setTimeout(function(){
	  try{
		if(document.getElementById("main-window").getAttribute("title_normal")=="Firefox Developer Edition")
		  classicthemerestorerjs.ctr.ctrGetId('ctraddon_appbutton').setAttribute("label","DevFox");
	  } catch(e){}
	},300);
	
	//OSX bookmarks item fix
	if (classicthemerestorerjs.ctr.osstring=="Darwin"){
	  setTimeout(function(){
		try{
		  document.getElementById("ctraddon_BMB_unsortedBookmarks_mm").collapsed = true;
		  document.getElementById("ctraddon_BMB_unsortedBookmarks_mm2").collapsed = true;
		  document.getElementById("ctraddon_BMB_unsortedBookmarks_mm2sep").collapsed = true;
		} catch(e){}
	  },1000);
	}

  },
  
  openAThrobberUrl: function() {
	var newathrobberurl = Services.prefs.getBranch("extensions.classicthemerestorer.").getCharPref("athrobberurl");
	if(newathrobberurl!="") gBrowser.selectedTab = gBrowser.addTab(newathrobberurl);
  },
  
  // attach appmenu to appbutton on toolbar
  openCtrAppmenuPopup: function() {

	var app_popup = classicthemerestorerjs.ctr.ctrGetId('appmenu-popup');
	  
	app_popup.addEventListener("popupshown", function onCtrAppmenuPopupShown(event) {
	  if (event.target == classicthemerestorerjs.ctr.ctrGetId("appmenu-popup"))
	    classicthemerestorerjs.ctr.ctrGetId('ctraddon_appbutton').setAttribute("open", "true");
	}, false);

	app_popup.addEventListener("popuphidden", function onCtrAppmenuPopupHidden(event) {
	  if (event.target == classicthemerestorerjs.ctr.ctrGetId("appmenu-popup"))
	    classicthemerestorerjs.ctr.ctrGetId('ctraddon_appbutton').removeAttribute("open");
	}, false);
  
	classicthemerestorerjs.ctr.checkAppbuttonOnNavbar();
  },
  
  checkAppbuttonOnNavbar: function() {
	
	var appbutton = false;
	try {
	  if (Services.prefs.getBranch("extensions.classicthemerestorer.").getCharPref("appbutton")=="appbutton_v1"
		  || Services.prefs.getBranch("extensions.classicthemerestorer.").getCharPref("appbutton")=="appbutton_v1wt")
	   appbutton = true
	} catch(e){}
	
	var cstbb = false;
	try {
	  if(Services.prefs.getBranch("extensions.cstbb-extension.").getCharPref("navbarbuttons")!="nabbuttons_off")
	   cstbb = true;
	} catch(e){}


	/* make sure popup position gets adjusted, if appbutton is on nav-bar in normal button mode */
	if (Services.prefs.getBranch("extensions.classicthemerestorer.").getBoolPref("smallnavbut")==false && cstbb==false
		&& classicthemerestorerjs.ctr.fxdefaulttheme==true && appbutton==true) {
			setTimeout(function(){
			  try{
			    if(classicthemerestorerjs.ctr.ctrGetId('ctraddon_appbutton').parentNode.parentNode.id=="nav-bar")
				  classicthemerestorerjs.ctr.loadUnloadCSS("appbutton_on_nav",true);
			  } catch(e){}
			},300);
	}
	else classicthemerestorerjs.ctr.loadUnloadCSS("appbutton_on_nav",false);
  },
  
  // hide tabs toolbar, if only one tab is visible
  hideTabsToolbarWithOneTab: function(){

	var observer = new MutationObserver(function(mutations) {
	  mutations.forEach(function(mutation) {
		ctrHideTabbar();
	  });    
	});
	
	var observer_mw = new MutationObserver(function(mutations) {
	  mutations.forEach(function(mutation) {
		ctrHideTabbar();
	  });    
	});
	
	var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("navigator:browser");

	mainWindow.addEventListener("TabClose", ctrHideTabbar, false);  
	mainWindow.addEventListener("TabOpen", ctrHideTabbar, false);
	mainWindow.addEventListener("load", ctrHideTabbar, false);
	mainWindow.addEventListener("DOMContentLoaded", ctrHideTabbar, false);
	observer.observe(mainWindow.document.querySelector('#toolbar-menubar'), { attributes: true, attributeFilter: ['inactive','autohide'] });
	observer_mw.observe(mainWindow.document.querySelector('#main-window'), { attributes: true, attributeFilter: ['sizemode','tabsintitlebar'] });

	function ctrHideTabbar(event){

	  var recentWindow = mainWindow;
	  var tabsintitlebar = Services.prefs.getBranch("browser.tabs.").getBoolPref("drawInTitlebar");
	  var tabsontop = classicthemerestorerjs.ctr.prefs.getCharPref("tabsontop");
		
	  if(recentWindow.gBrowser.tabContainer.tabbrowser.visibleTabs.length < 2) {
		if(classicthemerestorerjs.ctr.appversion >= 47) {
		  recentWindow.document.getElementById("TabsToolbar").style.visibility = 'collapse';
		} else {
		  if(Services.prefs.getBranch("extensions.classicthemerestorer.").getBoolPref("hidetbwote")) {
			recentWindow.document.getElementById("TabsToolbar").style.visibility = 'collapse';
		  } else {
			recentWindow.document.getElementById("TabsToolbar").collapsed = true;
		  }
		}
		
		if(Services.prefs.getBranch("extensions.classicthemerestorer.").getBoolPref("hidetbwote2")) {
		  
		  if(classicthemerestorerjs.ctr.osstring=="WINNT" && tabsintitlebar==true){ // Windows
			if (recentWindow.document.getElementById("toolbar-menubar").getAttribute("autohide") == "true"
				&& recentWindow.document.getElementById("toolbar-menubar").getAttribute("inactive") == "true") {
			  recentWindow.document.getElementById("toolbar-menubar").style.marginBottom="26px";
			} else document.getElementById("toolbar-menubar").style.marginBottom="unset";
		  } else if (classicthemerestorerjs.ctr.osstring=="WINNT" && tabsintitlebar==false) {
			  document.getElementById("toolbar-menubar").style.marginBottom="unset";
		  } else if(classicthemerestorerjs.ctr.osstring=="Darwin" && tabsintitlebar==true) { // MacOSX
			if(classicthemerestorerjs.ctr.appversion >= 47) {
			  recentWindow.document.getElementById("TabsToolbar").style.marginTop="unset";
			  if(tabsontop == 'false' || tabsontop == 'false2')
			    recentWindow.document.getElementById("titlebar").style.marginBottom="-28px";
			  else{
				if(Services.prefs.getBranch("extensions.classicthemerestorer.").getBoolPref("hightabpososx")) {
				  recentWindow.document.getElementById("titlebar").style.marginBottom="-10px";
				} else {
				  recentWindow.document.getElementById("titlebar").style.marginBottom="0px";
				}
			  }
			} else {
			  recentWindow.document.getElementById("titlebar").style.paddingBottom="28px";
			}
		  } else {} //Linux does not need special treatment
		  
		} else if(classicthemerestorerjs.ctr.osstring=="WINNT" && tabsintitlebar==true){
			if(classicthemerestorerjs.ctr.appversion >= 47)
		      recentWindow.document.getElementById("titlebar").style.marginBottom="-23px";
		} else if(classicthemerestorerjs.ctr.osstring=="Darwin" && tabsintitlebar==true){
			if(classicthemerestorerjs.ctr.appversion >= 47)
		      recentWindow.document.getElementById("titlebar").style.marginBottom="-28px";
		}
	  } else {

		if(classicthemerestorerjs.ctr.appversion >= 47) {
		  recentWindow.document.getElementById("TabsToolbar").style.visibility = 'visible';
		} else {
		  if(Services.prefs.getBranch("extensions.classicthemerestorer.").getBoolPref("hidetbwote")) {
			recentWindow.document.getElementById("TabsToolbar").style.visibility = 'visible';
		  } else {
			recentWindow.document.getElementById("TabsToolbar").collapsed = false;
		  }
		}
		
		if(Services.prefs.getBranch("extensions.classicthemerestorer.").getBoolPref("hidetbwote2")) {
		  if(classicthemerestorerjs.ctr.osstring=="WINNT") 
			recentWindow.document.getElementById("toolbar-menubar").style.marginBottom="unset";		
		  else if(classicthemerestorerjs.ctr.osstring=="Darwin" && tabsintitlebar==true) {
			if(classicthemerestorerjs.ctr.appversion >= 47) {
			  if(Services.prefs.getBranch("extensions.classicthemerestorer.").getBoolPref("hightabpososx")) {
			    recentWindow.document.getElementById("TabsToolbar").style.marginTop="-10px";
			  } else {
				recentWindow.document.getElementById("TabsToolbar").style.marginTop="0px";
			  }

			  recentWindow.document.getElementById("titlebar").style.marginBottom="-28px";
			} else {
			  recentWindow.document.getElementById("titlebar").style.paddingBottom="unset";
			}
		  } else {} //Linux does not need special treatment
		} else if(classicthemerestorerjs.ctr.osstring=="WINNT" && tabsintitlebar==true){
			if(classicthemerestorerjs.ctr.appversion >= 47)
		      recentWindow.document.getElementById("titlebar").style.marginBottom="-23px";
		} else if(classicthemerestorerjs.ctr.osstring=="Darwin" && tabsintitlebar==true){
			if(classicthemerestorerjs.ctr.appversion >= 47)
		      recentWindow.document.getElementById("titlebar").style.marginBottom="-28px";
		}
	  }

	}

  },

  // replace default icons with tab-favicons
  favIconinUrlbarCTR: function() {

	// Some add-ons like 'Profile Switcher' interfere with gBrowser usage on second window.
	// As result event listener fails to listen for "TabAttrModified" event.
	// Waiting until dom content is loaded fixes this problem.
	window.addEventListener("DOMContentLoaded", function _favIconinUrlbarCTR(){
	  var mainWindow = window.QueryInterface(Ci.nsIInterfaceRequestor)
                       .getInterface(Ci.nsIWebNavigation)
                       .QueryInterface(Ci.nsIDocShellTreeItem)
                       .rootTreeItem
                       .QueryInterface(Ci.nsIInterfaceRequestor)
                       .getInterface(Ci.nsIDOMWindow);
					   
	  mainWindow.gBrowser.tabContainer.addEventListener("TabAttrModified", faviconInUrlbar, false);
	}, false);
	
	// Using additional 'setInterval' prevents some sites with empty or slow
	// loading tab icons from cheating a blank space into urlbars favicon area.
	setInterval(function() { faviconInUrlbar();	}, 1000);
	
	function faviconInUrlbar(){
	 
	 var ppfavicon = "";
	 
	  try {
		ppfavicon = document.getElementById("identity-icon");
	  } catch(e){}

	 
	 var emptyfavicon = Services.prefs.getBranch("extensions.classicthemerestorer.").getCharPref("emptyfavico_t");
	 var extrabrandico = Services.prefs.getBranch("extensions.classicthemerestorer.").getBoolPref("padlockex");
	 var ppsvalid	   = false; try { ppsvalid  = document.getElementById("urlbar").getAttribute('pageproxystate')=='valid'; } catch(e){}
	 var ppsinvalid	   = false; try { ppsinvalid = document.getElementById("urlbar").getAttribute('pageproxystate')=='invalid'; } catch(e){}
	 var ibchromeui	   = false; try { ibchromeui = document.getElementById("identity-box").getAttribute('class')=='chromeUI'; } catch(e){}
	 var ibukidentity  = false; try { ibukidentity = document.getElementById("identity-box").getAttribute('class')=='unknownIdentity'; } catch(e){}
	 
	 try{
	 
	 if(gBrowser.selectedTab.image) {
	  try {
		ppfavicon.setAttribute("src", gBrowser.selectedTab.image);
	  } catch(e){}
	 }
	 else if(emptyfavicon=='emptyfavico_t_dot' && extrabrandico && ppsvalid && ibchromeui){
	  try {
		ppfavicon.removeAttribute("src");
	  } catch(e){}
	 }
	 else if(emptyfavicon=='emptyfavico_t_dot2' && extrabrandico && ppsvalid && ibchromeui){
	  try {
		ppfavicon.removeAttribute("src");
	  } catch(e){}
	 }
	 else if(emptyfavicon=='emptyfavico_t_gen2' && extrabrandico && ppsvalid && ibchromeui){
	  try {
		ppfavicon.removeAttribute("src");
	  } catch(e){}
	 }
	 else if(emptyfavicon=='emptyfavico_t_sheet' && extrabrandico && ppsvalid && ibchromeui){
	  try {
		ppfavicon.removeAttribute("src");
	  } catch(e){}
	 }
	 else if(emptyfavicon=='emptyfavico_t_dot' && ppsinvalid && ibukidentity) {
	  try {
		ppfavicon.setAttribute("src", "chrome://classic_theme_restorer/content/images/default_dot_favicon.png");
	  } catch(e){}
	 }
	 else if(emptyfavicon=='emptyfavico_t_dot2' && ppsinvalid && ibukidentity) {
	  try {
		ppfavicon.setAttribute("src", "chrome://classic_theme_restorer/content/images/default_dot_favicon_white.png");
	  } catch(e){}
	 }
	 else if(emptyfavicon=='emptyfavico_t_gen2' && ppsinvalid && ibukidentity) {
	  try {
		ppfavicon.setAttribute("src", "chrome://classic_theme_restorer/content/images/globe_white.png");
	  } catch(e){}
	 }
	 else if(emptyfavicon=='emptyfavico_t_sheet' && ppsinvalid && ibukidentity) {
	  try {
		ppfavicon.setAttribute("src", "chrome://classic_theme_restorer/content/images/default_favicon.png");
	  } catch(e){}
	 }
	 else if(emptyfavicon=='emptyfavico_t_dot') {
	  try {
		ppfavicon.setAttribute("src", "chrome://classic_theme_restorer/content/images/default_dot_favicon.png");
	  } catch(e){}
	 }
	 else if(emptyfavicon=='emptyfavico_t_dot2') {
	  try {
		ppfavicon.setAttribute("src", "chrome://classic_theme_restorer/content/images/default_dot_favicon_white.png");
	  } catch(e){}
	 }
	 else if(emptyfavicon=='emptyfavico_t_gen2') {
	  try {
		ppfavicon.setAttribute("src", "chrome://classic_theme_restorer/content/images/globe_white.png");
	  } catch(e){}
	 }
	 else if(emptyfavicon=='emptyfavico_t_sheet') {
	  try {
		ppfavicon.setAttribute("src", "chrome://classic_theme_restorer/content/images/default_favicon.png");
	  } catch(e){}
	 }
	 else if(emptyfavicon=='emptyfavico_t_gen' || emptyfavicon=='emptyfavico_t_none') {
	  try {
		ppfavicon.removeAttribute("src");
	  } catch(e){}
	 }
	
	} catch(e){}
	
	}

	classicthemerestorerjs.ctr.loadUnloadCSS('ibinfoico2',false);
	
	classicthemerestorerjs.ctr.loadUnloadCSS('padlock_default',false);
	classicthemerestorerjs.ctr.loadUnloadCSS('padlock_classic',false);
	classicthemerestorerjs.ctr.loadUnloadCSS('padlock_amo',false);
	classicthemerestorerjs.ctr.loadUnloadCSS('padlock_modern',false);
	classicthemerestorerjs.ctr.loadUnloadCSS('padlock_modern2',false);
	classicthemerestorerjs.ctr.loadUnloadCSS('padlock_none',false);
	classicthemerestorerjs.ctr.loadUnloadCSS('padlock2_none',false);
	classicthemerestorerjs.ctr.loadUnloadCSS('padlock2_classic',false);
	classicthemerestorerjs.ctr.loadUnloadCSS('padlock2_modern',false);
	
	if (classicthemerestorerjs.ctr.prefs.getCharPref("padlock")=="padlock_none")
		classicthemerestorerjs.ctr.loadUnloadCSS("padlock_none",true);
	else classicthemerestorerjs.ctr.loadUnloadCSS("padlock_none",false);
	
	if (Services.prefs.getBranch("extensions.classicthemerestorer.").getCharPref("padlock")!="padlock_none"){
	  classicthemerestorerjs.ctr.loadUnloadCSS(Services.prefs.getBranch("extensions.classicthemerestorer.").getCharPref("padlock"),true);
	}
	
	if (Services.prefs.getBranch("extensions.classicthemerestorer.").getBoolPref("padlockex")){
	  classicthemerestorerjs.ctr.loadUnloadCSS("padlock_extra",true);
	}
	else {
	  classicthemerestorerjs.ctr.loadUnloadCSS("padlock_extra",false);
	}
  
  },
  
  setCTRModeAttributes: function(which) {
  
	// only set attributes, if needed
	if(which=="icons" && document.getElementById("nav-bar").getAttribute('mode')=="icons") {}
	else {
		// needs a delay or Firefox will override values on restart
		setTimeout(function(){
		  try {
			document.getElementById("toolbar-menubar").setAttribute('mode',which);
			document.getElementById("TabsToolbar").setAttribute('mode',which);
			document.getElementById("nav-bar").setAttribute('mode',which);
			document.getElementById("PersonalToolbar").setAttribute('mode',which);
			document.getElementById("ctraddon_extra-bar").setAttribute('mode',which);
			document.getElementById("ctraddon_addon-bar").setAttribute('mode',which);
			document.getElementById("vertical-toolbar").setAttribute('mode',which);
		  } catch(e){}
		},500);
			
		window.addEventListener("DOMContentLoaded", function setCTRnavbariconsize(event){
			window.removeEventListener("DOMContentLoaded", setCTRnavbariconsize, false);
			
			// needs a delay or Firefox will override values on restart
			setTimeout(function(){
			  try {
				document.getElementById("toolbar-menubar").setAttribute('mode',which);
				document.getElementById("TabsToolbar").setAttribute('mode',which);
				document.getElementById("nav-bar").setAttribute('mode',which);
				document.getElementById("PersonalToolbar").setAttribute('mode',which);
				document.getElementById("ctraddon_extra-bar").setAttribute('mode',which);
				document.getElementById("ctraddon_addon-bar").setAttribute('mode',which);
				document.getElementById("vertical-toolbar").setAttribute('mode',which);
			  } catch(e){}
			},500);
		},false);
	}
  },

  // disable preferences which are not usable with third party themes  
  disableSettingsforThemes: function() {
	
	if (!this.fxdefaulttheme) {
		this.prefs.setBoolPref('tabcolor_def',false);
		this.prefs.setBoolPref('tabcolor_act',false);
		this.prefs.setBoolPref('tabcolor_unr',false);
		this.prefs.setBoolPref('tabcolor_pen',false);
		this.prefs.setBoolPref('tabcolor_hov',false);
		this.prefs.setBoolPref('ntabcolor_def',false);
		this.prefs.setBoolPref('ntabcolor_hov',false);
		
		if (this.prefs.getCharPref('nav_txt_ico')=='iconsbig') {
			this.prefs.setCharPref('nav_txt_ico','icons');
		}
	}
  },
  
  // CTRs extra add-on bar keys
  CTRextraLocationBarKeyset: function() {
	setTimeout(function(){
	  try{
		if(Services.prefs.getBranch("extensions.classicthemerestorer.").getBoolPref('extraurlkeycb')) {
		  document.getElementById("focusURLBar").setAttribute("command",'CtrExtension:ToggleUrlExtraBar');
		}
	  } catch(e){}
	  try{
		if(Services.prefs.getBranch("extensions.classicthemerestorer.").getBoolPref('extraurlkeycb')) {
		  document.getElementById("focusURLBar2").setAttribute("command",'CtrExtension:ToggleUrlExtraBar');
		}
	  } catch(e){}
	},1000);
  },
  
  // skip print buttons print preview
  CTRextraSkipPrintPreview: function() {
	setTimeout(function(){
	  try{
		if(Services.prefs.getBranch("extensions.classicthemerestorer.").getBoolPref('skipprintpr')) {
		  classicthemerestorerjs.ctr.ctrGetId("print-button").setAttribute("command",'cmd_print');
		  classicthemerestorerjs.ctr.ctrGetId("print-button").removeAttribute("oncommand");
		}
	  } catch(e){}
	},1000);
  },
  
  // prevent developer theme from being enabled on Fx Nightly
  PreventDevThemeEnabling: function(){
	if(Services.prefs.getBranch("extensions.classicthemerestorer.").getBoolPref("nodevtheme2")) {

	  try {
		if (Services.prefs.getBranch("lightweightThemes.").getCharPref('selectedThemeID')=='firefox-devedition@mozilla.org'
			|| Services.prefs.getBranch("lightweightThemes.").getCharPref('selectedThemeID')=='firefox-compact-dark@mozilla.org'
			|| Services.prefs.getBranch("lightweightThemes.").getCharPref('selectedThemeID')=='firefox-compact-light@mozilla.org'
		   )
		{
		 var {LightweightThemeManager} = Cu.import("resource://gre/modules/LightweightThemeManager.jsm", {});
		  LightweightThemeManager.themeChanged(null);
		  Services.prefs.getBranch("lightweightThemes.").deleteBranch("selectedThemeID");
		}
	  } catch(e) {}
	  
	  classicthemerestorerjs.ctr.loadUnloadCSS("nodevtheme2",true);
	}
  },
  
  // add tab title to browsers titlebar
  tabTitleInBrowsersTitlebar: function(){
	if(Services.prefs.getBranch("extensions.classicthemerestorer.").getBoolPref("tttitlebar")==true){
	
	  window.addEventListener("DOMContentLoaded", function ctr_tabTitleInBrowsersTitlebar() {
		window.removeEventListener("DOMContentLoaded", ctr_tabTitleInBrowsersTitlebar, false);
		
		setTimeout(function(){

		 if(classicthemerestorerjs.ctr.osstring=="WINNT" && classicthemerestorerjs.ctr.fxdefaulttheme==true) {

		  try {
		
			var titlebarspacer1 = document.createElement("spacer");
			titlebarspacer1.setAttribute("id", "ctraddon_titlebarspacer");
			titlebarspacer1.setAttribute("ordinal", "0");
			titlebarspacer1.setAttribute("flex", "1");
			
			var titlebartitle = document.createElement("toolbarbutton");
			titlebartitle.setAttribute("id", "ctraddon_titlebartitle");
			titlebartitle.setAttribute("ordinal", "0");
			titlebartitle.setAttribute("label", gBrowser.contentTitle || Services.appinfo.name);
			
			document.getElementById("titlebar-content").appendChild(titlebarspacer1);
			document.getElementById("titlebar-content").appendChild(titlebartitle);

			window.addEventListener("load", function update_title() {
			  if (gBrowser.contentTitle=="") document.getElementById("ctraddon_titlebartitle").setAttribute("label", Services.appinfo.name);
			  else document.getElementById("ctraddon_titlebartitle").setAttribute("label", gBrowser.contentTitle);
			}, false);
			window.addEventListener("DOMContentLoaded", function update_title() {
			  if (gBrowser.contentTitle=="") document.getElementById("ctraddon_titlebartitle").setAttribute("label", Services.appinfo.name);
			  else document.getElementById("ctraddon_titlebartitle").setAttribute("label", gBrowser.contentTitle);
			}, false);
			window.addEventListener("TabOpen", function update_title() {
			  if (gBrowser.contentTitle=="") document.getElementById("ctraddon_titlebartitle").setAttribute("label", Services.appinfo.name);
			  else document.getElementById("ctraddon_titlebartitle").setAttribute("label", gBrowser.contentTitle);
			}, false);
			window.addEventListener("TabSelect", function update_title() {
			  if (gBrowser.contentTitle=="") document.getElementById("ctraddon_titlebartitle").setAttribute("label", Services.appinfo.name);
			  else document.getElementById("ctraddon_titlebartitle").setAttribute("label", gBrowser.contentTitle);
			}, false);
			window.addEventListener("TabAttrModified", function update_title() {
			  if (gBrowser.contentTitle=="") document.getElementById("ctraddon_titlebartitle").setAttribute("label", Services.appinfo.name);
			  else document.getElementById("ctraddon_titlebartitle").setAttribute("label", gBrowser.contentTitle);
			}, false);

		  } catch(e) {}
		  
		  classicthemerestorerjs.ctr.loadUnloadCSS("tttitlebar",true);

		 }
		},200);
	  }, false);
    }
  },
  
  // prevent accidental location bar removal by using context menu 
  removeContextItemsFromLocationbarContext: function(){

	var mov_urlbar_container = classicthemerestorerjs.ctr.ctrGetId("urlbar-container");
	
	window.addEventListener("mousedown", function openContextMenuPopup(event) {

	  if(event.button==2 && mov_urlbar_container.contains(event.target)) {

		var toolbarcontext_popup = classicthemerestorerjs.ctr.ctrGetId('toolbar-context-menu');

		toolbarcontext_popup.addEventListener("popupshown", function onCtrToolbarContextPopupShown(){
		  try {
			toolbarcontext_popup.firstChild.setAttribute("disabled", "true");
			toolbarcontext_popup.firstChild.nextSibling.setAttribute("disabled", "true");
			toolbarcontext_popup.removeEventListener("popupshown", onCtrToolbarContextPopupShown, false);
		  } catch(e){}

		}, false);
		
	  } else {
		var toolbarcontext_popup = classicthemerestorerjs.ctr.ctrGetId('toolbar-context-menu');

		toolbarcontext_popup.addEventListener("popupshown", function onCtrToolbarContextPopupShown2(){
		  try {
			if(toolbarcontext_popup.firstChild.getAttribute("disabled")=="true") {
			  toolbarcontext_popup.firstChild.setAttribute("disabled", "false");
			  toolbarcontext_popup.firstChild.nextSibling.setAttribute("disabled", "false");
			}
			toolbarcontext_popup.removeEventListener("popupshown", onCtrToolbarContextPopupShown2, false);
		  } catch(e){}
			
		}, false);
	  }

	}, false);

  },
  
  // move 'Tools' menus dev tools into application buttons popup 
  moveDevtoolsmenu: function(){
	
	//setTimeout(function(){
	window.addEventListener("DOMContentLoaded", function toggleNavBarSwitch(event){

		classicthemerestorerjs.ctr.ctrGetId("ctraddon_appbutton").addEventListener("mousedown", function() {

			var app_popup = classicthemerestorerjs.ctr.ctrGetId('appmenu-popup');
			
			//add attribute 'open'
			app_popup.addEventListener("popupshown", function onCtrTitleAppmenuPopupShown(event){
			  if (event.target == classicthemerestorerjs.ctr.ctrGetId("appmenu-popup")) {
				setTimeout(function(){
				  try {
					document.getElementById("appmenu_webDeveloper").appendChild(document.getElementById("menuWebDeveloperPopup"));
				  } catch(e){}
				},650);
			  }
			}, false);
			
			// remove attribute 'open'
			app_popup.addEventListener("popuphidden", function onCtrTitleAppmenuPopupHidden(event){
			  if (event.target == classicthemerestorerjs.ctr.ctrGetId("appmenu-popup")) {
				setTimeout(function(){
				  try {
					document.getElementById("webDeveloperMenu").appendChild(document.getElementById("menuWebDeveloperPopup"));
				  } catch(e){}
				},650);
			  }
			}, false);

		}, false);

	},false);
	//},1500);

  },
  
  // prevent browser from disablning CTRs reload button for no reason
  preventReloaddisabling: function(){
	window.addEventListener("DOMContentLoaded", function preventRelDis(event){
	  window.removeEventListener("DOMContentLoaded", preventRelDis, false);

	  setTimeout(function(){
		var observer = new MutationObserver(function(mutations) {
		  mutations.forEach(function(mutation) {
			try {
				if(document.querySelector('#ctraddon_reload-button').hasAttribute('disabled'))
				  document.querySelector('#ctraddon_reload-button').removeAttribute('disabled');
			} catch(e){}
		  });    
		});
		
		try {
		  observer.observe(document.querySelector('#ctraddon_reload-button'), { attributes: true, attributeFilter: ['disabled'] });
		} catch(e){}
	  },1000);
	},false);
  },
  
  // tab width stuff
  updateTabWidth: function() {
  	window.addEventListener("DOMWindowCreated", function load(event){
		classicthemerestorerjs.ctr._updateTabWidth();  
	},false);
  },
  
  _updateTabWidth: function() {
		
	var minWidthValue = Services.prefs.getBranch("extensions.classicthemerestorer.").getIntPref('ctabmwidth');
	var maxWidthValue = Services.prefs.getBranch("extensions.classicthemerestorer.").getIntPref('ctabwidth');

	//remove the rule, if already inserted at the end of document.styleSheets[1]
	try {
	  if (document.styleSheets[1].cssRules[document.styleSheets[1].cssRules.length-1].selectorText==".tabbrowser-tab:not([pinned])")
		document.styleSheets[1].deleteRule(document.styleSheets[1].cssRules.length-1);
	} catch(e){}
	
	// insert rules only, if non-default values are used
	if(minWidthValue!=100 || maxWidthValue !=210) {
	  try {
		// insert rule at the end of document.styleSheets[1], if non-default values are used
		var ruleEndPosition = document.styleSheets[1].cssRules.length;
		document.styleSheets[1].cssRules[document.styleSheets[1].insertRule('.tabbrowser-tab:not([pinned]){}', ruleEndPosition)];
		document.styleSheets[1].cssRules[ruleEndPosition].style.minWidth=""+minWidthValue+"px";
		document.styleSheets[1].cssRules[ruleEndPosition].style.maxWidth=""+maxWidthValue+"px";
	  } catch(e){}
	}

  },

  // adds busy attribute to activity throbber
  restoreActivityThrobber: function(){
	
	// disconnect observer, if it is already running
	try{
	  classicthemerestorerjs.ctr.activityObserver.disconnect();
	}catch(e){}
	
	// check, if tab attributes got modified
	classicthemerestorerjs.ctr.activityObserver = new MutationObserver(function(mutations) {
	  mutations.forEach(function(mutation) {
		ctrActivityThrobber();
	  });
	});

	// enable observer
	if(classicthemerestorerjs.ctr.activityObserverOn==true) {
	  try{
		classicthemerestorerjs.ctr.activityObserver.observe(gBrowser.selectedTab, { attributes: true, attributeFilter: ['busy'] });
	  }catch(e){}
	}
	
	// if tab is busy, add 'busy' attribute to 'ctraddon_navigator-throbber'
	function ctrActivityThrobber(){
		if(classicthemerestorerjs.ctr.activityObserverOn==true){

		  var navthrobber = null;

		  try{
		    navthrobber = document.getElementById('ctraddon_navigator-throbber');
		  }catch(e){}
		  
		  if(gBrowser.selectedTab.hasAttribute('busy')) {
			try{
			  if(navthrobber!=null) {
				if(navthrobber.hasAttribute('busy')==false) navthrobber.setAttribute('busy','true');
			  }
			}catch(e){}
		  }
		  else {
			try{
			  if(navthrobber!=null) {
				if(navthrobber.hasAttribute('busy')) navthrobber.removeAttribute('busy');
			  }
			}catch(e){}
		  }
		  try{
		    classicthemerestorerjs.ctr.activityObserver.observe(gBrowser.selectedTab, { attributes: true, attributeFilter: ['busy'] });
		  }catch(e){}	  
		  
		}
	}
	
	// listen to tab changes
	if(classicthemerestorerjs.ctr.activityObserverOn==true){
	  window.addEventListener('TabSelect', ctrActivityThrobber, false);
	  window.addEventListener('TabOpen', ctrActivityThrobber, false);
	  window.addEventListener('load', ctrActivityThrobber, false);
	} else {
	  window.removeEventListener('TabSelect', ctrActivityThrobber, false);
	  window.removeEventListener('TabOpen', ctrActivityThrobber, false);
	  window.removeEventListener('load', ctrActivityThrobber, false);
	}

  },
  
  // check, if menubar can be moved
  moveMenubarToToolbar: function(){
  
	var mbarposition = this.prefs.getCharPref("mbarposition");
	var mbarlastposition = this.prefs.getCharPref("mbarpositionl");
	
	if (classicthemerestorerjs.ctr.osstring!="WINNT") {
	  return;
	} else if(mbarposition=="toolbar-menubar" && mbarlastposition=="toolbar-menubar") {
	  return;
	} else if(mbarposition=="ctraddon_extra-bar" && this.prefs.getIntPref("am_extrabars")<1) {
	  return;
	} else {
	  this.moveMenubar(mbarposition);
	}
  
  },
  
  // move menubar items to start position of a toolbar
  moveMenubar: function(mbarposition){

	switch (mbarposition) {
	  case "toolbar-menubar": _moveMenubar("toolbar-menubar"); Services.prefs.getBranch("extensions.classicthemerestorer.").setCharPref("mbarpositionl",'toolbar-menubar'); break;
	  case "TabsToolbar": _moveMenubar("TabsToolbar"); Services.prefs.getBranch("extensions.classicthemerestorer.").setCharPref("mbarpositionl",'TabsToolbar'); break;
	  case "nav-bar": _moveMenubar("nav-bar"); Services.prefs.getBranch("extensions.classicthemerestorer.").setCharPref("mbarpositionl",'nav-bar'); break;
	  case "ctraddon_extra-bar": _moveMenubar("ctraddon_extra-bar"); Services.prefs.getBranch("extensions.classicthemerestorer.").setCharPref("mbarpositionl",'ctraddon_extra-bar'); break;
	  case "PersonalToolbar": _moveMenubar("PersonalToolbar"); Services.prefs.getBranch("extensions.classicthemerestorer.").setCharPref("mbarpositionl",'PersonalToolbar'); break;
	  case "ctraddon_addon-bar": _moveMenubar("ctraddon_addon-bar"); Services.prefs.getBranch("extensions.classicthemerestorer.").setCharPref("mbarpositionl",'ctraddon_addon-bar'); break;
	  case "ctraddon_toolbar_dummy": _moveMenubar("ctraddon_toolbar_dummy"); Services.prefs.getBranch("extensions.classicthemerestorer.").setCharPref("mbarpositionl",'ctraddon_toolbar_dummy'); break;
	}
	
	function _moveMenubar(new_menubar_pos){
	  setTimeout(function(){
		try{
			document.getElementById(''+new_menubar_pos).insertBefore(document.getElementById("menubar-items"), document.getElementById(''+new_menubar_pos).firstChild);
		} catch(e){}
	  },300);
	}
  
  },
 
  /* enable/disable css sheets*/
  loadUnloadCSS: function(which,enable) {
	
	var ios = Services.io;
	
	switch (which) {
	
		case "tabs_squared":
	
			// different appearance for 'tabs not on top' on MacOSX
			if (classicthemerestorerjs.ctr.osstring=="Darwin"){
		
				// enable 'tabs not on top' sheets already here to prevent glitches
				if (enable==true){
				  if(this.prefs.getCharPref("tabsontop")=='false'){
					manageCSS("tabsontop_off.css");
					manageCSS("tabs_squared-r-osx.css");
				  } else if(this.prefs.getCharPref("tabsontop")=='false2'){
					manageCSS("tabsontop_off2.css");
					manageCSS("tabs_squared-r-osx.css");
				  } else {
				    manageCSS("tabs_squared-osx.css");
				  }
				} else if(enable==false){
					manageCSS("tabs_squared-r-osx.css");
					manageCSS("tabs_squared-osx.css");
				}
			} else {
				manageCSS("tabs_squared.css");
			}
		
		break;
		
		case "tabs_squaredc2":		manageCSS("tabs_squaredc2.css"); 		break;
		
		case "tabs_squared2":
	
			// different appearance for 'tabs not on top' on MacOSX
			if (classicthemerestorerjs.ctr.osstring=="Darwin"){
		
				// enable 'tabs not on top' sheets already here to prevent glitches
				if (enable==true){
				  if(this.prefs.getCharPref("tabsontop")=='false'){
					manageCSS("tabsontop_off.css");
					manageCSS("tabs_squared-r-osx2.css");
				  } else if(this.prefs.getCharPref("tabsontop")=='false2'){
					manageCSS("tabsontop_off2.css");
					manageCSS("tabs_squared-r-osx2.css");
				  } else {
				    manageCSS("tabs_squared-osx2.css");
				  }
				} else if(enable==false){
					manageCSS("tabs_squared-r-osx2.css");
					manageCSS("tabs_squared-osx2.css");
				}
			} else {
				manageCSS("tabs_squared2.css");
			}
		
		break;
		
		case "tabs_squared2c2":		manageCSS("tabs_squared2c2.css"); 		break;
		
		case "tabs_curved":
	
			// different appearance for 'tabs not on top' on MacOSX
			if (classicthemerestorerjs.ctr.osstring=="Darwin"){
				
				// enable 'tabs not on top' sheets already here to prevent glitches
				if (enable==true){
				  if(this.prefs.getCharPref("tabsontop")=='false'){
					manageCSS("tabsontop_off.css");
					manageCSS("tabs_curved-r-osx.css");
				  } else if(this.prefs.getCharPref("tabsontop")=='false2'){
					manageCSS("tabsontop_off2.css");
					manageCSS("tabs_curved-r-osx.css");
				  } else {
				    manageCSS("tabs_curved.css");
				  }
				} else if(enable==false){
					manageCSS("tabs_curved-r-osx.css");
					manageCSS("tabs_curved.css");
				}
			}
			else {
			  manageCSS("tabs_curved.css");
			}
		
		break;
		
		case "tabs_curvedall":		manageCSS("tabs_curvedall.css");		break;
		
		case "tabs_devedextra":		manageCSS("tabs_devedextra.css");		break;
		
		case "tabsotoff":
		
			manageCSS("tabsontop_off.css");

			// different appearance for 'tabs not on top' on MacOSX
			if (classicthemerestorerjs.ctr.osstring=="Darwin"){
			
				if (enable==true && this.prefs.getCharPref("tabs")=="tabs_squared"){
					manageCSS("tabs_squared-r-osx.css");
				}
				if (enable==true && this.prefs.getCharPref("tabs")=="tabs_squared2"){
					manageCSS("tabs_squared-r-osx2.css");
				}
				if (enable==true && this.prefs.getCharPref("tabs")=="tabs_curved"){
					manageCSS("tabs_curved-r-osx.css");
				}
				
				if(enable==false && this.prefs.getCharPref("tabs")=="tabs_squared"){
					manageCSS("tabs_squared-r-osx.css");
					enable=true;
					manageCSS("tabs_squared-osx.css");
				}
				if(enable==false && this.prefs.getCharPref("tabs")=="tabs_squared2"){
					manageCSS("tabs_squared-r-osx2.css");
					enable=true;
					manageCSS("tabs_squared-osx2.css");
				}
				if(enable==false && this.prefs.getCharPref("tabs")=="tabs_curved"){
					manageCSS("tabs_curved-r-osx.css");
					enable=true;
					manageCSS("tabs_curved.css");
				}
			}
		
		break;
		
		case "tabsotoff2":
		
			manageCSS("tabsontop_off2.css");

			// different appearance for 'tabs not on top' on MacOSX
			if (classicthemerestorerjs.ctr.osstring=="Darwin"){
			
				if (enable==true && this.prefs.getCharPref("tabs")=="tabs_squared"){
					manageCSS("tabs_squared-r-osx.css");
				}
				if (enable==true && this.prefs.getCharPref("tabs")=="tabs_squared2"){
					manageCSS("tabs_squared-r-osx2.css");
				}
				if (enable==true && this.prefs.getCharPref("tabs")=="tabs_curved"){
					manageCSS("tabs_curved-r-osx.css");
				}
				
				if(enable==false && this.prefs.getCharPref("tabs")=="tabs_squared"){
					manageCSS("tabs_squared-r-osx.css");
					enable=true;
					manageCSS("tabs_squared-osx.css");
				}
				if(enable==false && this.prefs.getCharPref("tabs")=="tabs_squared2"){
					manageCSS("tabs_squared-r-osx2.css");
					enable=true;
					manageCSS("tabs_squared-osx2.css");
				}
				if(enable==false && this.prefs.getCharPref("tabs")=="tabs_curved"){
					manageCSS("tabs_curved-r-osx.css");
					enable=true;
					manageCSS("tabs_curved.css");
				}
			}
		
		break;
	
		case "square_edges": 			manageCSS("tabssquare_edges.css");  	break;
		case "tttitlebar": 				manageCSS("tabsttitleintitlebar.css");  break;
		case "tttitlebar_c": 			manageCSS("tabsttitleintitlebar_centered.css");  break;
		case "ttoverfl_no1": 			manageCSS("tabtitle_nooverflow.css");  	break;
		case "ttoverfl_no2": 			manageCSS("tabtitle_nooverflow2.css");  break;
		
		case "tabtitlepos_left": 		manageCSS("tabtitlepos_left.css");  	break;
		case "tabtitlepos_centered": 	manageCSS("tabtitlepos_centered.css");	break;
		case "tabtitlepos_right": 		manageCSS("tabtitlepos_right.css");  	break;
		
		case "closetab_active": 		manageCSS("closetab_active.css");  		break;
		case "closetab_none": 			manageCSS("closetab_none.css");  		break;
		case "closetab_forced": 		manageCSS("closetab_forced.css");  		break;
		case "closetab_tb_end": 		manageCSS("closetab_tb_end.css");  		break;
		case "closetab_tb_start": 		manageCSS("closetab_tb_start.css");  	break;

		case "closetabhfl": 			manageCSS("closetab_hideonone.css");  	break;
		
		case "closeicon_red": 			manageCSS("close_icon_t_red.css");  	break;
		case "closeicon_w7": 			manageCSS("close_icon_t_w7.css");  		break;
		case "closeicon_w7v2": 			manageCSS("close_icon_t_w7v2.css");  	break;
		case "closeicon_w8": 			manageCSS("close_icon_t_w8.css");  		break;
		case "closeicon_w10": 			manageCSS("close_icon_t_w10.css");  	break;
		case "closeicon_w10i": 			manageCSS("close_icon_t_w10i.css");  	break;
		case "closeicon_w10red": 		manageCSS("close_icon_t_w10red.css");  	break;
		case "closeicon_gc": 			manageCSS("close_icon_t_gc.css");  		break;
		
		case "closeicong_red": 			manageCSS("close_icon_g_red.css");  	break;
		case "closeicong_w7": 			manageCSS("close_icon_g_w7.css");  		break;
		case "closeicong_w7v2": 		manageCSS("close_icon_g_w7v2.css");  	break;
		case "closeicong_w8": 			manageCSS("close_icon_g_w8.css");  		break;
		case "closeicong_w10": 			manageCSS("close_icon_g_w10.css");  	break;
		case "closeicong_w10i": 		manageCSS("close_icon_g_w10i.css");  	break;
		case "closeicong_w10red": 		manageCSS("close_icon_g_w10red.css");  	break;
		case "closeicong_gc": 			manageCSS("close_icon_g_gc.css");  		break;
		
		case "closetabbig": 			manageCSS("close_icon_t_big.css");  	break;
		
		case "closeonleft":
		
			if(this.prefs.getCharPref("tabs")=="tabs_curvedall") manageCSS("close_onleft2.css");
			else manageCSS("close_onleft.css");
			
		break;
		
		case "smallnavbut":
			
			// no small button mode when 'icons + text' mode is used
			if (enable==true) {
				var navtxticomode = this.prefs.getCharPref("nav_txt_ico");
				if(navtxticomode=="iconstxt" || navtxticomode=="iconstxt2"
					|| navtxticomode=="iconstxt3" || navtxticomode=="iconstxt4"){
						enable=false;
				}
			}
	
			manageCSS("smallnavbut.css");
			
			this.loadUnloadCSS('cui_buttons',true);

		break;
		
		case "findbar_top": 		manageCSS("findbar_top.css");  			break;
		case "findbar_topa": 		manageCSS("findbar_top_alt.css"); 		break;
		case "findbar_bottoma": 	manageCSS("findbar_bottom_alt.css");	break;

		case "appbutton_v1":		manageCSS("appbutton.css");				break;
		case "appbutton_v1wt":		manageCSS("appbutton_wt.css");			break;
		case "appbutton_v2":		manageCSS("appbutton2wt.css");			break;
		case "appbutton_v2wt2":		manageCSS("appbutton2wt2.css");			break;
		case "appbutton_v2io":		manageCSS("appbutton2io.css");			break;
		case "appbutton_v2io2":		manageCSS("appbutton2io2.css");			break;
		case "appbutton_v2h":		manageCSS("appbutton2hidden.css");		break;
		case "appbutton_pm": 		manageCSS("paneluibutton_tweak.css");	break;
		case "appbutton_pm2": 		manageCSS("paneluibutton_tweak2.css");	break;
		
		case "appbutton_on_nav":	manageCSS("appbutton_on_navbar.css");	break;
		
		// no 'small button' mode, if 'icons + text' mode is used
		case "iconstxt":
			if(enable==true && this.prefs.getBoolPref("smallnavbut")==true){
				enable=false;
				manageCSS("smallnavbut.css");
				enable=true;
			}
			if(enable==false && this.prefs.getBoolPref("smallnavbut")==true){
				enable=true;
				if(this.fxdefaulttheme) manageCSS("smallnavbut.css");
				enable=false;
			}
			manageCSS("mode_icons_and_text.css");
			this.loadUnloadCSS('cui_buttons',true);
		break;
		
		// no 'small button' mode, if 'icons + text' mode is used
		case "iconstxt2":
			if(enable==true && this.prefs.getBoolPref("smallnavbut")==true){
				enable=false;
				manageCSS("smallnavbut.css");
				enable=true;
			}
			if(enable==false && this.prefs.getBoolPref("smallnavbut")==true){
				enable=true;
				if(this.fxdefaulttheme) manageCSS("smallnavbut.css");
				enable=false;
			}
			manageCSS("mode_icons_and_text2.css");

		break;
		
		// no 'small button' mode, if 'icons + text' mode is used
		case "iconstxt3":
			if(enable==true && this.prefs.getBoolPref("smallnavbut")==true){
				enable=false;
				manageCSS("smallnavbut.css");
				enable=true;
			}
			if(enable==false && this.prefs.getBoolPref("smallnavbut")==true){
				enable=true;
				if(this.fxdefaulttheme) manageCSS("smallnavbut.css");
				enable=false;
			}
			if (classicthemerestorerjs.ctr.osstring=="Darwin") manageCSS("mode_icons_and_text.css");
			else manageCSS("mode_icons_and_text3.css");

		break;
		
		// no 'small button' mode, if 'icons + text' mode is used
		case "iconstxt4":
			if(enable==true && this.prefs.getBoolPref("smallnavbut")==true){
				enable=false;
				manageCSS("smallnavbut.css");
				enable=true;
			}
			if(enable==false && this.prefs.getBoolPref("smallnavbut")==true){
				enable=true;
				if(this.fxdefaulttheme) manageCSS("smallnavbut.css");
				enable=false;
			}
			if (classicthemerestorerjs.ctr.osstring=="Darwin") manageCSS("mode_icons_and_text2.css");
			else manageCSS("mode_icons_and_text4.css");

		break;
		
		case "txtonly":				manageCSS("mode_txtonly.css");			break;
		case "iconstxtfull2":		manageCSS("mode_full_v2.css");			break;
		
		case "iconsbig":

			if(this.fxdefaulttheme){
				manageCSS("mode_icons_big.css");
			}

		break;
		
		case "appbuttonc_orange":	manageCSS("appbutton_base.css");		break;
		case "appbuttonc_aurora":	manageCSS("appbutton_aurora.css");		break;
		case "appbuttonc_nightly":	manageCSS("appbutton_nightly.css");		break;
		case "appbuttonc_transp":	manageCSS("appbutton_transparent.css");	break;
		case "appbuttonc_palemo":	manageCSS("appbutton_palemoon.css");	break;
		case "appbuttonc_red":		manageCSS("appbutton_red.css");			break;
		case "appbuttonc_green":	manageCSS("appbutton_green.css");		break;
		case "appbuttonc_gray":		manageCSS("appbutton_gray.css");		break;
		case "appbuttonc_purple":	manageCSS("appbutton_purple.css");		break;
		case "appbuttonc_white":	manageCSS("appbutton_white.css");		break;

		case "altabico_dark": 		manageCSS("alt_appbutton_icons.css");	break;
		case "altabico_white_nd": 	manageCSS("alt_appbutton_icons2.css");	break;
		case "altabico_dark_nd": 	manageCSS("alt_appbutton_icons3.css");	break;
		case "altabico_grey": 		manageCSS("alt_appbutton_icons4.css");	break;
		case "altabico_grey_nd": 	manageCSS("alt_appbutton_icons5.css");	break;
		case "altabico_white_pm": 	manageCSS("alt_appbutton_icons6.css");	break;
		case "altabico_dark_pm": 	manageCSS("alt_appbutton_icons7.css");	break;
		case "appbutmhi": 			manageCSS("appbuthigherposition.css");  break;
		case "appbutbdl": 			manageCSS("appbutton_borderless.css");  break;
		
		case "hidenavbar": 			manageCSS("hidenavbar.css");  			break;
		case "backforward":			manageCSS("back-forward.css");			break;
		case "nbcompact":
			if(classicthemerestorerjs.ctr.appversion < 54)
			  manageCSS("navbar_compact.css");
		    else manageCSS("navbar_compact2.css");	
		break;
		case "noconicons": 			manageCSS("nocontexticons.css");		break;
		case "options_alt": 		manageCSS("alt_optionspage.css");		break;
		case "options_alt2": 		manageCSS("alt_optionswindow.css");		break;
		case "options_alt3": 		manageCSS("alt_optionswindow2.css");	break;
		case "options_alt4": 		manageCSS("alt_optionspage2.css");		break;
		case "options_win": 		manageCSS("alt_optionswindow.css");		break;
		case "options_win_alt": 	manageCSS("alt_optionswindow2.css");	break;
		case "options_win_ct": 		manageCSS("alt_optionswindow_ct.css");	break;
		case "altoptionsmitem": 	manageCSS("alt_options_mitem.css");		break;
		case "aboutpages": 			manageCSS("aboutpages.css");			break;
		case "svgfilters": 			manageCSS("svgfilters.css");			break;
		case "iat_notf_vt": 		manageCSS("mode_iat_no_vt.css");		break;
		case "to_notf_vt": 			manageCSS("mode_to_no_vt.css");			break;
		case "mbarforceleft": 		manageCSS("menuitems_forceleft.css");	break;
		case "mbarforceright": 		manageCSS("menuitems_forceright.css");	break;
		case "wincontrols": 		manageCSS("windowcontrols.css");		break;
		case "puib_leftsep": 		manageCSS("puibutton_leftsep.css");		break;
		case "puib_rightsep": 		manageCSS("puibutton_rightsep.css");	break;
		case "oldtoplevimg": 		manageCSS("old_toplevel_img.css");		break;
		case "oldtoplevimg2": 		manageCSS("old_toplevel_img2.css");		break;
		case "altdlprogbar": 		manageCSS("alt_dlprogressbar.css");		break;
		case "altalertbox": 		manageCSS("alt_alertboxfx44.css");		break;
		case "navthrobber": 		manageCSS("navthrobber.css");			break;
		case "hideprbutton": 		manageCSS("hidepagereportbutton.css");	break;
		case "starinurl":			manageCSS("starinurl.css");				break;
		case "feedinurl":			manageCSS("feedinurl.css");				break;
		case "statusbar": 			manageCSS("statusbar.css"); 			break;
		case "hideurelstop": 		manageCSS("hideurlbarrelstop.css"); 	break;
		case "hideurelstop2": 		manageCSS("hideurlbarrelstop2.css"); 	break;
		case "hideurlgo": 			manageCSS("hideurlbargo.css"); 			break;
		case "hideurlsrg": 			manageCSS("hideurlbarrelstopgo.css"); 	break;
		case "urlbardropm": 		manageCSS("urlbar_dropm.css"); 			break;
		case "urlbardropm2": 		manageCSS("urlbar_dropm2.css"); 		break;
		case "altreaderico": 		manageCSS("alt_reader_icons.css");		break;
		case "hideurlzoom": 		manageCSS("hide_ulbar_zoom.css");		break;
		case "urlbardark": 			manageCSS("urlbar_darkbg.css");			break;
		case "altautocompl": 		manageCSS("alt_autocomplete.css");		break;
		case "autocompl_it": 		manageCSS("alt_autocompl_items.css");	break;
		case "autocompl_it2": 		manageCSS("alt_autocompl_items2.css");	break;
		case "autocompl_hlb": 		manageCSS("alt_autocompl_hl_b.css");	break;
		case "autocompl_hlu": 		manageCSS("alt_autocompl_hl_u.css");	break;
		case "autocompl_hli": 		manageCSS("alt_autocompl_hl_i.css");	break;
		case "autocompl_hln": 		manageCSS("alt_autocompl_hl_n.css");	break;
		case "autocompl_sep": 		manageCSS("alt_autocompl_sep.css");		break;
		case "autocompl_no_t1": 	manageCSS("autocompl_no_title1.css");	break;
		case "autocompl_no_t2": 	manageCSS("autocompl_no_title2.css");	break;
		case "autocompl_rhl": 		manageCSS("alt_autocompl_rhl.css");		break;
		case "locsearchbw10": 		manageCSS("locationsearchbarw10.css");	break;
		case "combrelstop":			manageCSS("combrelstop.css");			break;
		case "panelmenucol": 		manageCSS("panelmenucolor.css");		break;

		case "altmenubar": 			manageCSS("menubar.css");				break;
		case "altmbarpos1": 		manageCSS("menubar_altpos.css");		break;
		case "altmbarpos2": 		manageCSS("menubar_altpos2.css");		break;
		case "menubarnofog": 		manageCSS("menubar_nofog.css");			break;
		case "menubarfs": 			manageCSS("menubar_infullscreen.css");	break;
		case "noaddonbarbg": 		manageCSS("noaddonbarbg.css");			break;
		case "notabfog": 			manageCSS("notabfog.css");				break;
		case "notabbg": 			manageCSS("notabbg.css");				break;
		case "nobookbarbg": 		manageCSS("nobookbarbg.css");			break;
		case "bookbarfs": 			manageCSS("bmbar_infullscreen.css");	break;
		case "transpttbw10": 		manageCSS("transp_top_tb_w10.css");		break;
		case "transpttbew10": 		manageCSS("transp_top_tbe_w10.css");	break;
		case "transptcw10": 		manageCSS("transp_top_c_w10.css");		break;
		case "nonavbarbg": 			manageCSS("nonavbarbg.css");			break;
		case "nonavborder": 		manageCSS("nonavborder.css");			break;
		case "nonavtbborder": 		manageCSS("nonavtbborder.css");			break;
		case "toptb_oldpad": 		manageCSS("toptb_oldpadding.css");		break;
		case "hidesbclose": 		manageCSS("hidesidebarclose.css");		break;
		case "notextshadow": 		manageCSS("notextshadow.css");			break;
		case "chevronfix": 			manageCSS("chevronfix.css");			break;
		case "tbsep_winc": 			manageCSS("tbsep_winc.css");			break;
		case "highaddonsbar": 		manageCSS("addonsbar_bigger.css");		break;
		case "lessaddonsbar": 		manageCSS("addonsbar_smaller.css");		break;
		case "addonbarfs": 			manageCSS("addonbar_infullscreen.css");	break;
		case "hightabpososx": 		manageCSS("higher_tabs_pos.css");		break;
		case "showalltabsb": 		manageCSS("showalltabsbutton.css");		break;
		case "alttabstb": 			manageCSS("alttabstoolbar.css");		break;
		case "alttabstb2": 			manageCSS("alttabstoolbar2.css");		break;
		case "hidetbwotextra": 		manageCSS("hidetbwot_extra.css");		break;
		case "hidetabsbarwot": 		manageCSS("hidetabsbarwot.css");		break;
		
		case "emptyfavico_t_gen": 	manageCSS("empty_favicon_t0.css");		break;
		case "emptyfavico_t_gen2": 	manageCSS("empty_favicon_t0v2.css");	break;
		case "emptyfavico_t_dot": 	manageCSS("empty_favicon_t1.css");		break;
		case "emptyfavico_t_dot2": 	manageCSS("empty_favicon_t1v2.css");	break;
		case "emptyfavico_t_sheet": manageCSS("empty_favicon_t2.css");		break;
		case "emptyfavico_g_def2": 	manageCSS("empty_favicon_g0.css");		break;
		case "emptyfavico_g_dot": 	manageCSS("empty_favicon_g1.css");		break;
		case "emptyfavico_g_dot2": 	manageCSS("empty_favicon_g1v2.css");	break;
		case "emptyfavico_g_sheet": manageCSS("empty_favicon_g2.css");		break;
		case "noemptypticon": 		manageCSS("empty_favicon_pt.css");		break;
		case "hidezoomres": 		manageCSS("hide_zoomreset.css");		break;
		case "alt_newtabp": 		manageCSS("alt_newtabpage.css");		break;
		case "ctroldsearch": 		manageCSS("oldsearch.css");				break;
		case "osearch_iwidth": 		manageCSS("oldsearch_iwidth.css");		break;
		case "osearch_dm": 			manageCSS("oldsearch_dm.css");			break;
		case "searchbardark": 		manageCSS("searchbar_darkbg.css");		break;
		case "am_nowarning":		manageCSS("am_nowarnings.css");			break;
		case "am_compact":			manageCSS("am_compact.css");			break;
		case "am_compact2":			manageCSS("am_compact2.css");			break;
		case "am_highlight": 		manageCSS("am_highlight.css");			break;
		case "am_buticons": 		manageCSS("am_buttonicons.css");		break;
		case "am_hovshowb": 		manageCSS("am_hovshowbut.css");			break;
		case "alt_addonsp": 		manageCSS("alt_addonspage.css");		break;
		case "am_showrecup": 		manageCSS("am_showrecentupdates.css");	break;
		case "alt_addonsm": 		manageCSS("alt_addonsmanager.css");		break;
	
		case "oldplacesbut": 		manageCSS("oldplacesbut.css");			break;
		case "bmbutpanelm": 		manageCSS("bmbut_pmenu.css");			break;
		case "bmbunsortbm": 		manageCSS("bmbut_unsortedbookm.css");	break;
		case "bmbunsortbm2": 		manageCSS("bmbut_unsortedbookm2.css");	break;
		case "bmbviewbmsb": 		manageCSS("bmbut_bmbviewbmsb.css");		break;
		case "bmbviewbmtb": 		manageCSS("bmbut_bmbviewbmtb.css");		break;
		case "bmbutnotb": 			manageCSS("bmbut_bmbnotb.css");			break;
		case "bmbnounsort": 		manageCSS("bmbut_bmbnounsort.css");		break;
		case "bmbutnotbuns": 		manageCSS("bmbut_bmbutnotbuns.css");	break;
		case "bmbutclpopup": 		manageCSS("bmbut_cleanpopup.css");		break;
		case "bmbutnotext": 		manageCSS("bmbut_no_label.css");		break;
		case "tbconmenu": 			manageCSS("tbconmenu.css");				break;
		case "noresizerxp": 		manageCSS("no_resizer_xp.css");			break;
		case "pmhidelabels": 		manageCSS("panelmenu_nolabels.css");	break;
		case "menupopupscr": 		manageCSS("menupopupscrollbar.css");	break;
		case "ib_nohovcolor": 		manageCSS("ib_nohovcolor.css");			break;
		case "ib_graycolor": 		manageCSS("ib_graycolor.css");			break;
		case "verifiedcolors": 		manageCSS("verifiedcolors.css");		break;
		case "faviconurl": 			manageCSS("faviconurl_extra.css");		break;
		case "ibinfoico": 			manageCSS("hide_ibinfoico.css");		break;
		case "ibinfoico2": 			manageCSS("hide_ibinfoico2.css");		break;
		case "iblabels": 			manageCSS("hide_iblabels.css");			break;
		case "hideprivmask": 		manageCSS("hideprivatemask.css");		break;
		case "bf_space": 			manageCSS("bf_space.css");				break;
	
		case "invicomenubar": 		manageCSS("invicons_menubar.css");		break;
		case "invicotabsbar": 		manageCSS("invicons_tabsbar.css");		break;
		case "inviconavbar": 		manageCSS("invicons_navbar.css");		break;
		case "invicoextrabar": 		manageCSS("invicons_extrabar.css");		break;
		case "invicobookbar": 		manageCSS("invicons_bookmarksbar.css");	break;
		case "invicoaddonbar": 		manageCSS("invicons_addonbar.css");		break;
		
		case "tabsep_black": 		manageCSS("tab_sep.css");				break;
		case "tabsep_luna": 		manageCSS("tab_sep_luna.css");			break;
		case "tabsep_xp": 			manageCSS("tab_sep_xp.css");			break;
		case "tabsep_white": 		manageCSS("tab_sep-inv.css");			break;
		case "tabsep_black_sol": 	manageCSS("tab_sep_solid.css");			break;
		case "tabsep_white_sol": 	manageCSS("tab_sep_solid-inv.css");		break;
		case "tabsep_black_sol2": 	manageCSS("tab_sep_solid2.css");		break;
		case "tabsep_white_sol2": 	manageCSS("tab_sep_solid-inv2.css"); 	break;
		
		case "tabmokcolor": 		manageCSS("tabmokcolor.css");			break;
		case "tabmokcolor2": 		manageCSS("tabmokcolor2.css");			break;
		case "tabmokcolor4": 		manageCSS("tabmokcolor4.css");			break;
			
		case "padlock_default": 	manageCSS("padlock_default.css");		break;
		case "padlock_classic": 	manageCSS("padlock_classic.css");		break;
		case "padlock_amo": 		manageCSS("padlock_amo.css");			break;
		case "padlock_modern":		manageCSS("padlock_modern.css");		break;
		case "padlock_modern2":		manageCSS("padlock_modern2.css");		break;
		case "padlock_extra":		manageCSS("padlock_extra.css");			break;
		case "padlock_none":		manageCSS("padlock_none.css");			break;
		case "padlock2_classic": 	manageCSS("padlock2_classic.css");		break;
		case "padlock2_amo": 		manageCSS("padlock2_amo.css");			break;
		case "padlock2_modern":		manageCSS("padlock2_modern.css");		break;
		case "padlock2_modern2":	manageCSS("padlock2_modern2.css");		break;
		case "padlock2_none":		manageCSS("padlock2_none.css");			break;
		
		case "throbber_alt": 		manageCSS("throbberalt.css");			break;
		case "throbber_fx39": 		manageCSS("throbberalt2.css");			break;
		case "throbber_nav": 		manageCSS("throbberalt3.css");			break;
		case "throbber_ub": 		manageCSS("throbberalt4.css");			break;
		case "bmanimation": 		manageCSS("hidebmanimation.css");		break;
		case "pananimation": 		manageCSS("hidepanelanimation.css");	break;
		case "cpanelmenus": 		manageCSS("compactpanelmenus.css");		break;
		
		case "closeabarbut": 		manageCSS("closeabarbut.css");			break;
		case "appmenuitem": 		manageCSS("ctraddon_appmenuitem.css");	break;
		case "contextitem": 		manageCSS("ctraddon_contextmitem.css");	break;
		case "puictrbutton": 		manageCSS("ctraddon_puictrbutton.css");	break;
		case "toolsitem": 			manageCSS("ctraddon_toolsitem.css");	break;
		
		case "cuibuttons":			manageCSS("cuibuttons.css");			break;
		
		case "nodevtheme2":			manageCSS("no_devtheme.css");			break;
		
		case "spaces_extra": 		manageCSS("spaces_extra.css");			break;


 		case "appbuttonc_ontoolbar":	manageCSS("appbuttonontoolbar.css");		break;
 		case "appbuttonc_buttoncolor":	manageCSS("appbuttoncolor.css");		break;
 		case "appbuttonc_default":	manageCSS("cctr/appbutton_base.css");		break;
		case "appbuttonc_orange_dark":	manageCSS("cctr/appbutton_orange_dark.css");		break;
		case "appbuttonc_cyan":	manageCSS("cctr/appbutton_cyan.css");		break;
		case "appbuttonc_red_dark":		manageCSS("cctr/appbutton_red_dark.css");			break;
		case "appbuttonc_green_dark":	manageCSS("cctr/appbutton_green_dark.css");		break;
		case "appbuttonc_salmon":		manageCSS("cctr/appbutton_salmon.css");		break;

		case "alt_newtabpalt": manageCSS("cctr/alt_newtabpage_alt.css"); break;
		case "aboutnewtabbgstretch": manageCSS("cctr/aboutnewtabbgstretch.css"); break;
		case "tree_style_fix": 		manageCSS("cctr/tree_style_fix.css");	break;
		
		case "abouthomedark":
				manageCSS("cctr/abouthomedark.css");				
		break;
		case "abouthomedarkalt":
				manageCSS("cctr/abouthomedarkalt.css");			
		break;
		case "abouthomelight": 
			  manageCSS("cctr/abouthomelight.css");
		break;
		case "abouthomelightalt": 
				manageCSS("cctr/abouthomelightalt.css");
		break;
		case "abouthomesimplicity":
				manageCSS("cctr/abouthomesimplicity.css");				
		break;	
		case "abouthomesimplicityblue": 				manageCSS("cctr/abouthomesimplicityintel.css");	break;		
		case "abouthomesimplicityred": 				manageCSS("cctr/abouthomesimplicityamd.css");	break;
		case "abouthomesimplicitygreen": 			manageCSS("cctr/abouthomesimplicitylinux.css");	break;
		case "abouthomesimplicityyellow": 			manageCSS("cctr/abouthomesimplicitybeta.css");	break;
		case "abouthomebgstretch": 							manageCSS("cctr/abouthomebgstretch.css");	break;
		case "abouthomenobar": 							manageCSS("cctr/abouthomenobar.css");	break;
		case "abouthomenoappsbar": 							manageCSS("cctr/abouthomenoappsbar.css");	break;			
		case "abouthomenologo": 						manageCSS("cctr/abouthomenologo.css");	break;		
		case "abouthomenoicons": 						manageCSS("cctr/abouthomenoicons.css");	break;	
		case "abouthomenosnippets": 					manageCSS("cctr/abouthomenosnippets.css");	break;
		case "abouthomeanimate": 						manageCSS("cctr/abouthomeanimate.css");	break;
		case "colapsesearchaddons": 						manageCSS("cctr/colapsesearchaddons.css"); break;
		case "nopocket": 						manageCSS("cctr/nopocket.css"); break;
		
		case "throbber_alt1": 		manageCSS("cctr/throbberalt_1.css");			break;
		case "throbber_alt2": 		manageCSS("cctr/throbberalt_2.css");			break;
		case "throbber_alt3": 		manageCSS("cctr/throbberalt_3.css");			break;
		case "throbber_alt4": 		manageCSS("cctr/throbberalt_4.css");			break;
		case "throbber_alt5": 		manageCSS("cctr/throbberalt_5.css");			break;
		
		case "alwaysshowaddonversion":
			manageCSS("cctr/alwaysshowaddonversion.css");
		break;
		
		case "thirdpartythemes": 	manageCSS("thirdpartythemes.css");		break;
		
		case "hidetabaudioico": 	manageCSS("hidetabaudioico.css");		break;
		case "urlresults":			manageCSS("urlbar_results.css");		break;
		case "cresultshcb":			manageCSS("urlbar_results2.css");		break;
		
		case "aerocolors":
			
			removeOldSheet(this.aerocolors);
			
			if(enable==true) {
				
				var main_ab_color = '#dbeaf9';
				
				if (this.prefs.getBoolPref("aerocolorsg"))
				  main_ab_color = '#cfdbec';
			
				var aero_color_addonsm = '';
				
				if (this.prefs.getBoolPref("alt_addonsm")) {
					aero_color_addonsm = '\
						#addons-page {\
						  background: linear-gradient(to bottom right, #edf6ff,'+main_ab_color+',#edf6ff,'+main_ab_color+') !important;\
						}\
					';
				}
				
				var aero_color_optionsp = '';
				
				if (this.prefs.getCharPref("altoptions")=='options_alt' || this.prefs.getCharPref("altoptions")=='options_alt2' || this.prefs.getCharPref("altoptions")=='options_win') {
					aero_color_optionsp = '\
					  @-moz-document url(about:preferences),url-prefix(about:preferences){\
						page, #dialogBox .groupbox-title {\
						  background: linear-gradient(to bottom right, #edf6ff,'+main_ab_color+',#edf6ff,'+main_ab_color+') !important;\
						}\
					  }\
					';
				}
				
				
				var aero_color_tabs = '';
				
				if(this.prefs.getCharPref('tabs')=='tabs_squared'){
					aero_color_tabs = '\
						#main-window[defaultfxtheme="true"] #tabbrowser-tabs:not(:-moz-lwtheme) .tabbrowser-tab[selected="true"]:not(:-moz-lwtheme) {\
						  background-image: linear-gradient(to top,#eaf2fb,#eef5fc,#fbfdff);\
						}\
						#main-window[defaultfxtheme="true"] #tabbrowser-tabs:not(:-moz-lwtheme) .tabbrowser-tab:not([selected="true"]):not(:hover):not(:-moz-lwtheme) {\
						  background-image: linear-gradient(to top, #868d94 0px, transparent 1px),linear-gradient(to top,#b4c0cc,#c8d4e1,#d1deec);\
						}\
						#main-window[defaultfxtheme="true"] #tabbrowser-tabs:not(:-moz-lwtheme) .tabbrowser-tab:not([selected="true"]):hover:not(:-moz-lwtheme) {\
						  background-image: linear-gradient(to top, #868d94 0px, transparent 1px),linear-gradient(to top,#d0dce8,#dce7f3,#e5effa);\
						}\
						#main-window[defaultfxtheme="true"] #tabbrowser-tabs:not(:-moz-lwtheme) .tabs-newtab-button:not(:-moz-lwtheme) {\
						  background-image: linear-gradient(to top, #868d94 0px, transparent 1px),linear-gradient(to top,#b4c0cc,#c8d4e1,#d1deec) !important;\
						}\
						#main-window[defaultfxtheme="true"] #tabbrowser-tabs:not(:-moz-lwtheme) .tabs-newtab-button:hover:not(:-moz-lwtheme) {\
						  background-image: linear-gradient(to top, #868d94 0px, transparent 1px),linear-gradient(to top,#d0dce8,#dce7f3,#e5effa) !important;\
						}\
					';
				}
				else if(this.prefs.getCharPref('tabs')=='tabs_squaredc2'){
					aero_color_tabs  = '\
						#main-window[defaultfxtheme="true"] .tabs-newtab-button:not(:-moz-lwtheme),\
						#main-window[defaultfxtheme="true"] .tabbrowser-tab:not(:-moz-lwtheme) .tab-content {\
						  background-image: linear-gradient(to top,#b4c0cc,#c8d4e1,#d1deec) !important;\
						}\
						#main-window[defaultfxtheme="true"] .tabs-newtab-button:hover:not(:-moz-lwtheme),\
						#main-window[defaultfxtheme="true"] .tabbrowser-tab:not([selected]):hover:not(:-moz-lwtheme) .tab-content {\
						  background-image: linear-gradient(to top,#d0dce8,#dce7f3,#e5effa) !important;\
						}\
						#main-window[defaultfxtheme="true"] .tabbrowser-tab[selected]:not(:-moz-lwtheme) .tab-content {\
						  background-image: linear-gradient(to top,#eaf2fb,#eef5fc,#fbfdff) !important;\
						}\
					';
				}
				else if(this.prefs.getCharPref('tabs')=='tabs_squared2'){
					aero_color_tabs  = '\
						#main-window[defaultfxtheme="true"] #tabbrowser-tabs:not(:-moz-lwtheme) .tabbrowser-tab[selected="true"]:not(:-moz-lwtheme) {\
						  background-image: linear-gradient(to top,#eaf2fb,#eef5fc,#fbfdff);\
						}\
					';
				}
				else if(this.prefs.getCharPref('tabs')=='tabs_squared2c2'){
					aero_color_tabs  = '\
						#main-window[defaultfxtheme="true"] .tabbrowser-tab[selected]:not(:-moz-lwtheme) .tab-content {\
						  background-image: linear-gradient(to top,#eaf2fb,#eef5fc,#fbfdff) !important;\
						}\
					';
				}
				else if(this.prefs.getCharPref('tabs')=='tabs_curved'){
					aero_color_tabs  = '\
						#main-window[fx51plus="true"] #tabbrowser-tabs::after,\
						#main-window[fx51plus="true"] #tabbrowser-tabs::before,\
						#main-window[fx51plus="true"] .tabbrowser-tab::after,\
						#main-window[fx51plus="true"] .tabbrowser-tab::before {\
						  opacity: 0 !important;\
						}\
						#main-window .tabbrowser-tab:not(:-moz-lwtheme):not([visuallyselected=true]):not(:hover) .tab-stack .tab-background-middle,\
						#main-window .tabbrowser-tab:not(:-moz-lwtheme):not([visuallyselected=true]):not(:hover) .tab-background-start,\
						#main-window .tabbrowser-tab:not(:-moz-lwtheme):not([visuallyselected=true]):not(:hover) .tab-background-end{\
						  background-image: linear-gradient(transparent, transparent 2px, #d1deec 0px, #c8d4e1, #b4c0cc), none !important;\
						}\
						#main-window .tabbrowser-tab:not(:-moz-lwtheme):not([visuallyselected=true]):hover .tab-stack .tab-background-middle,\
						#main-window .tabbrowser-tab:not(:-moz-lwtheme):not([visuallyselected=true]):hover .tab-background-start,\
						#main-window .tabbrowser-tab:not(:-moz-lwtheme):not([visuallyselected=true]):hover .tab-background-end {\
						  background-image: linear-gradient(transparent, transparent 2px, #e5effa 0px, #dce7f3,#d0dce8), none !important;\
						}\
						#main-window .tab-background-start[selected=true]:-moz-locale-dir(ltr):not(:-moz-lwtheme)::before,\
						#main-window .tab-background-end[selected=true]:-moz-locale-dir(rtl):not(:-moz-lwtheme)::before {\
						  background-image: url(chrome://browser/skin/tabbrowser/tab-stroke-start.svg),linear-gradient(transparent, transparent 2px,#fbfdff 2px, #eaf2fb) !important;\
						  clip-path: url(chrome://browser/content/browser.xul#tab-curve-clip-path-start) !important;\
						}\
						#main-window .tab-background-end[selected=true]:-moz-locale-dir(ltr):not(:-moz-lwtheme)::before,\
						#main-window .tab-background-start[selected=true]:-moz-locale-dir(rtl):not(:-moz-lwtheme)::before {\
						  background-image: url(chrome://browser/skin/tabbrowser/tab-stroke-end.svg),linear-gradient(transparent, transparent 2px,#fbfdff 2px, #eaf2fb) !important;\
						  clip-path: url(chrome://browser/content/browser.xul#tab-curve-clip-path-end) !important;\
						}\
						#main-window .tab-background-middle[selected=true]:not(:-moz-lwtheme) {\
						  background-color: transparent !important;\
						  background-image: url(chrome://browser/skin/tabbrowser/tab-active-middle.png),linear-gradient(transparent, transparent 2px,#fbfdff 2px, #eaf2fb), none !important;\
						}\
						#main-window[defaultfxtheme="true"] #TabsToolbar .tabs-newtab-button:not(:-moz-lwtheme){\
						  background-image: url(chrome://classic_theme_restorer/content/images/nt_aero_start.png),\
											url(chrome://classic_theme_restorer/content/images/nt_aero_middle.png),\
											url(chrome://classic_theme_restorer/content/images/nt_aero_end.png) !important;\
						}\
						#main-window[defaultfxtheme="true"] #TabsToolbar .tabs-newtab-button:not(:-moz-lwtheme):hover{\
						  background-image: url(chrome://classic_theme_restorer/content/images/nt_aero_start_hov.png),\
											url(chrome://classic_theme_restorer/content/images/nt_aero_middle_hov.png),\
											url(chrome://classic_theme_restorer/content/images/nt_aero_end_hov.png) !important;\
						}\
						.tabbrowser-tab:not([pinned]):not([protected]):not([autoReload]) .tab-close-button {\
						  -moz-appearance: none !important;\
						  -moz-image-region: rect(0, 64px, 16px, 48px) !important;\
						  border: none !important;\
						  padding: 0px !important;\
						  list-style-image: url("chrome://classic_theme_restorer/content/images/close.png") !important;\
						}\
						.tabbrowser-tab:not([pinned]):not([protected]):not([autoReload]) .tab-close-button:hover,\
						.tabbrowser-tab:not([pinned]):not([protected]):not([autoReload]) .tab-close-button:hover[selected="true"] {\
						  -moz-image-region: rect(0, 32px, 16px, 16px) !important;\
						}\
						.tabbrowser-tab:not([pinned]):not([protected]):not([autoReload]) .tab-close-button:hover:active,\
						.tabbrowser-tab:not([pinned]):not([protected]):not([autoReload]) .tab-close-button:hover:active[selected="true"] {\
						  -moz-image-region: rect(0, 48px, 16px, 32px) !important;\
						}\
						.tabbrowser-tab:not([pinned]):not([protected]):not([autoReload]) .tab-close-button[selected="true"] {\
						  -moz-image-region: rect(0, 16px, 16px, 0) !important;\
						}\
					';
				}
				else if(this.prefs.getCharPref('tabs')=='tabs_default'){
					aero_color_tabs  = '\
						#main-window .tab-background-start[selected=true]:-moz-locale-dir(ltr):not(:-moz-lwtheme)::before,\
						#main-window .tab-background-end[selected=true]:-moz-locale-dir(rtl):not(:-moz-lwtheme)::before {\
						  background-image: url(chrome://browser/skin/tabbrowser/tab-stroke-start.svg),linear-gradient(transparent, transparent 2px,#fbfdff 2px, #eaf2fb) !important;\
						  clip-path: url(chrome://browser/content/browser.xul#tab-curve-clip-path-start) !important;\
						}\
						#main-window .tab-background-end[selected=true]:-moz-locale-dir(ltr):not(:-moz-lwtheme)::before,\
						#main-window .tab-background-start[selected=true]:-moz-locale-dir(rtl):not(:-moz-lwtheme)::before {\
						  background-image: url(chrome://browser/skin/tabbrowser/tab-stroke-end.svg),linear-gradient(transparent, transparent 2px,#fbfdff 2px, #eaf2fb) !important;\
						  clip-path: url(chrome://browser/content/browser.xul#tab-curve-clip-path-end) !important;\
						}\
						#main-window .tab-background-middle[selected=true]:not(:-moz-lwtheme) {\
						  background-color: transparent !important;\
						  background-image: url(chrome://browser/skin/tabbrowser/tab-active-middle.png),linear-gradient(transparent, transparent 2px,#fbfdff 2px, #eaf2fb), none !important;\
						}\
					';
				}
			
			
				this.aerocolors=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\
					@-moz-document url(chrome://browser/content/browser.xul) {\
						/* Toolbars */\
						#main-window[defaultfxtheme="true"] :not(#theFoxOnlyBetter-slimChrome-toolbars) > #nav-bar:not(:-moz-lwtheme){\
						  background-image: linear-gradient(#eaf2fb,'+main_ab_color+') !important;\
						  box-shadow:unset !important;\
						}\
						#main-window[defaultfxtheme="true"][tabsontop="false"] #TabsToolbar:not(:-moz-lwtheme),\
						#main-window[defaultfxtheme="true"] :not(#theFoxOnlyBetter-slimChrome-toolbars) > toolbar:not(#toolbar-menubar):not(#TabsToolbar):not(#nav-bar):not(.devtools-tabbar):not(#developer-toolbar):not(.devtools-responsiveui-toolbar):not(#puzzleBars-urlbar-bar):not(#theFoxOnlyBetter-skyLights-container):not(#theFoxOnlyBetter-slimChrome-slimmer),\
						#main-window[defaultfxtheme="true"] #theFoxOnlyBetter-slimChrome-container > *:not(#theFoxOnlyBetter-slimChrome-toolbars-bottom):not(:-moz-lwtheme),\
						#main-window[defaultfxtheme="true"] #ctraddon_urlextrabar:not(:-moz-lwtheme),\
						#main-window[defaultfxtheme="true"] findbar{\
						  background-image:unset !important;\
						  background-color:'+main_ab_color+' !important;\
						}\
						@media all and (-moz-windows-classic) {\
						  #main-window[defaultfxtheme="true"]:not([tabsintitlebar]) #navigator-toolbox:not(:-moz-lwtheme),\
						  #main-window[defaultfxtheme="true"]:not([tabsintitlebar])[tabsontop="false"] #toolbar-menubar:not(:-moz-lwtheme){\
							-moz-appearance: none !important;\
							background-image:unset !important;\
							background-color:'+main_ab_color+' !important;\
						  }\
						}\
						#main-window[defaultfxtheme="true"] #theFoxOnlyBetter-slimChrome-slimmer:not([collapsed]) ~ #theFoxOnlyBetter-slimChrome-container > *:not(#theFoxOnlyBetter-slimChrome-toolbars-bottom):not(:-moz-lwtheme){\
						  background-image: linear-gradient(#eaf2fb 0px, '+main_ab_color+' 36px, '+main_ab_color+') !important;\
						}\
						#main-window[defaultfxtheme="true"] #theFoxOnlyBetter-slimChrome-slimmer:not([collapsed]) {\
						  background: #eaf2fb !important;\
						}\
						/* location bar / search bar borders */\
						#main-window[defaultfxtheme="true"] #urlbar-container #urlbar-wrapper #urlbar:not(:-moz-lwtheme),\
						#main-window[defaultfxtheme="true"] #search-container #searchbar .searchbar-textbox:not(:-moz-lwtheme) {\
						  border-color: hsla(210,54%,20%,.25) hsla(210,54%,20%,.27) hsla(210,54%,20%,.3) hsla(210,54%,20%,.27) !important;\
						}\
						#main-window[defaultfxtheme="true"] #urlbar-container #urlbar-wrapper #urlbar:not(:-moz-lwtheme)[focused],\
						#main-window[defaultfxtheme="true"] #search-container #searchbar .searchbar-textbox:not(:-moz-lwtheme)[focused] {\
						  border-color: Highlight !important;\
						}\
						#main-window[defaultfxtheme="true"] #urlbar-container #urlbar-wrapper #urlbar:not(:-moz-lwtheme):not([focused]):hover,\
						#main-window[defaultfxtheme="true"] #search-container #searchbar .searchbar-textbox:not(:-moz-lwtheme):not([focused]):hover {\
						  border-color: hsla(210,54%,20%,.35) hsla(210,54%,20%,.37) hsla(210,54%,20%,.4) hsla(210,54%,20%,.37) !important;\
						}\
						#main-window[defaultfxtheme="true"] #urlbar-container #urlbar-wrapper #urlbar:not(:-moz-lwtheme)[focused],\
						#main-window[defaultfxtheme="true"] #search-container #searchbar .searchbar-textbox:not(:-moz-lwtheme)[focused] {\
						  border-color: hsla(206,100%,60%,.65) hsla(206,100%,55%,.65) hsla(206,100%,50%,.65) hsla(206,100%,55%,.65) !important;\
						}\
						@media (-moz-windows-classic), (-moz-windows-default-theme) {\
							/* CTR appmenu */\
							#main-window[defaultfxtheme="true"] #appmenuPrimaryPane {\
							  -moz-border-end: 1px solid #d6e5f5 !important;\
							}\
							#main-window[defaultfxtheme="true"] #appmenu-popup {\
							  -moz-appearance: none !important;\
							  background: white !important;\
							  border: 1px solid ThreeDShadow !important;\
							}\
							#main-window[defaultfxtheme="true"] #appmenuPrimaryPane {\
							  background-color: rgba(255,255,255,0.5) !important;\
							  padding: 2px !important;\
							  -moz-border-end: 1px solid #d6e5f5 !important;\
							}\
							#main-window[defaultfxtheme="true"] #appmenuSecondaryPane {\
							  background-color: #f1f5fb !important;\
							  -moz-padding-start: 3px !important;\
							  -moz-padding-end: 2px !important;\
							  padding-top: 2px !important;\
							  padding-bottom: 2px !important;\
							  -moz-border-start: 0px !important;\
							}\
							#main-window[defaultfxtheme="true"] #appmenuPrimaryPane menupopup {\
							  -moz-appearance: none !important;\
							  background:white !important;\
							  border: 3px solid !important;\
							  -moz-border-top-colors: ThreeDShadow white !important;\
							  -moz-border-bottom-colors: ThreeDShadow white !important;\
							  -moz-border-left-colors: ThreeDShadow white !important;\
							  -moz-border-right-colors: ThreeDShadow white !important;\
							}\
							#main-window[defaultfxtheme="true"] #appmenuSecondaryPane menupopup {\
							  -moz-appearance: none !important;\
							  background: #f1f5fb !important;\
							  border: 3px solid !important;\
							  -moz-border-top-colors: ThreeDShadow #f1f5fb !important;\
							  -moz-border-bottom-colors: ThreeDShadow #f1f5fb !important;\
							  -moz-border-left-colors: ThreeDShadow #f1f5fb !important;\
							  -moz-border-right-colors: ThreeDShadow #f1f5fb !important;\
							}\
							#main-window[defaultfxtheme="true"] #appmenuPrimaryPane > menuseparator {\
							  -moz-appearance: none !important;\
							  margin-top: 3px !important;\
							  margin-bottom: 3px !important;\
							  padding: 0 !important;\
							  border-top: 1px solid #d6e5f5 !important;\
							  border-bottom: none !important;\
							}\
						}\
					}\
					'+aero_color_tabs+'\
					'+aero_color_addonsm+'\
					'+aero_color_optionsp+'\
				'), null, null);
			
				applyNewSheet(this.aerocolors);
			}
			
		break;
		
		case "appbuttonc_custom":
		
			removeOldSheet(this.appbutton_color);
			//Here we are using 2 colors with percentage control			
			var newColor = this.prefs.getCharPref('cappbutc1')+', '+this.prefs.getCharPref('cappbutc2')+' '+ this.prefs.getIntPref('cappbutcpercent') +'%';	
			var newColorP = this.prefs.getCharPref('cappbutpc1')+', '+this.prefs.getCharPref('cappbutpc2')+' '+ this.prefs.getIntPref('cappbutcpercent') +'%';
      var buttonTextShadow = "";
			if(this.prefs.getBoolPref('cappbutnotxtsh')){
				buttonTextShadow = "none!important;";
			}	
			if(enable==true && this.prefs.getCharPref('appbuttonc')=='appbuttonc_custom' && (this.prefs.getCharPref('appbutton')=='appbutton_pm' || this.prefs.getCharPref('appbutton')=='appbutton_pm2')) {
			
				this.appbutton_color=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\
					@-moz-document url(chrome://browser/content/browser.xul) {\
						:root {\
							--color-button-main: linear-gradient('+newColor+');\
              --color-button-main-private: linear-gradient('+newColorP+');\
						}\
					}\
				'), null, null);

				classicthemerestorerjs.ctr.loadUnloadCSS('appbuttonc_buttoncolor',true);
				applyNewSheet(this.appbutton_color);
			
			} else if(enable==true && this.prefs.getCharPref('appbuttonc')=='appbuttonc_custom') {
				
				var appbuttonontoolbar='';
				
				if(this.prefs.getBoolPref('appbuttonct')){
				classicthemerestorerjs.ctr.loadUnloadCSS('appbuttonc_ontoolbar',true);
				appbuttonontoolbar='\
					@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\
					@-moz-document url(chrome://browser/content/browser.xul) {\
						:root {\
							--color-button-main: linear-gradient('+newColor+');\
              --color-button-main-private: linear-gradient('+newColorP+');\
							--color-button-text:'+this.prefs.getCharPref('cappbuttxtc')+';\
							--text-style-shadow:'+buttonTextShadow+';\
						}\
					}\
				';
				}

				this.appbutton_color=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
				@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\
				@-moz-document url(chrome://browser/content/browser.xul), url(chrome://classic_theme_restorer/content/options.xul) {\
					:root {\
					  --color-button-main: linear-gradient('+newColor+');\
            --color-button-main-private: linear-gradient('+newColorP+');\
					  --color-button-hover:radial-gradient(farthest-side at center bottom, hsla(210,48%,90%,.5) 10%, hsla(210,48%,90%,0) 70%),\
															radial-gradient(farthest-side at center bottom, hsla(211,70%,83%,.5), hsla(211,70%,83%,0)),\
															linear-gradient('+newColor+');\
					  --color-button-open: linear-gradient('+newColor+');\
					  --color-button-text:'+this.prefs.getCharPref('cappbuttxtc')+';\
					  --text-style-shadow:'+buttonTextShadow+';\
					}\
				'+appbuttonontoolbar+'\
				'), null, null);

				classicthemerestorerjs.ctr.loadUnloadCSS('appbuttonc_orange',true);			
				applyNewSheet(this.appbutton_color);
			
			}
		
		break;
		
		case "appbuttonc_custom1":
		
			removeOldSheet(this.appbutton_color);
			//Here we are using 3 colors with percentage control
			var newColor = this.prefs.getCharPref('cappbutc1')+', '+this.prefs.getCharPref('cappbutcm')+', '+this.prefs.getCharPref('cappbutc2')+' '+ this.prefs.getIntPref('cappbutcpercent') +'%';
			var newColorP = this.prefs.getCharPref('cappbutpc1')+', '+this.prefs.getCharPref('cappbutpc2')+' '+ this.prefs.getIntPref('cappbutcpercent') +'%';
      var buttonTextShadow = "";
			if(this.prefs.getBoolPref('cappbutnotxtsh')){
				buttonTextShadow = "none!important;";
			}
      			
			if(enable==true && this.prefs.getCharPref('appbuttonc')=='appbuttonc_custom' && this.prefs.getCharPref('appbutton')=='appbutton_pm') {
			
				this.appbutton_color=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\
					@-moz-document url(chrome://browser/content/browser.xul) {\
						:root {\
							--color-button-main: linear-gradient('+newColor+');\
              --color-button-main-private: linear-gradient('+newColorP+');\
						}\
					}\
				'), null, null);

				classicthemerestorerjs.ctr.loadUnloadCSS('appbuttonc_buttoncolor',true);			
				applyNewSheet(this.appbutton_color);
			
			} else if(enable==true && this.prefs.getCharPref('appbuttonc')=='appbuttonc_custom1') {

				
				var appbuttonontoolbar='';
				
				if(this.prefs.getBoolPref('appbuttonct')){
				classicthemerestorerjs.ctr.loadUnloadCSS('appbuttonc_ontoolbar',true);
				appbuttonontoolbar='\
					@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\
					@-moz-document url(chrome://browser/content/browser.xul) {\
						:root {\
							--color-button-main: linear-gradient('+newColor+');\
              --color-button-main-private: linear-gradient('+newColorP+');\
							--color-button-text:'+this.prefs.getCharPref('cappbuttxtc')+';\
							--text-style-shadow:'+buttonTextShadow+';\
						}\
					}\
				';
				}

				this.appbutton_color=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
				@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\
				@-moz-document url(chrome://browser/content/browser.xul), url(chrome://classic_theme_restorer/content/options.xul) {\
					:root {\
					  --color-button-main: linear-gradient('+newColor+');\
            --color-button-main-private: linear-gradient('+newColorP+');\
					  --color-button-hover:radial-gradient(farthest-side at center bottom, hsla(210,48%,90%,.5) 10%, hsla(210,48%,90%,0) 70%),\
															radial-gradient(farthest-side at center bottom, hsla(211,70%,83%,.5), hsla(211,70%,83%,0)),\
															linear-gradient('+newColor+');\
					  --color-button-open: linear-gradient('+newColor+');\
					  --color-button-text:'+this.prefs.getCharPref('cappbuttxtc')+';\
					  --text-style-shadow:'+buttonTextShadow+';\
					}\
				'+appbuttonontoolbar+'\
				'), null, null);

				classicthemerestorerjs.ctr.loadUnloadCSS('appbuttonc_orange',true);			
				applyNewSheet(this.appbutton_color);
			
			}
		
		break;
	
		case "ctabheight":
			removeOldSheet(this.tabheight);
			
			if(enable==true && this.prefs.getBoolPref('ctabheightcb')){
			
				var linuxbutton='';
				
				var windows10fx47captionb='';
				var windows10fx47appbuttonicon='';
				
				if (classicthemerestorerjs.ctr.osstring!="Darwin" && classicthemerestorerjs.ctr.osstring!="WINNT") {
					linuxbutton='\
						#TabsToolbar toolbarbutton{\
						  padding-top:0 !important;\
						  padding-bottom:0 !important;\
						}\
					';
				}
				
				if (classicthemerestorerjs.ctr.osstring=="WINNT" && this.prefs.getIntPref('ctabheight')<28) {
					windows10fx47captionb='\
					  @media (-moz-os-version: windows-win10) {\
						#main-window[fx47plus="true"][sizemode="maximized"] #titlebar-buttonbox toolbarbutton {\
						  padding-top: 5px !important;\
						  padding-bottom: 5px !important;\
						}\
					  }\
					';
				}
			
				if(this.prefs.getCharPref("appbutton")=="appbutton_v2io" || this.prefs.getCharPref("appbutton")=="appbutton_v2io2") {
				  if (classicthemerestorerjs.ctr.osstring=="WINNT" && this.prefs.getIntPref('ctabheight')<28) {
					windows10fx47appbuttonicon='\
					  @media (-moz-os-version: windows-win10) {\
						#main-window[fx47plus="true"][sizemode="maximized"] #ctraddon_appbutton2{\
						  margin-top:-1px !important;\
						  margin: -1px 0 2px -2px !important;\
						}\
					  }\
					';
				  }
				}
			
				this.tabheight=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					.tab-background-start[selected=true]::after,\
					.tab-background-start[selected=true]::before,\
					.tab-background-start,\
					.tab-background-end,\
					.tab-background-end[selected=true]::after,\
					.tab-background-end[selected=true]::before,\
					.tabbrowser-tab .tab-stack .tab-background,\
					.tabs-newtab-button,\
					#tabbrowser-tabs,\
					.tabbrowser-tab,\
					.tabbrowser-tab[pinned],\
					.tabbrowser-tab .tab-stack,\
					.tabbrowser-tab .tab-stack > .tab-content{\
					  min-height:'+this.prefs.getIntPref('ctabheight')+'px !important;\
					}\
					#TabsToolbar .tabbrowser-tab[pinned],\
					#TabsToolbar .tabs-newtab-button,\
					#TabsToolbar .tabbrowser-tab{\
					  height: '+this.prefs.getIntPref('ctabheight')+'px !important;\
					}\
					'+linuxbutton+'\
					'+windows10fx47captionb+'\
					'+windows10fx47appbuttonicon+'\
				'), null, null);
				
				applyNewSheet(this.tabheight);
			
			}
		
		break;
		
		case "findb_widthva":
			removeOldSheet(this.findbarwidth);
			
			if(enable==true && this.prefs.getBoolPref('findb_widthcb')){
			
				this.findbarwidth=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					findbar .findbar-textbox{\
					  min-width: '+this.prefs.getIntPref('findb_widthva')+'px !important;\
					  width: '+this.prefs.getIntPref('findb_widthva')+'px !important;\
					  max-width: unset !important;\
					}\
				'), null, null);
				
				applyNewSheet(this.findbarwidth);
			
			}
		
		break;

		case "tabcolor_def":

			removeOldSheet(this.ctabsheet_def);
			
			if(enable==true && this.prefs.getCharPref('tabs')!='tabs_default' && this.prefs.getCharPref('tabs')!='tabs_squared2' && this.prefs.getCharPref('tabs')!='tabs_squared2c2' && this.prefs.getCharPref('tabs')!='tabs_curvedall'){
			
				if (this.prefs.getCharPref('tabs')=='tabs_squared') {
				
					this.ctabsheet_def=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab:not([selected="true"]):not(:hover) {\
						  background-image: linear-gradient('+this.prefs.getCharPref('ctab1')+','+this.prefs.getCharPref('ctab2')+') !important;\
						}\
					'), null, null);
				
				}
				
				else if (this.prefs.getCharPref('tabs')=='tabs_squaredc2') {
				
					this.ctabsheet_def=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab .tab-content {\
						  background-image: linear-gradient('+this.prefs.getCharPref('ctab1')+','+this.prefs.getCharPref('ctab2')+') !important;\
						}\
					'), null, null);
				
				}
		
				else if (this.prefs.getCharPref('tabs')=='tabs_curved') {
				
					this.ctabsheet_def=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab:not(:-moz-lwtheme):not([visuallyselected=true]):not(:hover) .tab-stack .tab-background-middle,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab:not(:-moz-lwtheme):not([visuallyselected=true]):not(:hover) .tab-background-start,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab:not(:-moz-lwtheme):not([visuallyselected=true]):not(:hover) .tab-background-end,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab:-moz-lwtheme:not([visuallyselected=true]):not(:hover) .tab-stack .tab-background-middle,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab:-moz-lwtheme:not([visuallyselected=true]):not(:hover) .tab-background-start,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab:-moz-lwtheme:not([visuallyselected=true]):not(:hover) .tab-background-end{\
						  background-image: linear-gradient(transparent, transparent 2px, '+this.prefs.getCharPref('ctab1')+' 0px, '+this.prefs.getCharPref('ctab2')+'), none !important;\
						}\
						.tabbrowser-tab:-moz-lwtheme:not(:hover) > .tab-stack > .tab-background:not([visuallyselected=true]) {\
						  background-position: left bottom, 30px bottom, right bottom;\
						  background-repeat: no-repeat;\
						  background-size: 30px 100%, calc(100% - (2 * 30px)) 100%, 30px 100%;\
						}\
						.tabbrowser-tab:-moz-lwtheme:not([visuallyselected=true]):not(:hover) .tab-background-start:-moz-locale-dir(ltr),\
						.tabbrowser-tab:-moz-lwtheme:not([visuallyselected=true]):not(:hover) .tab-background-end:-moz-locale-dir(rtl) {\
						  clip-path: url(chrome://browser/content/browser.xul#tab-curve-clip-path-start) !important;\
						}\
						.tabbrowser-tab:-moz-lwtheme:not([visuallyselected=true]):not(:hover) .tab-background-end:-moz-locale-dir(ltr),\
						.tabbrowser-tab:-moz-lwtheme:not([visuallyselected=true]):not(:hover) .tab-background-start:-moz-locale-dir(rtl) {\
						  clip-path: url(chrome://browser/content/browser.xul#tab-curve-clip-path-end) !important;\
						}\
					'), null, null);
				
				}

				applyNewSheet(this.ctabsheet_def);
			}

		break;
		
		case "tabcolor_act":

			removeOldSheet(this.ctabsheet_act);
			
			if(enable==true && this.prefs.getCharPref('tabs')!='tabs_curvedall'){
			
				var tabc_act_tb_sheet = '';
				if (this.prefs.getBoolPref('tabc_act_tb')) {
				
					var tb_color = this.prefs.getCharPref('ctabact2');
					
					if(classicthemerestorerjs.ctr.osstring=="Darwin") {
					  if (Services.prefs.getBranch("extensions.classicthemerestorer.").getCharPref("tabsontop")=='false'
							|| Services.prefs.getBranch("extensions.classicthemerestorer.").getCharPref("tabsontop")=='false2')
						if (this.prefs.getCharPref('tabs')!='tabs_curved')
						  tb_color = this.prefs.getCharPref('ctabact1');
					}
				
					tabc_act_tb_sheet = '\
						#nav-bar{\
						  box-shadow:none !important;\
						  background: none !important;\
						}\
						#navigator-toolbox toolbar:not(#TabsToolbar):not(#toolbar-menubar):not(#puzzleBars-urlbar-bar),\
						#main-window[defaultfxtheme="true"] #ctraddon_urlextrabar:not(:-moz-lwtheme),\
						#browser-bottombox toolbar:not(#developer-toolbar):not(.devtools-tabbar),\
						#main-window[defaultfxtheme="true"] #navigator-toolbox #TabsToolbar[tabsontop=false]:not(:-moz-lwtheme),\
						#main-window[defaultfxtheme="true"][tabsontop=false]:not([tabsintitlebar]):not(:-moz-lwtheme) #toolbar-menubar,\
						#TabsToolbar[tabsontop="false"]{\
						  background-color: '+tb_color+' !important;\
						}\
					';
				}
		
				if (this.prefs.getCharPref('tabs')=='tabs_squared') {
				
					this.ctabsheet_act=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[selected="true"] {\
						  background-image: linear-gradient('+this.prefs.getCharPref('ctabact1')+','+this.prefs.getCharPref('ctabact2')+') !important;\
						}\
						'+tabc_act_tb_sheet+'\
					'), null, null);
				
				}
				
				else if (this.prefs.getCharPref('tabs')=='tabs_squaredc2') {
				
					this.ctabsheet_act=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[selected] .tab-content {\
						  background-image: linear-gradient('+this.prefs.getCharPref('ctabact1')+','+this.prefs.getCharPref('ctabact2')+') !important;\
						}\
						'+tabc_act_tb_sheet+'\
					'), null, null);
				
				}
				
				else if (this.prefs.getCharPref('tabs')=='tabs_squared2') {
				
					this.ctabsheet_act=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[selected="true"] {\
						  background-image: linear-gradient('+this.prefs.getCharPref('ctabact1')+','+this.prefs.getCharPref('ctabact2')+') !important;\
						}\
						'+tabc_act_tb_sheet+'\
					'), null, null);
				
				}
				
				else if (this.prefs.getCharPref('tabs')=='tabs_squared2c2') {
				
					this.ctabsheet_act=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[selected] .tab-content {\
						  background-image: linear-gradient('+this.prefs.getCharPref('ctabact1')+','+this.prefs.getCharPref('ctabact2')+') !important;\
						}\
						'+tabc_act_tb_sheet+'\
					'), null, null);
				
				}
				
				else if (this.prefs.getCharPref('tabs')=='tabs_curved') {
				
					this.ctabsheet_act=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						#main-window[fx51plus="true"] #tabbrowser-tabs::after,\
						#main-window[fx51plus="true"] #tabbrowser-tabs::before,\
						#main-window[fx51plus="true"] .tabbrowser-tab::after,\
						#main-window[fx51plus="true"] .tabbrowser-tab::before {\
						  opacity: 0 !important;\
						}\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-start[selected=true]:-moz-locale-dir(ltr):not(:-moz-lwtheme)::before,\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-end[selected=true]:-moz-locale-dir(rtl):not(:-moz-lwtheme)::before,\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-end[selected=true]:-moz-locale-dir(ltr):not(:-moz-lwtheme)::before,\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-start[selected=true]:-moz-locale-dir(rtl):not(:-moz-lwtheme)::before,\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-start[selected=true]:-moz-lwtheme::before,\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-end[selected=true]:-moz-lwtheme::before {\
						  background-image: unset !important;\
						}\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-start[selected=true]:-moz-locale-dir(ltr):-moz-lwtheme::before,\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-end[selected=true]:-moz-locale-dir(rtl):-moz-lwtheme::before,\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-end[selected=true]:-moz-locale-dir(ltr):-moz-lwtheme::before,\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-start[selected=true]:-moz-locale-dir(rtl):-moz-lwtheme::before {\
						  clip-path: unset !important;\
						}\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-middle[selected=true],\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-middle[selected=true]:-moz-lwtheme {\
						  background-color: unset !important;\
						  background-image: unset !important;\
						}\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-start[selected=true]:-moz-lwtheme::before,\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-end[selected=true]:-moz-lwtheme::before,\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-middle[selected=true]:-moz-lwtheme {\
						  background-color: unset !important;\
						}\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-start[selected=true]:-moz-locale-dir(ltr):not(:-moz-lwtheme)::before,\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-end[selected=true]:-moz-locale-dir(rtl):not(:-moz-lwtheme)::before {\
						  background-image: url(chrome://browser/skin/tabbrowser/tab-stroke-start.png),linear-gradient(transparent, transparent 2px,'+this.prefs.getCharPref('ctabact1')+' 2px, '+this.prefs.getCharPref('ctabact2')+') !important;\
						  clip-path: url(chrome://browser/content/browser.xul#tab-curve-clip-path-start) !important;\
						}\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-end[selected=true]:-moz-locale-dir(ltr):not(:-moz-lwtheme)::before,\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-start[selected=true]:-moz-locale-dir(rtl):not(:-moz-lwtheme)::before {\
						  background-image: url(chrome://browser/skin/tabbrowser/tab-stroke-end.png),linear-gradient(transparent, transparent 2px,'+this.prefs.getCharPref('ctabact1')+' 2px, '+this.prefs.getCharPref('ctabact2')+') !important;\
						  clip-path: url(chrome://browser/content/browser.xul#tab-curve-clip-path-end) !important;\
						}\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-start[selected=true]:-moz-locale-dir(ltr):-moz-lwtheme::before,\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-end[selected=true]:-moz-locale-dir(rtl):-moz-lwtheme::before {\
						  background: url(chrome://browser/skin/tabbrowser/tab-stroke-start.png),linear-gradient(transparent, transparent 2px,'+this.prefs.getCharPref('ctabact1')+' 2px, '+this.prefs.getCharPref('ctabact2')+') !important;\
						  clip-path: url(chrome://browser/content/browser.xul#tab-curve-clip-path-start) !important;\
						}\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-end[selected=true]:-moz-locale-dir(ltr):-moz-lwtheme::before,\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-start[selected=true]:-moz-locale-dir(rtl):-moz-lwtheme::before {\
						  background: url(chrome://browser/skin/tabbrowser/tab-stroke-end.png),linear-gradient(transparent, transparent 2px,'+this.prefs.getCharPref('ctabact1')+' 2px, '+this.prefs.getCharPref('ctabact2')+') !important;\
						  clip-path: url(chrome://browser/content/browser.xul#tab-curve-clip-path-end) !important;\
						}\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-middle[selected=true]:-moz-lwtheme,\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-middle[selected=true]:not(:-moz-lwtheme) {\
						  background-color: transparent !important;\
						  background-image: url(chrome://browser/skin/tabbrowser/tab-active-middle.png),linear-gradient(transparent, transparent 2px,'+this.prefs.getCharPref('ctabact1')+' 2px, '+this.prefs.getCharPref('ctabact2')+'), none !important;\
						}\
						'+tabc_act_tb_sheet+'\
					'), null, null);
				
				}
				
				else if (this.prefs.getCharPref('tabs')=='tabs_default') {
				
					this.ctabsheet_act=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-start[selected=true]:-moz-locale-dir(ltr):not(:-moz-lwtheme)::before,\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-end[selected=true]:-moz-locale-dir(rtl):not(:-moz-lwtheme)::before,\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-end[selected=true]:-moz-locale-dir(ltr):not(:-moz-lwtheme)::before,\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-start[selected=true]:-moz-locale-dir(rtl):not(:-moz-lwtheme)::before,\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-start[selected=true]:-moz-lwtheme::before,\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-end[selected=true]:-moz-lwtheme::before {\
						  background-image: unset !important;\
						}\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-start[selected=true]:-moz-locale-dir(ltr):-moz-lwtheme::before,\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-end[selected=true]:-moz-locale-dir(rtl):-moz-lwtheme::before,\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-end[selected=true]:-moz-locale-dir(ltr):-moz-lwtheme::before,\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-start[selected=true]:-moz-locale-dir(rtl):-moz-lwtheme::before {\
						  clip-path: unset !important;\
						}\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-middle[selected=true],\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-middle[selected=true]:-moz-lwtheme {\
						  background-color: unset !important;\
						  background-image: unset !important;\
						}\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-start[selected=true]:-moz-lwtheme::before,\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-end[selected=true]:-moz-lwtheme::before,\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-middle[selected=true]:-moz-lwtheme {\
						  background-color: unset !important;\
						}\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-start[selected=true]:-moz-locale-dir(ltr):not(:-moz-lwtheme)::before,\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-end[selected=true]:-moz-locale-dir(rtl):not(:-moz-lwtheme)::before {\
						  background-image: url(chrome://browser/skin/tabbrowser/tab-stroke-start.png),linear-gradient(transparent, transparent 2px,'+this.prefs.getCharPref('ctabact1')+' 2px, '+this.prefs.getCharPref('ctabact2')+') !important;\
						  clip-path: url(chrome://browser/content/browser.xul#tab-curve-clip-path-start) !important;\
						}\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-end[selected=true]:-moz-locale-dir(ltr):not(:-moz-lwtheme)::before,\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-start[selected=true]:-moz-locale-dir(rtl):not(:-moz-lwtheme)::before {\
						  background-image: url(chrome://browser/skin/tabbrowser/tab-stroke-end.png),linear-gradient(transparent, transparent 2px,'+this.prefs.getCharPref('ctabact1')+' 2px, '+this.prefs.getCharPref('ctabact2')+') !important;\
						  clip-path: url(chrome://browser/content/browser.xul#tab-curve-clip-path-end) !important;\
						}\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-start[selected=true]:-moz-locale-dir(ltr):-moz-lwtheme::before,\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-end[selected=true]:-moz-locale-dir(rtl):-moz-lwtheme::before {\
						  background: url(chrome://browser/skin/tabbrowser/tab-stroke-start.png),linear-gradient(transparent, transparent 2px,'+this.prefs.getCharPref('ctabact1')+' 2px, '+this.prefs.getCharPref('ctabact2')+') !important;\
						  clip-path: url(chrome://browser/content/browser.xul#tab-curve-clip-path-start) !important;\
						}\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-end[selected=true]:-moz-locale-dir(ltr):-moz-lwtheme::before,\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-start[selected=true]:-moz-locale-dir(rtl):-moz-lwtheme::before {\
						  background: url(chrome://browser/skin/tabbrowser/tab-stroke-end.png),linear-gradient(transparent, transparent 2px,'+this.prefs.getCharPref('ctabact1')+' 2px, '+this.prefs.getCharPref('ctabact2')+') !important;\
						  clip-path: url(chrome://browser/content/browser.xul#tab-curve-clip-path-end) !important;\
						}\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-middle[selected=true]:-moz-lwtheme,\
						#main-window #navigator-toolbox #TabsToolbar .tab-background-middle[selected=true]:not(:-moz-lwtheme) {\
						  background-color: transparent !important;\
						  background-image: url(chrome://browser/skin/tabbrowser/tab-active-middle.png),linear-gradient(transparent, transparent 2px,'+this.prefs.getCharPref('ctabact1')+' 2px, '+this.prefs.getCharPref('ctabact2')+'), none !important;\
						}\
						'+tabc_act_tb_sheet+'\
					'), null, null);
				
				}
				
				applyNewSheet(this.ctabsheet_act);
			}

		break;

		case "tabcolor_hov":

			removeOldSheet(this.ctabsheet_hov);
			
			if(enable==true && this.prefs.getCharPref('tabs')!='tabs_default' && this.prefs.getCharPref('tabs')!='tabs_squared2' && this.prefs.getCharPref('tabs')!='tabs_squared2c2' && this.prefs.getCharPref('tabs')!='tabs_curvedall'){
		
				if (this.prefs.getCharPref('tabs')=='tabs_squared') {
				
					this.ctabsheet_hov=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab:not([selected="true"]):hover {\
						  background-image: linear-gradient('+this.prefs.getCharPref('ctabhov1')+','+this.prefs.getCharPref('ctabhov2')+') !important;\
						}\
					'), null, null);
				
				}
				
				else if (this.prefs.getCharPref('tabs')=='tabs_squaredc2') {
				
					this.ctabsheet_hov=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab:not([selected]):hover .tab-content {\
						  background-image: linear-gradient('+this.prefs.getCharPref('ctabhov1')+','+this.prefs.getCharPref('ctabhov2')+') !important;\
						}\
					'), null, null);
				
				}
							
				else if (this.prefs.getCharPref('tabs')=='tabs_curved') {
				
					this.ctabsheet_hov=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab:not(:-moz-lwtheme):not([visuallyselected=true]):hover .tab-stack .tab-background-middle,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab:not(:-moz-lwtheme):not([visuallyselected=true]):hover .tab-background-start,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab:not(:-moz-lwtheme):not([visuallyselected=true]):hover .tab-background-end,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab:-moz-lwtheme:not([visuallyselected=true]):hover .tab-stack .tab-background-middle,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab:-moz-lwtheme:not([visuallyselected=true]):hover .tab-background-start,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab:-moz-lwtheme:not([visuallyselected=true]):hover .tab-background-end {\
						  background-image: linear-gradient(transparent, transparent 2px, '+this.prefs.getCharPref('ctabhov1')+' 0px, '+this.prefs.getCharPref('ctabhov2')+'), none !important;\
						}\
						.tabbrowser-tab:-moz-lwtheme:hover > .tab-stack > .tab-background:not([visuallyselected=true]){\
						  background-position: left bottom, 30px bottom, right bottom;\
						  background-repeat: no-repeat;\
						  background-size: 30px 100%, calc(100% - (2 * 30px)) 100%, 30px 100%;\
						}\
						.tabbrowser-tab:-moz-lwtheme:not([visuallyselected=true]):hover .tab-background-start:-moz-locale-dir(ltr),\
						.tabbrowser-tab:-moz-lwtheme:not([visuallyselected=true]):hover .tab-background-end:-moz-locale-dir(rtl) {\
						  clip-path: url(chrome://browser/content/browser.xul#tab-curve-clip-path-start) !important;\
						}\
						.tabbrowser-tab:-moz-lwtheme:not([visuallyselected=true]):hover .tab-background-end:-moz-locale-dir(ltr),\
						.tabbrowser-tab:-moz-lwtheme:not([visuallyselected=true]):hover .tab-background-start:-moz-locale-dir(rtl) {\
						  clip-path: url(chrome://browser/content/browser.xul#tab-curve-clip-path-end) !important;\
						}\
					'), null, null);
				
				}

				applyNewSheet(this.ctabsheet_hov);
			}

		break;
		
		case "tabcolor_pen":

			removeOldSheet(this.ctabsheet_pen);
			
			if(enable==true && this.prefs.getCharPref('tabs')!='tabs_default' && this.prefs.getCharPref('tabs')!='tabs_squared2' && this.prefs.getCharPref('tabs')!='tabs_squared2c2' && this.prefs.getCharPref('tabs')!='tabs_curvedall'){
		
				if (this.prefs.getCharPref('tabs')=='tabs_squared') {
				
				  if(this.prefs.getBoolPref('tabc_hov_unl')){
				
					this.ctabsheet_pen=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[pending]:not([selected="true"]):hover,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[pending]:not([selected="true"]):not(:hover) {\
						  background-image: linear-gradient('+this.prefs.getCharPref('ctabpen1')+','+this.prefs.getCharPref('ctabpen2')+') !important;\
						}\
					'), null, null);
				  } else {
					this.ctabsheet_pen=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[pending]:not([selected="true"]):not(:hover) {\
						  background-image: linear-gradient('+this.prefs.getCharPref('ctabpen1')+','+this.prefs.getCharPref('ctabpen2')+') !important;\
						}\
					'), null, null);
				  }
				
				}
				
				else if (this.prefs.getCharPref('tabs')=='tabs_squaredc2') {
				
				  if(this.prefs.getBoolPref('tabc_hov_unl')){
				
					this.ctabsheet_pen=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[pending]:not([selected="true"]):hover .tab-content,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[pending]:not([selected="true"]):not(:hover) .tab-content {\
						  background-image: linear-gradient('+this.prefs.getCharPref('ctabpen1')+','+this.prefs.getCharPref('ctabpen2')+') !important;\
						}\
					'), null, null);
					
				  } else {
					this.ctabsheet_pen=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[pending]:not([selected="true"]):not(:hover) .tab-content {\
						  background-image: linear-gradient('+this.prefs.getCharPref('ctabpen1')+','+this.prefs.getCharPref('ctabpen2')+') !important;\
						}\
					'), null, null);
				  }
				
				}
				
				else if (this.prefs.getCharPref('tabs')=='tabs_curved') {
				
				  if(this.prefs.getBoolPref('tabc_hov_unl')){
				
					this.ctabsheet_pen=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[pending]:not(:-moz-lwtheme):not([visuallyselected=true]):not(:hover) .tab-stack .tab-background-middle,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[pending]:not(:-moz-lwtheme):not([visuallyselected=true]):not(:hover) .tab-background-start,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[pending]:not(:-moz-lwtheme):not([visuallyselected=true]):not(:hover) .tab-background-end,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[pending]:-moz-lwtheme:not([visuallyselected=true]):not(:hover) .tab-stack .tab-background-middle,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[pending]:-moz-lwtheme:not([visuallyselected=true]):not(:hover) .tab-background-start,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[pending]:-moz-lwtheme:not([visuallyselected=true]):not(:hover) .tab-background-end,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[pending]:not(:-moz-lwtheme):not([visuallyselected=true]):hover .tab-stack .tab-background-middle,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[pending]:not(:-moz-lwtheme):not([visuallyselected=true]):hover .tab-background-start,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[pending]:not(:-moz-lwtheme):not([visuallyselected=true]):hover .tab-background-end,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[pending]:-moz-lwtheme:not([visuallyselected=true]):hover .tab-stack .tab-background-middle,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[pending]:-moz-lwtheme:not([visuallyselected=true]):hover .tab-background-start,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[pending]:-moz-lwtheme:not([visuallyselected=true]):hover .tab-background-end{\
						  background-image: linear-gradient(transparent, transparent 2px, '+this.prefs.getCharPref('ctabpen1')+' 0px, '+this.prefs.getCharPref('ctabpen2')+'), none !important;\
						}\
						.tabbrowser-tab[pending]:not(:-moz-lwtheme):not([visuallyselected=true]):hover > .tab-stack > .tab-background:not([visuallyselected=true]),\
						.tabbrowser-tab[pending]:not(:-moz-lwtheme):not([visuallyselected=true]):not(:hover) > .tab-stack > .tab-background:not([visuallyselected=true]){\
						  background-position: left bottom, 30px bottom, right bottom;\
						  background-repeat: no-repeat;\
						  background-size: 30px 100%, calc(100% - (2 * 30px)) 100%, 30px 100%;\
						}\
						.tabbrowser-tab[pending]:not(:-moz-lwtheme):not([visuallyselected=true]):hover .tab-background-start:-moz-locale-dir(ltr),\
						.tabbrowser-tab[pending]:not(:-moz-lwtheme):not([visuallyselected=true]):hover .tab-background-end:-moz-locale-dir(rtl),\
						.tabbrowser-tab[pending]:not(:-moz-lwtheme):not([visuallyselected=true]):not(:hover) .tab-background-start:-moz-locale-dir(ltr),\
						.tabbrowser-tab[pending]:not(:-moz-lwtheme):not([visuallyselected=true]):not(:hover) .tab-background-end:-moz-locale-dir(rtl) {\
						  clip-path: url(chrome://browser/content/browser.xul#tab-curve-clip-path-start) !important;\
						}\
						.tabbrowser-tab[pending]:not(:-moz-lwtheme):not([visuallyselected=true]):hover .tab-background-end:-moz-locale-dir(ltr),\
						.tabbrowser-tab[pending]:not(:-moz-lwtheme):not([visuallyselected=true]):hover .tab-background-start:-moz-locale-dir(rtl),\
						.tabbrowser-tab[pending]:not(:-moz-lwtheme):not([visuallyselected=true]):not(:hover) .tab-background-end:-moz-locale-dir(ltr),\
						.tabbrowser-tab[pending]:not(:-moz-lwtheme):not([visuallyselected=true]):not(:hover) .tab-background-start:-moz-locale-dir(rtl) {\
						  clip-path: url(chrome://browser/content/browser.xul#tab-curve-clip-path-end) !important;\
						}\
					'), null, null);
					
				  } else {
					this.ctabsheet_pen=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[pending]:not(:-moz-lwtheme):not([visuallyselected=true]):not(:hover) .tab-stack .tab-background-middle,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[pending]:not(:-moz-lwtheme):not([visuallyselected=true]):not(:hover) .tab-background-start,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[pending]:not(:-moz-lwtheme):not([visuallyselected=true]):not(:hover) .tab-background-end,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[pending]:-moz-lwtheme:not([visuallyselected=true]):not(:hover) .tab-stack .tab-background-middle,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[pending]:-moz-lwtheme:not([visuallyselected=true]):not(:hover) .tab-background-start,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[pending]:-moz-lwtheme:not([visuallyselected=true]):not(:hover) .tab-background-end {\
						  background-image: linear-gradient(transparent, transparent 2px, '+this.prefs.getCharPref('ctabpen1')+' 0px, '+this.prefs.getCharPref('ctabpen2')+'), none !important;\
						}\
						.tabbrowser-tab[pending]:not(:-moz-lwtheme):not([visuallyselected=true]):not(:hover) > .tab-stack > .tab-background:not([visuallyselected=true]){\
						  background-position: left bottom, 30px bottom, right bottom;\
						  background-repeat: no-repeat;\
						  background-size: 30px 100%, calc(100% - (2 * 30px)) 100%, 30px 100%;\
						}\
						.tabbrowser-tab[pending]:not(:-moz-lwtheme):not([visuallyselected=true]):not(:hover) .tab-background-start:-moz-locale-dir(ltr),\
						.tabbrowser-tab[pending]:not(:-moz-lwtheme):not([visuallyselected=true]):not(:hover) .tab-background-end:-moz-locale-dir(rtl) {\
						  clip-path: url(chrome://browser/content/browser.xul#tab-curve-clip-path-start) !important;\
						}\
						.tabbrowser-tab[pending]:not(:-moz-lwtheme):not([visuallyselected=true]):not(:hover) .tab-background-end:-moz-locale-dir(ltr),\
						.tabbrowser-tab[pending]:not(:-moz-lwtheme):not([visuallyselected=true]):not(:hover) .tab-background-start:-moz-locale-dir(rtl) {\
						  clip-path: url(chrome://browser/content/browser.xul#tab-curve-clip-path-end) !important;\
						}\
					'), null, null);
				  }
				
				}
				
				applyNewSheet(this.ctabsheet_pen);
			}

		break;

		case "tabcolor_unr":

			removeOldSheet(this.ctabsheet_unr);
			
			if(enable==true && this.prefs.getCharPref('tabs')!='tabs_default' && this.prefs.getCharPref('tabs')!='tabs_squared2' && this.prefs.getCharPref('tabs')!='tabs_squared2c2' && this.prefs.getCharPref('tabs')!='tabs_curvedall'){
		
				if (this.prefs.getCharPref('tabs')=='tabs_squared') {
				
				  if(this.prefs.getBoolPref('tabc_hov_unr')){
				
					this.ctabsheet_unr=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[unread]:not([selected="true"]):hover,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[unread]:not([selected="true"]):not(:hover) {\
						  background-image: linear-gradient('+this.prefs.getCharPref('ctabunr1')+','+this.prefs.getCharPref('ctabunr2')+') !important;\
						}\
					'), null, null);
					
				  } else {
				
					this.ctabsheet_unr=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[unread]:not([selected="true"]):not(:hover) {\
						  background-image: linear-gradient('+this.prefs.getCharPref('ctabunr1')+','+this.prefs.getCharPref('ctabunr2')+') !important;\
						}\
					'), null, null);
					
				  }
				
				}
				
				else if (this.prefs.getCharPref('tabs')=='tabs_squaredc2') {
				
				  if(this.prefs.getBoolPref('tabc_hov_unr')){
				
					this.ctabsheet_unr=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[unread]:not([selected="true"]):hover .tab-content,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[unread]:not([selected="true"]):not(:hover) .tab-content {\
						  background-image: linear-gradient('+this.prefs.getCharPref('ctabunr1')+','+this.prefs.getCharPref('ctabunr2')+') !important;\
						}\
					'), null, null);
					
				  } else {
				
					this.ctabsheet_unr=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[unread]:not([selected="true"]):not(:hover) .tab-content {\
						  background-image: linear-gradient('+this.prefs.getCharPref('ctabunr1')+','+this.prefs.getCharPref('ctabunr2')+') !important;\
						}\
					'), null, null);
					
				  }
				
				}
				
				else if (this.prefs.getCharPref('tabs')=='tabs_curved') {
				
				  if(this.prefs.getBoolPref('tabc_hov_unr')){
				
					this.ctabsheet_unr=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[unread]:not(:-moz-lwtheme):not([visuallyselected=true]):not(:hover) .tab-stack .tab-background-middle,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[unread]:not(:-moz-lwtheme):not([visuallyselected=true]):not(:hover) .tab-background-start,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[unread]:not(:-moz-lwtheme):not([visuallyselected=true]):not(:hover) .tab-background-end,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[unread]:-moz-lwtheme:not([visuallyselected=true]):not(:hover) .tab-stack .tab-background-middle,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[unread]:-moz-lwtheme:not([visuallyselected=true]):not(:hover) .tab-background-start,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[unread]:-moz-lwtheme:not([visuallyselected=true]):not(:hover) .tab-background-end,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[unread]:not(:-moz-lwtheme):not([visuallyselected=true]):hover .tab-stack .tab-background-middle,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[unread]:not(:-moz-lwtheme):not([visuallyselected=true]):hover .tab-background-start,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[unread]:not(:-moz-lwtheme):not([visuallyselected=true]):hover .tab-background-end,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[unread]:-moz-lwtheme:not([visuallyselected=true]):hover .tab-stack .tab-background-middle,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[unread]:-moz-lwtheme:not([visuallyselected=true]):hover .tab-background-start,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[unread]:-moz-lwtheme:not([visuallyselected=true]):hover .tab-background-end {\
						  background-image: linear-gradient(transparent, transparent 2px, '+this.prefs.getCharPref('ctabunr1')+' 0px, '+this.prefs.getCharPref('ctabunr2')+'), none !important;\
						}\
						.tabbrowser-tab[unread]:-moz-lwtheme:not([visuallyselected=true]):hover > .tab-stack > .tab-background:not([visuallyselected=true]),\
						.tabbrowser-tab[unread]:-moz-lwtheme:not([visuallyselected=true]):not(:hover) > .tab-stack > .tab-background:not([visuallyselected=true]){\
						  background-position: left bottom, 30px bottom, right bottom;\
						  background-repeat: no-repeat;\
						  background-size: 30px 100%, calc(100% - (2 * 30px)) 100%, 30px 100%;\
						}\
						.tabbrowser-tab[unread]:-moz-lwtheme:not([visuallyselected=true]):hover .tab-background-start:-moz-locale-dir(ltr),\
						.tabbrowser-tab[unread]:-moz-lwtheme:not([visuallyselected=true]):hover .tab-background-end:-moz-locale-dir(rtl),\
						.tabbrowser-tab[unread]:-moz-lwtheme:not([visuallyselected=true]):not(:hover) .tab-background-start:-moz-locale-dir(ltr),\
						.tabbrowser-tab[unread]:-moz-lwtheme:not([visuallyselected=true]):not(:hover) .tab-background-end:-moz-locale-dir(rtl) {\
						  clip-path: url(chrome://browser/content/browser.xul#tab-curve-clip-path-start) !important;\
						}\
						.tabbrowser-tab[unread]:-moz-lwtheme:not([visuallyselected=true]):hover .tab-background-end:-moz-locale-dir(ltr),\
						.tabbrowser-tab[unread]:-moz-lwtheme:not([visuallyselected=true]):hover .tab-background-start:-moz-locale-dir(rtl),\
						.tabbrowser-tab[unread]:-moz-lwtheme:not([visuallyselected=true]):not(:hover) .tab-background-end:-moz-locale-dir(ltr),\
						.tabbrowser-tab[unread]:-moz-lwtheme:not([visuallyselected=true]):not(:hover) .tab-background-start:-moz-locale-dir(rtl) {\
						  clip-path: url(chrome://browser/content/browser.xul#tab-curve-clip-path-end) !important;\
						}\
					'), null, null);
					
				  } else {
				
					this.ctabsheet_unr=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[unread]:not(:-moz-lwtheme):not([visuallyselected=true]):not(:hover) .tab-stack .tab-background-middle,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[unread]:not(:-moz-lwtheme):not([visuallyselected=true]):not(:hover) .tab-background-start,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[unread]:not(:-moz-lwtheme):not([visuallyselected=true]):not(:hover) .tab-background-end,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[unread]:-moz-lwtheme:not([visuallyselected=true]):not(:hover) .tab-stack .tab-background-middle,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[unread]:-moz-lwtheme:not([visuallyselected=true]):not(:hover) .tab-background-start,\
						#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[unread]:-moz-lwtheme:not([visuallyselected=true]):not(:hover) .tab-background-end{\
						  background-image: linear-gradient(transparent, transparent 2px, '+this.prefs.getCharPref('ctabunr1')+' 0px, '+this.prefs.getCharPref('ctabunr2')+'), none !important;\
						}\
						.tabbrowser-tab[unread]:-moz-lwtheme:not([visuallyselected=true]):not(:hover) > .tab-stack > .tab-background:not([visuallyselected=true]){\
						  background-position: left bottom, 30px bottom, right bottom;\
						  background-repeat: no-repeat;\
						  background-size: 30px 100%, calc(100% - (2 * 30px)) 100%, 30px 100%;\
						}\
						.tabbrowser-tab[unread]:-moz-lwtheme:not([visuallyselected=true]):not(:hover) .tab-background-start:-moz-locale-dir(ltr),\
						.tabbrowser-tab[unread]:-moz-lwtheme:not([visuallyselected=true]):not(:hover) .tab-background-end:-moz-locale-dir(rtl) {\
						  clip-path: url(chrome://browser/content/browser.xul#tab-curve-clip-path-start) !important;\
						}\
						.tabbrowser-tab[unread]:-moz-lwtheme:not([visuallyselected=true]):not(:hover) .tab-background-end:-moz-locale-dir(ltr),\
						.tabbrowser-tab[unread]:-moz-lwtheme:not([visuallyselected=true]):not(:hover) .tab-background-start:-moz-locale-dir(rtl) {\
						  clip-path: url(chrome://browser/content/browser.xul#tab-curve-clip-path-end) !important;\
						}\
					'), null, null);
					
				  }
				
				}
				
				applyNewSheet(this.ctabsheet_unr);
			}

		break;

		case "ntabcolor_def":

			removeOldSheet(this.cntabsheet_def);
			
			if(enable==true && this.prefs.getCharPref('tabs')!='tabs_default' && this.prefs.getCharPref('tabs')!='tabs_squared2' && this.prefs.getCharPref('tabs')!='tabs_squared2c2' && this.prefs.getCharPref('tabs')!='tabs_curved' && this.prefs.getCharPref('tabs')!='tabs_curvedall'){
		
				if (this.prefs.getCharPref('tabs')=='tabs_squared') {
				
					this.cntabsheet_def=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						#main-window #navigator-toolbox #TabsToolbar .tabs-newtab-button {\
						  background-image: linear-gradient('+this.prefs.getCharPref('cntab1')+','+this.prefs.getCharPref('cntab2')+') !important;\
						}\
					'), null, null);
				
				}
				
				else if (this.prefs.getCharPref('tabs')=='tabs_squaredc2') {
				
					this.cntabsheet_def=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						#main-window #navigator-toolbox #TabsToolbar .tabs-newtab-button {\
						  background-image: linear-gradient('+this.prefs.getCharPref('cntab1')+','+this.prefs.getCharPref('cntab2')+') !important;\
						}\
					'), null, null);
				
				}

				applyNewSheet(this.cntabsheet_def);
			}

		break;
		
		case "ntabcolor_hov":

			removeOldSheet(this.cntabsheet_hov);
			
			if(enable==true && this.prefs.getCharPref('tabs')!='tabs_default' && this.prefs.getCharPref('tabs')!='tabs_squared2' && this.prefs.getCharPref('tabs')!='tabs_squared2c2' && this.prefs.getCharPref('tabs')!='tabs_curved' && this.prefs.getCharPref('tabs')!='tabs_curvedall'){
		
				if (this.prefs.getCharPref('tabs')=='tabs_squared') {
				
					this.cntabsheet_hov=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						#main-window #navigator-toolbox #TabsToolbar .tabs-newtab-button:hover {\
						  background-image: linear-gradient('+this.prefs.getCharPref('cntabhov1')+','+this.prefs.getCharPref('cntabhov2')+') !important;\
						}\
					'), null, null);
				
				}
				
				else if (this.prefs.getCharPref('tabs')=='tabs_squaredc2') {
				
					this.cntabsheet_hov=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						#main-window #navigator-toolbox #TabsToolbar .tabs-newtab-button:hover {\
						  background-image: linear-gradient('+this.prefs.getCharPref('cntabhov1')+','+this.prefs.getCharPref('cntabhov2')+') !important;\
						}\
					'), null, null);
				
				}

				applyNewSheet(this.cntabsheet_hov);
			}

		break;
		
		case "tabtextc_def":

			removeOldSheet(this.tabtxtcsheet_def);
			
			if(enable==true){
	
				this.tabtxtcsheet_def=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab:not([selected="true"]):not(:hover) .tab-label {\
					  color: '+this.prefs.getCharPref('ctabt')+' !important;\
					}\
				'), null, null);

				applyNewSheet(this.tabtxtcsheet_def);
			}

		break;
		
		case "tabtextc_act":

			removeOldSheet(this.tabtxtcsheet_act);
			
			if(enable==true){
	
				this.tabtxtcsheet_act=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[selected="true"] .tab-label {\
					  color: '+this.prefs.getCharPref('ctabactt')+' !important;\
					}\
				'), null, null);

				applyNewSheet(this.tabtxtcsheet_act);
			}

		break;
		
		case "tabtextc_hov":

			removeOldSheet(this.tabtxtcsheet_hov);
			
			if(enable==true){
	
				this.tabtxtcsheet_hov=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab:not([selected="true"]):hover .tab-label {\
					  color: '+this.prefs.getCharPref('ctabhovt')+' !important;\
					}\
				'), null, null);

				applyNewSheet(this.tabtxtcsheet_hov);
			}

		break;
		
		case "tabtextc_pen":

			removeOldSheet(this.tabtxtcsheet_pen);
			
			if(enable==true){
			
			  if(this.prefs.getBoolPref('tabc_hov_unl')){
	
				this.tabtxtcsheet_pen=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[pending]:not([selected="true"]):hover .tab-label,\
					#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[pending]:not([selected="true"]):not(:hover) .tab-label {\
					  color: '+this.prefs.getCharPref('ctabpent')+' !important;\
					}\
				'), null, null);
				
			  } else {
				this.tabtxtcsheet_pen=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[pending]:not([selected="true"]):not(:hover) .tab-label {\
					  color: '+this.prefs.getCharPref('ctabpent')+' !important;\
					}\
				'), null, null);
			  }

			  applyNewSheet(this.tabtxtcsheet_pen);
			}

		break;
		
		case "tabtextc_unr":

			removeOldSheet(this.tabtxtcsheet_unr);
			
			if(enable==true){
			
			  if(this.prefs.getBoolPref('tabc_hov_unr')){
	
				this.tabtxtcsheet_unr=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[unread]:not([selected="true"]):hover .tab-label,\
					#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[unread]:not([selected="true"]):not(:hover) .tab-label {\
					  color: '+this.prefs.getCharPref('ctabunrt')+' !important;\
					}\
				'), null, null);
				
			  } else {
	
				this.tabtxtcsheet_unr=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[unread]:not([selected="true"]):not(:hover) .tab-label {\
					  color: '+this.prefs.getCharPref('ctabunrt')+' !important;\
					}\
				'), null, null);
				
			  }

			  applyNewSheet(this.tabtxtcsheet_unr);
			}

		break;
		
		case "tabtextsh_def":

			removeOldSheet(this.tabtxtshsheet_def);
			
			if(enable==true){
				
				this.tabtxtshsheet_def=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab:not([selected="true"]):not(:hover) .tab-label {\
					  text-shadow: 0px 1px 0px '+this.prefs.getCharPref('ctabtsh')+',0px 1px 4px '+this.prefs.getCharPref('ctabtsh')+' !important;\
					}\
				'), null, null);

				applyNewSheet(this.tabtxtshsheet_def);
			}

		break;
		
		case "tabtextsh_act":

			removeOldSheet(this.tabtxtshsheet_act);
			
			if(enable==true){
				
				this.tabtxtshsheet_act=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[selected="true"] .tab-label {\
					  text-shadow: 0px 1px 0px '+this.prefs.getCharPref('ctabacttsh')+',0px 1px 4px '+this.prefs.getCharPref('ctabacttsh')+' !important;\
					}\
				'), null, null);

				applyNewSheet(this.tabtxtshsheet_act);
			}

		break;
		
		case "tabtextsh_hov":

			removeOldSheet(this.tabtxtshsheet_hov);
			
			if(enable==true){
				
				this.tabtxtshsheet_hov=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab:not([selected="true"]):hover .tab-label {\
					  text-shadow: 0px 1px 0px '+this.prefs.getCharPref('ctabhovtsh')+',0px 1px 4px '+this.prefs.getCharPref('ctabhovtsh')+' !important;\
					}\
				'), null, null);

				applyNewSheet(this.tabtxtshsheet_hov);
			}

		break;
		
		case "tabtextsh_pen":

			removeOldSheet(this.tabtxtshsheet_pen);
			
			if(enable==true){
			
			  if(this.prefs.getBoolPref('tabc_hov_unl')){
			
				this.tabtxtshsheet_pen=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[pending]:not([selected="true"]):hover .tab-label,\
					#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[pending]:not([selected="true"]):not(:hover) .tab-label {\
					  text-shadow: 0px 1px 0px '+this.prefs.getCharPref('ctabpentsh')+',0px 1px 4px '+this.prefs.getCharPref('ctabpentsh')+' !important;\
					}\
				'), null, null);
				
			  } else {
			  
				this.tabtxtshsheet_pen=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[pending]:not([selected="true"]):not(:hover) .tab-label {\
					  text-shadow: 0px 1px 0px '+this.prefs.getCharPref('ctabpentsh')+',0px 1px 4px '+this.prefs.getCharPref('ctabpentsh')+' !important;\
					}\
				'), null, null);
				
			  }

			  applyNewSheet(this.tabtxtshsheet_pen);
			}

		break;
		
		case "tabtextsh_unr":

			removeOldSheet(this.tabtxtshsheet_unr);
			
			if(enable==true){
			
			  if(this.prefs.getBoolPref('tabc_hov_unr')){
				
				this.tabtxtshsheet_unr=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[unread]:not([selected="true"]):hover .tab-label,\
					#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[unread]:not([selected="true"]):not(:hover) .tab-label {\
					  text-shadow: 0px 1px 0px '+this.prefs.getCharPref('ctabunrtsh')+',0px 1px 4px '+this.prefs.getCharPref('ctabunrtsh')+' !important;\
					}\
				'), null, null);
			
			  } else {
			  
				this.tabtxtshsheet_unr=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					#main-window #navigator-toolbox #TabsToolbar .tabbrowser-tab[unread]:not([selected="true"]):not(:hover) .tab-label {\
					  text-shadow: 0px 1px 0px '+this.prefs.getCharPref('ctabunrtsh')+',0px 1px 4px '+this.prefs.getCharPref('ctabunrtsh')+' !important;\
					}\
				'), null, null);
				
			  }

			  applyNewSheet(this.tabtxtshsheet_unr);
			}

		break;
		
		case "tabfbold_def":
		
			removeOldSheet(this.tabboldsheet_def);
			
			if(enable==true){
				
				this.tabboldsheet_def=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					.tabbrowser-tab:not([selected=true]):not(:hover):not([pending]):not([unread]) .tab-label {\
					  font-weight: bold !important;\
					}\
				'), null, null);

				applyNewSheet(this.tabboldsheet_def);
			}
		
		break;

		case "tabfbold_act":

			removeOldSheet(this.tabboldsheet_act);
			
			if(enable==true){
				
				this.tabboldsheet_act=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					.tabbrowser-tab[selected=true] .tab-label {\
					  font-weight: bold !important;\
					}\
				'), null, null);

				applyNewSheet(this.tabboldsheet_act);
			}

		break;
		
		case "tabfbold_hov":

			removeOldSheet(this.tabboldsheet_hov);
			
			if(enable==true){
				
				if(this.prefs.getBoolPref('tabc_hov_unr') && this.prefs.getBoolPref('tabc_hov_unl')){
					
					this.tabboldsheet_hov=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						.tabbrowser-tab:not([selected=true]):not([pending]):not([unread]):hover .tab-label {\
						  font-weight: bold !important;\
						}\
					'), null, null);

				} else if(this.prefs.getBoolPref('tabc_hov_unr')){
					
					this.tabboldsheet_hov=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						.tabbrowser-tab:not([selected=true]):not([unread]):hover .tab-label {\
						  font-weight: bold !important;\
						}\
					'), null, null);

				} else if(this.prefs.getBoolPref('tabc_hov_unl')){
					
					this.tabboldsheet_hov=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						.tabbrowser-tab:not([selected=true]):not([pending]):hover .tab-label {\
						  font-weight: bold !important;\
						}\
					'), null, null);

				} else {
				
					this.tabboldsheet_hov=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						.tabbrowser-tab:not([selected=true]):hover .tab-label {\
						  font-weight: bold !important;\
						}\
					'), null, null);
				}

				applyNewSheet(this.tabboldsheet_hov);
			}

		break;
		
		case "tabfbold_pen":

			removeOldSheet(this.tabboldsheet_pen);
			
			if(enable==true){
			
			  if(this.prefs.getBoolPref('tabc_hov_unr')){

				this.tabboldsheet_pen=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					.tabbrowser-tab[pending]:not([selected=true]):hover .tab-label,\
					.tabbrowser-tab[pending]:not([selected=true]):not(:hover) .tab-label {\
					  font-weight: bold !important;\
					}\
				'), null, null);

			  } else {

				this.tabboldsheet_pen=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					.tabbrowser-tab[pending]:not([selected=true]):not(:hover) .tab-label {\
					  font-weight: bold !important;\
					}\
				'), null, null);

			  }

			  applyNewSheet(this.tabboldsheet_pen);
			}

		break;
		
		case "tabfbold_unr":
	
			removeOldSheet(this.tabboldsheet_unr);
			
			if(enable==true){
			
			  if(this.prefs.getBoolPref('tabc_hov_unr')){

				this.tabboldsheet_unr=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					.tabbrowser-tab[unread]:not([selected=true]):hover .tab-label,\
					.tabbrowser-tab[unread]:not([selected=true]):not(:hover) .tab-label {\
					  font-weight: bold !important;\
					}\
				'), null, null);

			  } else {

				this.tabboldsheet_unr=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					.tabbrowser-tab[unread]:not([selected=true]):not(:hover) .tab-label {\
					  font-weight: bold !important;\
					}\
				'), null, null);

			  }

			  applyNewSheet(this.tabboldsheet_unr);
			}

		break;
		
		case "tabfita_def":
		
			removeOldSheet(this.tabitasheet_def);
			
			if(enable==true){
				
				this.tabitasheet_def=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					.tabbrowser-tab:not([selected=true]):not(:hover):not([pending]):not([unread]) .tab-label {\
					  font-style: italic !important;\
					}\
				'), null, null);

				applyNewSheet(this.tabitasheet_def);
			}
		
		break;

		case "tabfita_act":

			removeOldSheet(this.tabitasheet_act);
			
			if(enable==true){
				
				this.tabitasheet_act=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					.tabbrowser-tab[selected=true] .tab-label {\
					  font-style: italic !important;\
					}\
				'), null, null);

				applyNewSheet(this.tabitasheet_act);
			}

		break;
		
		case "tabfita_hov":

			removeOldSheet(this.tabitasheet_hov);
			
			if(enable==true){
				
				if(this.prefs.getBoolPref('tabc_hov_unr') && this.prefs.getBoolPref('tabc_hov_unl')){
					this.tabitasheet_hov=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						.tabbrowser-tab:not([selected=true]):not([pending]):not([unread]):hover .tab-label {\
						  font-style: italic !important;\
						}\
					'), null, null);
				} else if(this.prefs.getBoolPref('tabc_hov_unr')){
					this.tabitasheet_hov=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						.tabbrowser-tab:not([selected=true]):not([unread]):hover .tab-label {\
						  font-style: italic !important;\
						}\
					'), null, null);
				} else if(this.prefs.getBoolPref('tabc_hov_unl')){
					this.tabitasheet_hov=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						.tabbrowser-tab:not([selected=true]):not([pending]):hover .tab-label {\
						  font-style: italic !important;\
						}\
					'), null, null);
				} else {
					this.tabitasheet_hov=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						.tabbrowser-tab:not([selected=true]):hover .tab-label {\
						  font-style: italic !important;\
						}\
					'), null, null);
				}

				applyNewSheet(this.tabitasheet_hov);
			}

		break;
		
		case "tabfita_pen":

			removeOldSheet(this.tabitasheet_pen);
			
			if(enable==true){
			
			  if(this.prefs.getBoolPref('tabc_hov_unr')){

				this.tabitasheet_pen=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					.tabbrowser-tab[pending]:not([selected=true]):hover .tab-label,\
					.tabbrowser-tab[pending]:not([selected=true]):not(:hover) .tab-label {\
					  font-style: italic !important;\
					}\
				'), null, null);

			  } else {

				this.tabitasheet_pen=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					.tabbrowser-tab[pending]:not([selected=true]):not(:hover) .tab-label {\
					  font-style: italic !important;\
					}\
				'), null, null);

			  }

			  applyNewSheet(this.tabitasheet_pen);
			}

		break;
		
		case "tabfita_unr":
	
			removeOldSheet(this.tabitasheet_unr);
			
			if(enable==true){
			
			  if(this.prefs.getBoolPref('tabc_hov_unr')){

				this.tabitasheet_unr=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					.tabbrowser-tab[unread]:not([selected=true]):hover .tab-label,\
					.tabbrowser-tab[unread]:not([selected=true]):not(:hover) .tab-label {\
					  font-style: italic !important;\
					}\
				'), null, null);

			  } else {

				this.tabitasheet_unr=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					.tabbrowser-tab[unread]:not([selected=true]):not(:hover) .tab-label {\
					  font-style: italic !important;\
					}\
				'), null, null);

			  }

			  applyNewSheet(this.tabitasheet_unr);
			}

		break;
	
		case "tablowopa_pen":

			removeOldSheet(this.tablowsheet_pen);
			
			if(enable==true){
				
				this.tablowsheet_pen=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					.tabbrowser-tab[pending] {\
					  opacity: 0.6 !important;\
					}\
				'), null, null);

				applyNewSheet(this.tablowsheet_pen);
			}

		break;
		
		case "tablowopa_unr":

			removeOldSheet(this.tablowopa_unr);
			
			if(enable==true){
				
				this.tablowopa_unr=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					.tabbrowser-tab[unread] {\
					  opacity: 0.6 !important;\
					}\
				'), null, null);

				applyNewSheet(this.tablowopa_unr);
			}

		break;
		
		case "lb_width":
			removeOldSheet(this.locationbarsize);
			
			if(enable==true && this.prefs.getBoolPref('lb_width')){
		
				this.locationbarsize=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					#urlbar-container {\
					  min-width: '+this.prefs.getIntPref('lbsize_minw')+'px !important;\
					  max-width: '+this.prefs.getIntPref('lbsize_maxw')+'px !important;\
					}\
				'), null, null);
				
				applyNewSheet(this.locationbarsize);
			}
		
		break;
		
		case "sb_width":
			removeOldSheet(this.searchbarsize);
			
			if(enable==true && this.prefs.getBoolPref('sb_width')){
		
				this.searchbarsize=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					#search-container {\
					  min-width: '+this.prefs.getIntPref('sbsize_minw')+'px !important;\
					  max-width: '+this.prefs.getIntPref('sbsize_maxw')+'px !important;\
					}\
				'), null, null);
				
				applyNewSheet(this.searchbarsize);
			}
		
		break;
		
		case "lb_roundness":
			removeOldSheet(this.locationbarradius);
			
			if(enable==true && this.prefs.getBoolPref('lb_roundness')){
		
				var locborraiusextra_l='';
				var locborraiusextra_r='';
				
				if (this.prefs.getIntPref('lbradius_left')!=0) {
				  locborraiusextra_l='\
				    #urlbar:-moz-locale-dir(ltr) #notification-popup-box:not([hidden="true"]),\
					#urlbar:-moz-locale-dir(ltr) #notification-popup-box[hidden="true"] + box,\
					#urlbar:-moz-locale-dir(ltr) box[role="button"]:first-of-type {\
					  border-top-left-radius: '+this.prefs.getIntPref('lbradius_left')+'px !important;\
					  border-bottom-left-radius: '+this.prefs.getIntPref('lbradius_left')+'px !important;\
					}\
				  ';
				}
				
				if (this.prefs.getIntPref('lbradius_right')!=0) {
				  locborraiusextra_r='\
					#urlbar:-moz-locale-dir(rtl) #notification-popup-box:not([hidden="true"]),\
					#urlbar:-moz-locale-dir(rtl) #notification-popup-box[hidden="true"] + box,\
					#urlbar:-moz-locale-dir(rtl) box[role="button"]:first-of-type{\
					  border-top-right-radius: '+this.prefs.getIntPref('lbradius_right')+'px !important;\
					  border-bottom-right-radius: '+this.prefs.getIntPref('lbradius_right')+'px !important;\
					}\
				  ';
				}
				
				this.locationbarradius=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					#urlbar,\
					#urlbar .autocomplete-textbox-container {\
					  border-top-left-radius: '+this.prefs.getIntPref('lbradius_left')+'px !important;\
					  border-bottom-left-radius: '+this.prefs.getIntPref('lbradius_left')+'px !important;\
					  border-top-right-radius: '+this.prefs.getIntPref('lbradius_right')+'px !important;\
					  border-bottom-right-radius: '+this.prefs.getIntPref('lbradius_right')+'px !important;\
					}\
					'+locborraiusextra_l+'\
					'+locborraiusextra_r+'\
				'), null, null);
				
				applyNewSheet(this.locationbarradius);
			}
		
		break;
		
		case "sb_roundness":
			removeOldSheet(this.searchbarradius);
			
			if(enable==true && this.prefs.getBoolPref('sb_roundness')){
		
				this.searchbarradius=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					.searchbar-textbox,\
					.searchbar-textbox .autocomplete-textbox-container{\
					  border-top-left-radius: '+this.prefs.getIntPref('sbradius_left')+'px !important;\
					  border-bottom-left-radius: '+this.prefs.getIntPref('sbradius_left')+'px !important;\
					  border-top-right-radius: '+this.prefs.getIntPref('sbradius_right')+'px !important;\
					  border-bottom-right-radius: '+this.prefs.getIntPref('sbradius_right')+'px !important;\
					}\
				'), null, null);
				
				applyNewSheet(this.searchbarradius);
			}
		
		break;
		
		case "navbarpad":
			removeOldSheet(this.navbarpadding);
			
			if(enable==true && this.prefs.getBoolPref('navbarpad')){
		
				this.navbarpadding=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					#main-window:not([customizing]) #nav-bar-customization-target {\
					  padding-left: '+this.prefs.getIntPref('navbarpad_l')+'px !important;\
					  padding-right: '+this.prefs.getIntPref('navbarpad_r')+'px !important;\
					}\
					#main-window:not([customizing]) #nav-bar {\
					  margin-left: '+this.prefs.getIntPref('navbarmar_l')+'px !important;\
					  margin-right: '+this.prefs.getIntPref('navbarmar_r')+'px !important;\
					}\
					/* force min/max/close to be accessible*/\
					#titlebar-buttonbox {\
					  z-index: 99999 !important;\
					}\
				'), null, null);
				
				applyNewSheet(this.navbarpadding);
			}
		
		break;
		
		case "osearch_cwidth":
			removeOldSheet(this.searchpopupwidth);
			
			if(enable==true && this.prefs.getBoolPref('osearch_cwidth')){			
				
				this.searchpopupwidth=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					#PopupAutoComplete[autocompleteinput="searchbar"],\
					#searchbar .searchbar-popup {\
					  min-width: '+this.prefs.getIntPref('os_spsize_minw')+'px !important;\
					  max-width: '+this.prefs.getIntPref('os_spsize_maxw')+'px !important;\
					}\
				'), null, null);
				
				applyNewSheet(this.searchpopupwidth);
			}
		
		break;
		
		case "cui_buttons":
		
			removeOldSheet(this.cuiButtonssheet);
			
			if(enable==true){
			
				var cuismallnavbut='';
				var cuiicotextbut='';
				var cuitabsnontop='';
				var cuictroldsearch='';
			  
				if (this.prefs.getBoolPref("smallnavbut")) {
				  cuismallnavbut='#ctraddon_cui-smallnavbut-button1 {background:#fbfbfb !important;} #ctraddon_cui-smallnavbut-button2 {background:#dadada !important;}';
				} else {
				  cuismallnavbut='#ctraddon_cui-smallnavbut-button1 {background:#dadada !important;} #ctraddon_cui-smallnavbut-button2 {background:#fbfbfb !important;}';
				}
			
				switch (this.prefs.getCharPref("nav_txt_ico")) {
					case "icons":		cuiicotextbut='#ctraddon_cui-icons-button {background:#dadada !important;} #ctraddon_cui-iconstext-button {background:#fbfbfb !important;} #ctraddon_cui-textonly-button {background:#fbfbfb !important;}'; break;
					case "iconsbig":	cuiicotextbut='#ctraddon_cui-icons-button {background:#bdbdbd !important;} #ctraddon_cui-iconstext-button {background:#fbfbfb !important;} #ctraddon_cui-textonly-button {background:#fbfbfb !important;}'; break;
					case "iconstxt":	cuiicotextbut='#ctraddon_cui-icons-button {background:#fbfbfb !important;} #ctraddon_cui-iconstext-button {background:#dadada !important;} #ctraddon_cui-textonly-button {background:#fbfbfb !important;}'; break;
					case "iconstxt2":	cuiicotextbut='#ctraddon_cui-icons-button {background:#fbfbfb !important;} #ctraddon_cui-iconstext-button {background:#bdbdbd !important;} #ctraddon_cui-textonly-button {background:#fbfbfb !important;}'; break;
					case "iconstxt3":	cuiicotextbut='#ctraddon_cui-icons-button {background:#fbfbfb !important;} #ctraddon_cui-iconstext-button {background:#dadada !important;} #ctraddon_cui-textonly-button {background:#fbfbfb !important;} #ctraddon_cui-iconstext-button label { border-bottom: 1px dotted !important; margin-bottom: -1px !important; }'; break;
					case "iconstxt4":	cuiicotextbut='#ctraddon_cui-icons-button {background:#fbfbfb !important;} #ctraddon_cui-iconstext-button {background:#bdbdbd !important;} #ctraddon_cui-textonly-button {background:#fbfbfb !important;} #ctraddon_cui-iconstext-button label { border-bottom: 1px dotted !important; margin-bottom: -1px !important; }'; break;
					case "full":		cuiicotextbut='#ctraddon_cui-icons-button {background:#fbfbfb !important;} #ctraddon_cui-iconstext-button {background:#dadada !important;} #ctraddon_cui-textonly-button {background:#fbfbfb !important;} #ctraddon_cui-iconstext-button label { border-bottom: 1px dashed !important; margin-bottom: -1px !important; }'; break;
					case "full2":		cuiicotextbut='#ctraddon_cui-icons-button {background:#fbfbfb !important;} #ctraddon_cui-iconstext-button {background:#bdbdbd !important;} #ctraddon_cui-textonly-button {background:#fbfbfb !important;} #ctraddon_cui-iconstext-button label { border-bottom: 1px dashed !important; margin-bottom: -1px !important; }'; break;
					case "txtonly":		cuiicotextbut='#ctraddon_cui-icons-button {background:#fbfbfb !important;} #ctraddon_cui-iconstext-button {background:#fbfbfb !important;} #ctraddon_cui-textonly-button {background:#dadada !important;}'; break;
					case "text":		cuiicotextbut='#ctraddon_cui-icons-button {background:#fbfbfb !important;} #ctraddon_cui-iconstext-button {background:#fbfbfb !important;} #ctraddon_cui-textonly-button {background:#bdbdbd !important;}'; break;
				}
				
				switch (this.prefs.getCharPref("tabsontop")) {
					case "unset":	cuitabsnontop='#ctraddon_cui-tabsnontop {background:#fbfbfb !important;}'; break;
					case "false":	cuitabsnontop='#ctraddon_cui-tabsnontop {background:#dadada !important;}'; break;
					case "false2":	cuitabsnontop='#ctraddon_cui-tabsnontop {background:#bdbdbd !important;}'; break;
				}
				
				if (this.prefs.getBoolPref("ctroldsearch"))
				  cuictroldsearch='#ctraddon_cui-ctroldsearch {background:#dadada !important;}';
				else cuictroldsearch='#ctraddon_cui-ctroldsearch {background:#fbfbfb !important;}';

				
				this.cuiButtonssheet=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					'+cuismallnavbut+'\
					'+cuiicotextbut+'\
					'+cuitabsnontop+'\
					'+cuictroldsearch+'\
				'), null, null);

				applyNewSheet(this.cuiButtonssheet);
			}
		
		break;
		
		case "searchbarsheet":

			removeOldSheet(this.searchbarsheet);
			
			if(enable==true && this.prefs.getBoolPref("customsearchbarwidth")){
	
				this.searchbarsheet=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
						#search-container {\
							max-width: '+this.prefs.getIntPref('searchbarwidth')+'px !important;\
						}\
				'), null, null);
				
				applyNewSheet(this.searchbarsheet);
			}

		break;
		
		case "bookmarkbarfontsize":

			removeOldSheet(this.bookmarkbarfontsize);
			
			if(enable==true && this.prefs.getBoolPref("custbookmarkfontsize")){

						/*#personal-bookmarks .bookmark-item > .toolbarbutton-icon {\
							height:'+this.prefs.getIntPref('cbookmarkfontsize')+'px !important;\
							width:'+this.prefs.getIntPref('cbookmarkfontsize')+'px !important;\
						}\*/
			
				this.bookmarkbarfontsize=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
				@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\
					@-moz-document url(chrome://browser/content/browser.xul) {\
						#PlacesToolbarItems {\
							font-size: '+this.prefs.getIntPref('cbookmarkfontsize')+'px !important;\
						}\
					}\
				'), null, null);
				
				applyNewSheet(this.bookmarkbarfontsize);
			}

		break;
		
		case "tabfontsize":

			removeOldSheet(this.tabfontsize);
			
			if(enable==true && this.prefs.getBoolPref("custtabfontsize")){			
				this.tabfontsize=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
				@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\
					@-moz-document url(chrome://browser/content/browser.xul) {\
						#TabsToolbar .tabbrowser-tab .tab-text {\
							font-size: '+this.prefs.getIntPref('ctabfontsize')+'px !important;\
						}\
					}\
				'), null, null);
				
				applyNewSheet(this.tabfontsize);
			}

		break;
		
		case "abouthome_bg":

			removeOldSheet(this.abouthome_bg);
			
			if(enable==true && this.prefs.getBoolPref("abouthomecustombg")){
				var IsDefault = "";
				if (this.prefs.getCharPref("abouthome") === "default"){
					IsDefault = '\
						html,body{\
							background-image: url('+ this.prefs.getCharPref("abouthomecustomurl") +')!important;\
						}\
					';
				}
	
				this.abouthome_bg=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					@namespace url(http://www.w3.org/1999/xhtml);\
					@-moz-document url("about:home") {\
						:root{\
							--main-background-image: url('+ this.prefs.getCharPref("abouthomecustomurl") +')!important;\
						}\
						'+ IsDefault +'\
					}\
				'), null, null);
				
				applyNewSheet(this.abouthome_bg);
			}

		break;

		case "abouthome_custcolor":

			removeOldSheet(this.abouthome_custcolor);
			
			if(enable==true && this.prefs.getBoolPref("abouthomehighlight")){
	
				this.abouthome_custcolor=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					@namespace url(http://www.w3.org/1999/xhtml);\
					@-moz-document url("about:home") {\
						:root {\
							--main-highlight-color:'+this.prefs.getCharPref("abouthomecustomhighlightcolor")+'!important;\
						}\
					}\
				'), null, null);
				
				applyNewSheet(this.abouthome_custcolor);
			}

		break;
		
		case "abouthome_custbasecolor":

			removeOldSheet(this.abouthome_custbasecolor);
			
			if(enable==true && this.prefs.getBoolPref("abouthomecustombase")){
	
				this.abouthome_custbasecolor=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					@namespace url(http://www.w3.org/1999/xhtml);\
					@-moz-document url("about:home") {\
						:root {\
							--main-text-color:'+this.prefs.getCharPref("abouthomecustombasecolor")+'!important;\
							--main-text-colorb:'+this.prefs.getCharPref("abouthomecustombasecolor")+'!important;\
						}\
					}\
				'), null, null);
				
				applyNewSheet(this.abouthome_custbasecolor);
			}

		break;
		
		case "aboutnewtab_custcolor":

			removeOldSheet(this.aboutnewtab_custcolor);
			
			if(enable==true && this.prefs.getBoolPref("aboutnewtabcustombase") || this.prefs.getBoolPref("aboutnewtabcustomhighlight")){
				var custBase ="";
				var custHighLight ="";
				if (this.prefs.getBoolPref("aboutnewtabcustombase")){
					custBase = "--main-text-color:"+this.prefs.getCharPref("aboutnewtabcustombasecolor")+"!important;";
				}
				if (this.prefs.getBoolPref("aboutnewtabcustomhighlight")){
					custHighLight = "--main-highlight-color:"+this.prefs.getCharPref("aboutnewtabcustomhighlightcolor")+"!important;";
				}				
	
				this.aboutnewtab_custcolor=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					@-moz-document url("about:newtab") {\
						:root {\
							'+custHighLight+'\
							'+custBase+'\
						}\
					}\
				'), null, null);
				
				applyNewSheet(this.aboutnewtab_custcolor);
			}

		break;
		
		case "hideElements":

			removeOldSheet(this.hideElements);
			
			if(enable==true && this.prefs.getBoolPref("hidexulelements")){
				
			var elementData = this.prefs.getCharPref("hidexulfilter").replace(/,\s*$/, "");

				//Check for empty array so we don't create a style with no data.
				if(elementData !== ""){
				this.hideElements=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					/*AGENT_SHEET*/\
					@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\
					@-moz-document url(chrome://browser/content/browser.xul) {\
						'+elementData+'{\
							display:none!important;\
						}\
					}\
				'), null, null);
		
				applyNewSheet(this.hideElements);
				}
			}
		break;
			
		case "aboutnewtab_bg":

			removeOldSheet(this.aboutnewtab_bg);
			
			if(enable==true && this.prefs.getBoolPref("aboutnewtabcustombg")){
	
				this.aboutnewtab_bg=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					@namespace url(http://www.w3.org/1999/xhtml);\
					@-moz-document url("about:newtab") {\
						body{\
							background-image: url('+ this.prefs.getCharPref("aboutnewtabcustomurl") +')!important;\
						}\
					}\
				'), null, null);
				
				applyNewSheet(this.aboutnewtab_bg);
			}

		break;	
	
		case "custtabthorbber":

			removeOldSheet(this.custtabthorbber);
			
			if(enable==true && this.prefs.getBoolPref("tabthrobberusecust")){
	
				this.custtabthorbber=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
					@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\
					@-moz-document url(chrome://browser/content/browser.xul) {\
						.tab-throbber[progress]{\
							list-style-image: url('+ this.prefs.getCharPref("tabthrobbercusturl") +')!important;\
						}\
					}\
				'), null, null);
				
				applyNewSheet(this.custtabthorbber);
			}

		break;
		
		case "cctrcustomcsss":

			removeOldSheet(this.cctrcustomcsss);
			
			if(enable==true && this.prefs.getBoolPref("loadcustomcss")){
				
				this.cctrcustomcsss=ios.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
							@import url("file:///'+ this.prefs.getCharPref("customcssurl").replace(/\\/g,"/") +'");\
				'), null, null);

				applyNewSheet(this.cctrcustomcsss);
			}

		break;
		
	}
	
	// Apply or remove the style sheet files
	function manageCSS(file) {

		var sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
		var ios = Services.io;

		var uri = ios.newURI("chrome://classic_theme_restorer/content/css/" + file,null,null);
		
		try{
			if (enable) {
				if (!sss.sheetRegistered(uri,sss.AGENT_SHEET))
					sss.loadAndRegisterSheet(uri,sss.AGENT_SHEET);
			} else {
				if (sss.sheetRegistered(uri,sss.AGENT_SHEET))
					sss.unregisterSheet(uri,sss.AGENT_SHEET);
			}
		}catch(e){}
	}
	
	// remove style sheet
	function removeOldSheet(sheet){

	  var sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);

		if (sss.sheetRegistered(sheet,sss.AGENT_SHEET)) sss.unregisterSheet(sheet,sss.AGENT_SHEET);
	}

	// apply style sheet
	function applyNewSheet(sheet){

	  var sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);

		try {
			if (!sss.sheetRegistered(sheet,sss.AGENT_SHEET)) sss.loadAndRegisterSheet(sheet,sss.AGENT_SHEET);
		}catch(e){}
	}
	
  },

  // handles two 'options' per button for 'icons' and 'icon+text' buttons on customizing area
  cuiPrefChangeString: function(which,value){

	if(this.prefs.getCharPref('nav_txt_ico')=='icons' && value=="icons" && this.fxdefaulttheme) {
	  this.prefs.setCharPref(which,'iconsbig');
	} 
	else if(this.prefs.getCharPref('nav_txt_ico')=='iconsbig' && value=="icons") {
	  this.prefs.setCharPref(which,'icons');
	}
	else if(this.prefs.getCharPref('nav_txt_ico')=='iconstxt' && value=="iconstxt") {
	  this.prefs.setCharPref(which,'iconstxt2');
	} 
	else if(this.prefs.getCharPref('nav_txt_ico')=='iconstxt2' && value=="iconstxt") {
	  this.prefs.setCharPref(which,'iconstxt3');
	}
	else if(this.prefs.getCharPref('nav_txt_ico')=='iconstxt3' && value=="iconstxt") {
	  this.prefs.setCharPref(which,'iconstxt4');
	}
	else if(this.prefs.getCharPref('nav_txt_ico')=='iconstxt4' && value=="iconstxt") {
	  this.prefs.setCharPref(which,'full');
	}
	else if(this.prefs.getCharPref('nav_txt_ico')=='full' && value=="iconstxt") {
	  this.prefs.setCharPref(which,'full2');
	}
	else if(this.prefs.getCharPref('nav_txt_ico')=='full2' && value=="iconstxt") {
	  this.prefs.setCharPref(which,'iconstxt');
	}
	else if(this.prefs.getCharPref('nav_txt_ico')=='txtonly' && value=="txtonly") {
	  this.prefs.setCharPref(which,'text');
	}
	else if(this.prefs.getCharPref('nav_txt_ico')=='text' && value=="txtonly") {
	  this.prefs.setCharPref(which,'txtonly');
	}
	else {
	  this.prefs.setCharPref(which,value);
	}

  },
  
  cuiPrefTabsNontop: function(){
	if(this.prefs.getCharPref('tabsontop')=='unset') {
	  this.prefs.setCharPref('tabsontop','false');
	} 
	else if(this.prefs.getCharPref('tabsontop')=='false') {
	  this.prefs.setCharPref('tabsontop','false2');
	}
	else if(this.prefs.getCharPref('tabsontop')=='false2') {
	  this.prefs.setCharPref('tabsontop','unset');
	} 
  },
  
  cuiPrefOldSearch: function(){
	if(this.prefs.getBoolPref('ctroldsearch')) {
	  this.prefs.setBoolPref('ctroldsearch',false);
	} else this.prefs.setBoolPref('ctroldsearch',true);
  },
  
  openCTRPreferences: function(currentWindow) {
	AddonManager.getAddonByID("CTR@8pecxstudios.com", function(aAddon) {
	  var windows = Services.wm.getEnumerator(null);
		while (windows.hasMoreElements()) {
		  var win = windows.getNext();
		  if (win.document.documentURI == aAddon.optionsURL) {
			win.focus();
			return;
		  }
		}

		window.open(aAddon.optionsURL,'', 'chrome').focus();
		
	});
  },

  // open prefwindow and specific category
  additionalToolbars: function(){
	Services.prefs.getBranch("extensions.classicthemerestorer.").setIntPref('pw_actidx_c',7);
	Services.prefs.getBranch("extensions.classicthemerestorer.").setIntPref('pw_actidx_tb',0);
	
	setTimeout(function(){
	  classicthemerestorerjs.ctr.openCTRPreferences();
	},100);
	
  },
	
  // hides/shows CTRs add-on bar
  toggleCtrAddonBar: function() {
    
	var ctrAddonBar = document.getElementById("ctraddon_addon-bar");
    setToolbarVisibility(ctrAddonBar, ctrAddonBar.collapsed);
  
  },
  
  toggleCtrNavBar: function() {
    
	if(Services.prefs.getBranch("extensions.classicthemerestorer.").getBoolPref("hidenavbar")) {
      Services.prefs.getBranch("extensions.classicthemerestorer.").setBoolPref("hidenavbar",false);
	  try{
	    document.getElementById("toggle_nav-bar").setAttribute("checked",true);
	  }catch(e){}
	}
    else {
	  Services.prefs.getBranch("extensions.classicthemerestorer.").setBoolPref("hidenavbar",true);
	  try{
		document.getElementById("toggle_nav-bar").setAttribute("checked",false);
	  }catch(e){}
	}
  
  },
 
  // open 'about:preferences' in a new small window
  openContentPrefsInWin: function(which) {
	 
	try{classicthemerestorerjs.ctr.ctrcontentprefswin.close();} catch(e){}
	
	  var wwidth = 700; // window width
	  var wheight = 670; // window height
  
	  if(classicthemerestorerjs.ctr.prefs.getIntPref("aboutprefsww") != 850)
		wwidth = classicthemerestorerjs.ctr.prefs.getIntPref("aboutprefsww");
	  if(classicthemerestorerjs.ctr.prefs.getIntPref("aboutprefswh") != 670)
		wheight = classicthemerestorerjs.ctr.prefs.getIntPref("aboutprefswh");
	
	  if (wwidth < 500) wwidth = 500;
	  if (wheight < 300) wheight = 300;
	  
	  if (wwidth > screen.availWidth) wwidth = screen.availWidth-1;
	  if (wheight > screen.availHeight) wheight = screen.availHeight-1;

	  var w = (screen.availWidth-wwidth)/2;
	  var h = (screen.availHeight-wheight)/2;
	  
	  if(classicthemerestorerjs.ctr.prefs.getCharPref('altoptions')=='options_win' || classicthemerestorerjs.ctr.prefs.getCharPref('altoptions')=='options_win_alt') {
		
		if(which=='search')		
		  classicthemerestorerjs.ctr.ctrcontentprefswin = window.open('about:preferences#search', '', 'width='+wwidth+',height='+wheight+',top='+h+',left='+w+',resizable=yes');
	    else classicthemerestorerjs.ctr.ctrcontentprefswin = window.open('about:preferences', '', 'width='+wwidth+',height='+wheight+',top='+h+',left='+w+',resizable=yes');

	  } else openPreferences();

  },
  
  closeContentPrefsInWin: function() {
	try{classicthemerestorerjs.ctr.ctrcontentprefswin.close();} catch(e){}
  },
  
  // reset CTRs toolbar configuration
  resetCTRtoolbarConf: function() {
	  
	// make CTRs add-on bar and bookmarks toolbar are visible
	setTimeout(function(){
	  try{
		setToolbarVisibility(document.getElementById("ctraddon_addon-bar"), true);
		setToolbarVisibility(document.getElementById("PersonalToolbar"), true);
	  }catch(e){}
	},1000);

	// move CTRs toolbar items to toolbars
	setTimeout(function(){
	  try{
		CustomizableUI.addWidgetToArea("ctraddon_back-forward-button", CustomizableUI.AREA_NAVBAR);
		CustomizableUI.addWidgetToArea("ctraddon_appbutton", CustomizableUI.AREA_NAVBAR);
		CustomizableUI.addWidgetToArea("ctraddon_panelui-button", CustomizableUI.AREA_NAVBAR);
		if (classicthemerestorerjs.ctr.osstring=="WINNT") CustomizableUI.addWidgetToArea("ctraddon_window-controls", CustomizableUI.AREA_NAVBAR);
		CustomizableUI.addWidgetToArea("ctraddon_bookmarks-menu-toolbar-button", CustomizableUI.AREA_BOOKMARKS);

		if (classicthemerestorerjs.ctr.osstring=="WINNT" && Services.prefs.getBranch("browser.tabs.").getBoolPref("drawInTitlebar")) {
		  Services.prefs.getBranch("extensions.classicthemerestorer.").setCharPref("appbutton",'appbutton_v2');
		}

	  } catch(e){}
	},1000); 

	// set position of some toolbar items
	setTimeout(function(){
	  try{
		CustomizableUI.moveWidgetWithinArea("ctraddon_back-forward-button",0);
		CustomizableUI.moveWidgetWithinArea("ctraddon_appbutton",0);
	  }catch(e){}
	},1100);

},

  //Appmenu Items Clean Ram | Restart Browser | About:config
customCTRPrefSettings: function(e){  
 document.getElementById("appmenu-popup")
        .addEventListener("popupshowing", function (e) {
		
try{		
		
	//R.M.F	
	if (Services.prefs.getBoolPref("browser.restart.enabled")){
			document.getElementById("appmenu_restartBrowser").removeAttribute('hidden', false);
	}else{
			document.getElementById("appmenu_restartBrowser").setAttribute('hidden', true);		
	}	
	
	//R.A.M
	if (Services.prefs.getBoolPref("clean.ram.cache")){
		document.getElementById("appmenu_minimizeMemoryUsage").removeAttribute('hidden');
	}else{
		document.getElementById("appmenu_minimizeMemoryUsage").setAttribute('hidden', true);
    }	
	
	//About:config
	if (Services.prefs.getBoolPref("browser.menu.aboutconfig")){ 
			document.getElementById("ctraddon_appmenu_aboutc").removeAttribute('hidden');
	}else{
			document.getElementById("ctraddon_appmenu_aboutc").setAttribute('hidden', true);
	}		

		}catch (e){
			//Catch any nasty errors and output to dialogue and console
			alert("Were sorry something has gone wrong removing Appmenu Items" + e);
	}	
			
  }, false);

  if(classicthemerestorerjs.ctr.osstring=="WINNT"){
	  document.getElementById("ctraddon_appbutton2")
	        .addEventListener("DOMContentLoaded", function (e) {
	        	document.getElementById("ctraddon_appbutton2")
	        		.removeEventListener("DOMContentLoaded", load, false);		
		try{		
				classicthemerestorerjs.ctr.fixThatTreeStyleBro();
			}catch (e){}	
				
	  }, false);
  }
  
//Add listener for tree style tab  
window.addEventListener("DOMWindowCreated", function load(event){ 
	window.removeEventListener("DOMWindowCreated", load, false);

   AddonManager.getAddonByID('treestyletab@piro.sakura.ne.jp', function(addon) {
				if(addon && addon.isActive && !treeStyleCompatMode) {
					Services.prefs.setBoolPref("extensions.classicthemerestorer.compatibility.treestyle", true);
					classicthemerestorerjs.ctr.fixThatTreeStyleBro();		
				}else{ 
					Services.prefs.setBoolPref("extensions.classicthemerestorer.compatibility.treestyle", false);
				}
					//If a user disables the AppMenu button then restarts the menu tool-bar disapears, Lets trigger it to be created,
					//However the user may have to manually toggle the menu-tool-bar to remove the draw delay	from adding it here.
					if(addon && addon.isActive 
						&& !treeStyleCompatMode 
						&& Services.prefs.getCharPref("extensions.classicthemerestorer.appbutton") === "appbutton_off" 
						&& document.getElementById("toolbar-menubar").getAttribute('autohide', true)){
							document.getElementById("toolbar-menubar").setAttribute('autohide', false);
							classicthemerestorerjs.ctr.fixThatTreeStyleBro();
					}
					
			  });			
								  					 			  
			  		},false);					
  },
  
	fixThatTreeStyleBro: function(){
	
if (Services.prefs.getBoolPref("extensions.classicthemerestorer.compatibility.treestyle") && !treeStyleCompatMode){	
	var appButtonState = Services.prefs.getCharPref("extensions.classicthemerestorer.appbutton");
				var menutoolbarHasAttribute = document.getElementById("toolbar-menubar");			
switch (appButtonState){

		case "appbutton_off":
			classicthemerestorerjs.ctr.loadUnloadCSS("tree_style_fix",false);
			if (menutoolbarHasAttribute.getAttribute('autohide', true)){
			if (treeStyleCompatMode === false){Services.prefs.setBoolPref("browser.tabs.drawInTitlebar", false);}else{}
			}	
		break;
	
		case "appbutton_v1": 
			if(classicthemerestorerjs.ctr.osstring!="Linux"){menutoolbarHasAttribute.setAttribute('autohide', false);
				classicthemerestorerjs.ctr.loadUnloadCSS("tree_style_fix",true);
			}		
			Services.prefs.setCharPref("extensions.classicthemerestorer.tabs", "tabs_default");
		break;
		
		case "appbutton_v1wt": 
			if(classicthemerestorerjs.ctr.osstring!="Linux"){menutoolbarHasAttribute.setAttribute('autohide', false);
				classicthemerestorerjs.ctr.loadUnloadCSS("tree_style_fix",true);
			}			
			Services.prefs.setCharPref("extensions.classicthemerestorer.tabs", "tabs_default");
		break;

		case "appbutton_v2wt2": 
			if(classicthemerestorerjs.ctr.osstring!="Linux"){menutoolbarHasAttribute.setAttribute('autohide', false);
				classicthemerestorerjs.ctr.loadUnloadCSS("tree_style_fix",true);
			}			
			Services.prefs.setCharPref("extensions.classicthemerestorer.tabs", "tabs_default");
		break;
		
		case "appbutton_v2": 
			if(classicthemerestorerjs.ctr.osstring!="Linux"){menutoolbarHasAttribute.setAttribute('autohide', false);
				classicthemerestorerjs.ctr.loadUnloadCSS("tree_style_fix",true);
			}				
			Services.prefs.setCharPref("extensions.classicthemerestorer.tabs", "tabs_default");
		break;
		
		case "appbutton_v2io": 
			if(classicthemerestorerjs.ctr.osstring!="Linux"){menutoolbarHasAttribute.setAttribute('autohide', false);
				classicthemerestorerjs.ctr.loadUnloadCSS("tree_style_fix",true);
			}			
			Services.prefs.setCharPref("extensions.classicthemerestorer.tabs", "tabs_default");
		break;

		case "appbutton_v2io2": 
			if(classicthemerestorerjs.ctr.osstring!="Linux"){menutoolbarHasAttribute.setAttribute('autohide', false);
				classicthemerestorerjs.ctr.loadUnloadCSS("tree_style_fix",true);
			}			
			Services.prefs.setCharPref("extensions.classicthemerestorer.tabs", "tabs_default");
		break;
		
		case "appbutton_pm": 
			if(classicthemerestorerjs.ctr.osstring!="Linux"){menutoolbarHasAttribute.setAttribute('autohide', false);
				classicthemerestorerjs.ctr.loadUnloadCSS("tree_style_fix",true);
			}			
			Services.prefs.setCharPref("extensions.classicthemerestorer.tabs", "tabs_default");
		break;

}
	}
		},


    notifications: function(aMessage, aMessageId, aButtonLabel, aAcessKey, aPopupShow, aPopup, aCallback) {
      try {
        var notificationBox = gBrowser.getNotificationBox();
        var button = [];
        switch (aPopupShow) {
          case true:
            button = [{
              label: aButtonLabel,
              accessKey: aAcessKey,
              popup: aPopup,
              callback: aCallback
            }];
            break;

          case false:
            button = [{
              label: aButtonLabel,
              accessKey: aAcessKey,
              callback: aCallback
            }];
            break;
        }
        notificationBox.appendNotification(aMessage, aMessageId, 'chrome://browser/skin/Info.png', notificationBox.PRIORITY_INFO_HIGH, button);
      } catch (e) {}
    },

    getHash: function(aContentStream) {
      function toHexString(charCode) {
        return ("0" + charCode.toString(16)).slice(-2);
      }
      try {
        var CryptoHash = Cc["@mozilla.org/security/hash;1"]
          .createInstance(Ci.nsICryptoHash);
        CryptoHash.init(CryptoHash.MD5);
        const PR_UINT32_MAX = 0xffffffff;
        CryptoHash.updateFromStream(aContentStream, PR_UINT32_MAX);
        var HashSum = CryptoHash.finish(false);
        var s = Array.from(HashSum, (c, i) => toHexString(HashSum.charCodeAt(i))).join("");
        return s;

      } catch (e) {}
    },

    // Need to check if json is valid. If json not valid. don't continue and show error.
    IsJsonValid: function(aData) {
      try {
        JSON.parse(aData);
      } catch (e) {
        return false;
      }
      return true;
    },

    loadFromFile: function(aType) {
      try {
        if (aType === "txt" || aType === "json") {} else {
          return false;
        }

        var localeSettingsFile = "";
        var contentStream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
        var contentIOStream = Cc["@mozilla.org/scriptableinputstream;1"].createInstance(Ci.nsIScriptableInputStream);

        if (aType === "txt") {
          localeSettingsFile = FileUtils.getFile("CurProcD", ["CTRpreferences.txt"]);
          Services.prefs.setBoolPref("extensions.classicthemerestorer.ctrpref.importjson", false);
        }

        if (aType === "json") {
          localeSettingsFile = FileUtils.getFile("CurProcD", ["CTRpreferences.json"]);
          Services.prefs.setBoolPref("extensions.classicthemerestorer.ctrpref.importjson", true);
        }

        if (localeSettingsFile === "") {
          return false;
        }

        var _ThisFile = localeSettingsFile;
        contentStream.init(localeSettingsFile, 0x01, parseInt("0444", 8), 0);
        var lastmod = classicthemerestorerjs.ctr.getHash(contentStream);
        contentStream.close();
        if (Services.prefs.getCharPref("extensions.classicthemerestorer.ctrpref.lastmod") === lastmod.toString()) {
          Services.prefs.setBoolPref("extensions.classicthemerestorer.ctrpref.lastmodapply", false);
          contentStream.init(localeSettingsFile, 0x01, parseInt("0444", 8), null);
          contentIOStream.init(contentStream);
          var input = contentIOStream.read(contentStream.available());
          contentIOStream.close();
          contentStream.close();
          switch (aType) {
            case "txt":
              var linebreak = input.match(/(((\n+)|(\r+))+)/m)[1];
              return input.split(linebreak);
            case "json":
              var text = input;
              if (!classicthemerestorerjs.ctr.IsJsonValid(text)) {
                return false;
              } else {
                return JSON.parse(input);
              }
          }
        } else {
          if (Services.prefs.getBoolPref("extensions.classicthemerestorer.ctrpref.lastmodapply")) {
            Services.prefs.setCharPref("extensions.classicthemerestorer.ctrpref.lastmod", lastmod.toString());
            Services.prefs.setBoolPref("extensions.classicthemerestorer.ctrpref.lastmodapply", false);
            Services.prefs.setBoolPref("extensions.classicthemerestorer.ctrpref.updatekey", true);
            contentStream.init(localeSettingsFile, 0x01, parseInt("0444", 8), null);
            contentIOStream.init(contentStream);
            var input = contentIOStream.read(contentStream.available());
            contentIOStream.close();
            contentStream.close();

            switch (aType) {
              case "txt":
                var linebreak = input.match(/(((\n+)|(\r+))+)/m)[1];
                if (Services.prefs.getBoolPref("extensions.classicthemerestorer.ctrpref.updatekey") === true) {
                  var iProfdir = FileUtils.getDir("ProfD", [""]);
                  var encoder = new TextEncoder();
                  var array = encoder.encode(input.split(',').join('\n'));
                  var promise = OS.File.writeAtomic(iProfdir.path + "\\CTRpreferences.txt", array, {
                    tmpPath: "CTRpreferences.txt.tmp"
                  });
                  Services.prefs.setBoolPref("extensions.classicthemerestorer.ctrpref.updatekey", false)
                }

                return input.split(linebreak);
              case "json":
                var text = input;
                if (!classicthemerestorerjs.ctr.IsJsonValid(text)) {
                  return false;
                } else {
                  if (Services.prefs.getBoolPref("extensions.classicthemerestorer.ctrpref.updatekey") === true) {
                    var iProfdir = FileUtils.getDir("ProfD", [""]);
                    var encoder = new TextEncoder();
                    var array = encoder.encode(input);
                    var promise = OS.File.writeAtomic(iProfdir.path + "\\CTRpreferences.json", array, {
                      tmpPath: "CTRpreferences.json.tmp"
                    });
                    Services.prefs.setBoolPref("extensions.classicthemerestorer.ctrpref.updatekey", false)
                  }
                  return JSON.parse(input);
                }
            }
          }

          if (!Services.prefs.getBoolPref("extensions.classicthemerestorer.ctrpref.lastmodapply")) {
            switch (Services.prefs.getBoolPref("extensions.classicthemerestorer.ctrpref.firstrun")) {
              case true:
                window.setTimeout(function() {
                  Services.prefs.setBoolPref("extensions.classicthemerestorer.ctrpref.firstrun", false);
                  classicthemerestorerjs.ctr.notifications(classicthemerestorerjs.ctr.stringBundle.GetStringFromName("notification_msg_firstrun"),
                    'CTRpreferences', classicthemerestorerjs.ctr.stringBundle.GetStringFromName("notification_button_firstrun"),
                    'R', false, null,
                    function() { classicthemerestorerjs.ctr.ctrPrefRestart(); });
                }, 4000);
                break;
              case false:
                window.setTimeout(function() {
                  classicthemerestorerjs.ctr.notifications(classicthemerestorerjs.ctr.stringBundle.GetStringFromName("notification_msg_change"),
                    'CTRpreferences', classicthemerestorerjs.ctr.stringBundle.GetStringFromName("notification_button_change"),
                    'O', true, 'ApplyCTRpreferences', null);
                }, 4000);
                break;
            }
          }
        }

        return null;
      } catch (e) {
        Cu.reportError(e);
      }
    },

    /* import CTR settings */
    importLocalCTRpreferences: function() {

      function setPrefValue(pref, val) {

        switch (Services.prefs.getPrefType(pref)) {
          case 32: return Services.prefs.setCharPref(pref, val);
          case 64: return Services.prefs.setIntPref(pref, val);
          case 128: return Services.prefs.setBoolPref(pref, val);
        }
				
      }
      try {
        //Check that only one type is used.
        if (FileUtils.getFile("CurProcD", ["CTRpreferences.txt"]).exists() && FileUtils.getFile("CurProcD", ["CTRpreferences.json"]).exists()) {
          Services.prompt.alert(null, "Error:", "Both CTRpreferences.json & CTRpreferences.txt are present only one can be used.");
          return false;
        }

        if (FileUtils.getFile("CurProcD", ["CTRpreferences.txt"]).exists()) {
		  Services.prefs.setBoolPref("extensions.classicthemerestorer.ctrpref.active", true);
          var pattern = classicthemerestorerjs.ctr.loadFromFile("txt");

          if (!pattern) return false;

          if (pattern[0] != "CTR_Preferences__DO_NOT_EDIT__'='->booleans__':'->strings__'~'->integers") {
            alert(classicthemerestorerjs.ctr.stringBundle.GetStringFromName("import.error"));
            return false;
          }

          var i, prefName, prefValue;

          for (i = 1; i < pattern.length; i++) {
            var index1 = pattern[i].indexOf("="); // for finding booleans
            var index2 = pattern[i].indexOf(":"); // for finding strings
            var index3 = pattern[i].indexOf("~"); // for finding integers

            if (index2 > 0) { // find string
              prefName = pattern[i].substring(0, index2);
              prefValue = pattern[i].substring(index2 + 1, pattern[i].length);

              this.prefs.setCharPref('' + prefName + '', '' + prefValue + '');
            } else if (index1 > 0) { // find boolean
              prefName = pattern[i].substring(0, index1);
              prefValue = pattern[i].substring(index1 + 1, pattern[i].length);

              // if prefValue string is "true" -> true, else -> false
              this.prefs.setBoolPref('' + prefName + '', (prefValue === 'true'));
            } else if (index3 > 0) { // find integer
              prefName = pattern[i].substring(0, index3);
              prefValue = pattern[i].substring(index3 + 1, pattern[i].length);

              this.prefs.setIntPref('' + prefName + '', prefValue);
            }
          }
        }

        if (FileUtils.getFile("CurProcD", ["CTRpreferences.json"]).exists()) {
		  Services.prefs.setBoolPref("extensions.classicthemerestorer.ctrpref.active", true);
          var stringBundle = Services.strings.createBundle("chrome://classic_theme_restorer/locale/messages.file");

          var parjson = classicthemerestorerjs.ctr.loadFromFile("json");

          if (!parjson) return false;

          for (var i = 0; i < parjson.length; i++) {
            try {

              if (parjson[i].preference.match(/extensions.classicthemerestorer./g)) {
                //To import previously generated preference export
                setPrefValue(parjson[i].preference, parjson[i].value);
              } else {
                setPrefValue('extensions.classicthemerestorer.' + parjson[i].preference, parjson[i].value);
              }

            } catch (e) {
              // Report errors to console
              Cu.reportError(e);
            }
          }
        }
      } catch (e) {}
      return true;
    },

    /* restore CTR settings */
    restoreBackupCTRpreferences: function() {

      var patterns = FileUtils.getFile("ProfD", []);

      if (!Services.prefs.getBoolPref("extensions.classicthemerestorer.ctrpref.importjson")) {

        var promise = OS.File.read(patterns.path + "\\CTRpreferences.txt", {
          encoding: "utf-8"
        });
        promise = promise.then(
          function onSuccess(data) {
            return saveToFile(data);
          });
      } else {

        var promise = OS.File.read(patterns.path + "\\CTRpreferences.json", {
          encoding: "utf-8"
        });
        promise = promise.then(
          function onSuccess(data) {
            return saveToFile(data);
          });
      }

      function saveToFile(iPatterns) {

        const nsIFilePicker = Ci.nsIFilePicker;
        var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
        var stream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);

        fp.init(window, null, nsIFilePicker.modeSave);

        if (!Services.prefs.getBoolPref("extensions.classicthemerestorer.ctrpref.importjson")) {
          fp.defaultExtension = "txt";
          fp.defaultString = "CTRpreferences.txt";
          fp.appendFilters(nsIFilePicker.filterText);
        } else {
          fp.defaultExtension = "json";
          fp.defaultString = "CTRpreferences.json";
          fp.appendFilters(nsIFilePicker.filterAll);
        }

        if (fp.show() != nsIFilePicker.returnCancel) {
          var file = fp.file;
          if (!Services.prefs.getBoolPref("extensions.classicthemerestorer.ctrpref.importjson")) {
            if (!/\.txt$/.test(file.leafName.toLowerCase()))
              file.leafName += ".txt";
          }
          if (file.exists())
            file.remove(true);
          file.create(file.NORMAL_FILE_TYPE, parseInt("0666", 8));
          stream.init(file, 0x02, 0x200, null);
          stream.write(iPatterns, iPatterns.length);
          stream.close();
        }
      }

      Services.prefs.setBoolPref("extensions.classicthemerestorer.ctrpref.updatekey", true);

      return true;

    },
	/* 
		Restore defaults remove all CTRpreferences files and settings 
		Users still have to manually remove CTRpreferences from \browser directory.
	*/
    resetBackupCTRpreferences: function() {
		
	if (Services.prompt.confirm(null, classicthemerestorerjs.ctr.stringBundle.GetStringFromName("notification_confirm_clear_title"), 
				classicthemerestorerjs.ctr.stringBundle.GetStringFromName("notification_confirm_clear"))){
	
     var patterns = FileUtils.getFile("ProfD", []);

      if (!Services.prefs.getBoolPref("extensions.classicthemerestorer.ctrpref.importjson")) {

        var promise = OS.File.remove(patterns.path + "\\CTRpreferences.txt");
        promise = promise.then(
          function onSuccess(data) {
			  console.log(patterns.path + "\\CTRpreferences.txt was deleted");
            return true;
          });
      } else {
        var promise = OS.File.remove(patterns.path + "\\CTRpreferences.json");
        promise = promise.then(
          function onSuccess(data) {
			  console.log(patterns.path + "\\CTRpreferences.json was deleted");
            return true;
          });
      }
  
		Services.prefs.clearUserPref("extensions.classicthemerestorer.ctrpref.importjson");
		Services.prefs.clearUserPref("extensions.classicthemerestorer.ctrpref.active");
        Services.prefs.clearUserPref("extensions.classicthemerestorer.ctrpref.lastmodapply");
		Services.prefs.clearUserPref("extensions.classicthemerestorer.ctrpref.lastmod");
        Services.prefs.clearUserPref("extensions.classicthemerestorer.ctrpref.firstrun");	
		}
	},	

  ctrPrefRestart: function(){
	  Services.prefs.setBoolPref("extensions.classicthemerestorer.ctrpref.lastmodapply", true);
	  gCyberfoxCustom.restartBrowser();
  },
  
  toggleCtrUrlExtraBar: function() {
    try{
		if(document.getElementById("ctraddon_urlextrabar").getAttribute("collapsed")=="true") {
		  document.getElementById("ctraddon_urlextrabar").setAttribute("collapsed",false);
		  
		  setTimeout(function(){
			document.getElementById('ctraddon_extraurlbar_tb').focus();
			document.getElementById('ctraddon_extraurlbar_tb').select();
		  },100);
		  
		}
		else if(document.getElementById("ctraddon_extraurlbar_tb").getAttribute("focused")=="true"){
		  document.getElementById("ctraddon_urlextrabar").setAttribute("collapsed",true);
		}
		else {
		  setTimeout(function(){
			document.getElementById('ctraddon_extraurlbar_tb').focus();
			document.getElementById('ctraddon_extraurlbar_tb').select();
		  },100);
		}
	} catch(e){}
  },
  
  openUrlFromUrlExtraBar: function() {
    try{
		if(classicthemerestorerjs.ctr.prefs.getCharPref('extraurltarget')=="current")
		  openUILinkIn(document.getElementById('ctraddon_extraurlbar_tb').value,"current", true, null, null);
		else if(classicthemerestorerjs.ctr.prefs.getCharPref('extraurltarget')=="window")
		  openUILinkIn(document.getElementById('ctraddon_extraurlbar_tb').value,"window", true, null, null);
		else
		  openUILinkIn(document.getElementById('ctraddon_extraurlbar_tb').value,"tab", true, null, null);
		
		document.getElementById('ctraddon_urlextrabar').setAttribute('collapsed',true);
	} catch(e){}		
  },
  
  togglePersonalBarItem: function() {

  	var PersonalBar = document.getElementById("PersonalToolbar");
    if(!PersonalBar.collapsed) {
	  try{ document.getElementById("ctraddon_BMB_viewBookmarksToolbar").setAttribute('checked','true');} catch(e){}
	}
	else {
	  try{ document.getElementById("ctraddon_BMB_viewBookmarksToolbar").removeAttribute('checked');} catch(e){}
	}

  },
  
  restartBrowser: function() {
    
	var cancelQuit   = Cc["@mozilla.org/supports-PRBool;1"].createInstance(Ci.nsISupportsPRBool);
	var observerSvc  = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
		
	observerSvc.notifyObservers(cancelQuit, "quit-application-requested", "restart");
	
	if(cancelQuit.data) return false;
		
	Services.startup.quit(Services.startup.eRestart | Services.startup.eAttemptQuit);

  }

};

classicthemerestorerjs.ctr.importLocalCTRpreferences();
classicthemerestorerjs.ctr.init();

  // Make classicthemerestorerjs a global variable
  global.classicthemerestorerjs = classicthemerestorerjs;
}(this));