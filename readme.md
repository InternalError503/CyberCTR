CyberCTR
========

Source Code Repository For CyberCTR

Source code released under [MPL 2.0] (https://www.mozilla.org/MPL/2.0/)

* [Homepage](https://8pecxstudios.com/Forums/viewtopic.php?f=6&t=475) - Learn more about CyberCTR
* [Issues](https://8pecxstudios.com/Forums/viewforum.php?f=5) - Report bugs

## What it does: 
CyberCTR adds the same or similar functionality as `Classic Theme Restorer` but with a few fundamental
changes, That are specific for the integration in to `Cyberfox Web Browser` and also offers functionality
exclusive for `Cyberfox` with many more under development.

## Why create CyberCTR:
We were looking for an alternative to australis that allowed us to easily provide both UI experiences but the
default classic look right out of the box everyone was used to, So we modified and integrated `Classic Theme Restorer`
and changed it into the much loved `CyberCTR`, We also wanted to make the user experience a little more unique by adding
features and functions to `CyberCTR` that `Classic Theme Restorer` does not offer.


## Main features (Added to CyberCTR):

### App-Menu button

- Button color Aurora __(Light)__.
- Button color Cyberfox __(Default Cyberfox Button Color)__.
- Button color Green __(Dark)__.
- Button color Orange __(Dark)__.
- Button color Red __(Dark)__.
- Button color Salmon.

### Shipped Pre-Sets:

- Australis pre-set

### Additional Features:

- Pre-Configure CyberCTR Settings in __*.txt__ or __*.json__ formats. [FAQ article] (https://8pecxstudios.com/Forums/viewtopic.php?f=8&t=672)
- Pre-Configure CyberCTR Settings file change detection & notification.
- Pre-Configure CyberCTR Settings backup and backup restore in __*.txt__ or __*.json__ formats.
- Tab text in title-bar.
- Import\Export preferences in **JSON** file format.
- Hide text shadow from tool-bar items and tabs. __(Thanks Aris)__
- Control gradient percentage on custom button color.
- Custom button color with 3 colors.
- Set custom button color text color.
- Remove custom button color text shadow.
- Set default maximum width for tool-bar search-bar. __(Range 120px - 295px)__
- Switch between custom `about:home` page style pre-sets.
- Change `about:home` page background with custom image __(Locale file or from URL)__.	
- Hide icons on `about:home` page.
- Hide logo on `about:home` page.
- Hide snippets __(Ads)__ on `about:home` page. __(Firefox Only)__
- Remove links on `about:home page`. __(Cyberfox Only)__
- Change highlight color of `about:home` page links, search-bar and buttons.
- Hide elements by class or id with css using the elements filter.  See list of [elements](https://github.com/InternalError503/CyberCTR/blob/master/ID_List.md)
- Alternate `about:newtab` page style.
- Change highlight color of `about:newtab` page elements.
- Change default text color of `about:newtab` page text and grid color.
- Set custom font size for bookmark-bar tool-bar. __(Range 2px - 30px)__
- Set custom font size for tab text __(Range 2px - 30px)__
- Custom background for `about:newtab` page.
- Stretch `about:newtab` custom background image to window.
- 5 more default tab throbbers to select from.
- Use custom tab throbbers. __(Use custom tab throbber image)__
- Animate animated lightweight themes on browser start-up.
- Users can load custom CSS with CyberCTR custom css.

Plus many under the hood changes and many more visual changes to come.

### Main features (on options window):


- Tab appearance: Squared classic tabs.
- Tab appearance: Curved tabs. __(all colored and visible)__
- Tabs not on top + **[tabsontop="false/true"]** attribute.
- Tabs height settings.
- Tabs min/max-width settings.
- Tab title in Firefox titlebar.
- Tab loading animations.
- Tab close on all tabs, active tab, tool-bars start/end.
- Double click on tabs toolbar opens a 'new' tab. __[Windows only]__
- Hide tabs toolbar with one visible tab.
- Custom colors for tab backgrounds, text and text shadow.
- Custom tab separators.
- Application button on tool-bars.
- Application button on title-bar. __[Windows only]__
- Own title for application button on titlebar. __[Windows only]__
- Predefined/custom application button colors.
- Small navigation tool-bar buttons.
- Movable back-forward button.
- Alternative appearance for `'about:preferences'` page.
- Open `'about:preferences'` page in a window. __(simulates preference window)__
- Alternative `about:add-ons` __(add-ons manager)__ appearance. __(Firefox 40+)__
- Activity indicator __(throbber)__ on toolbars.
- Bookmarks-star button in location bar.
- Rss-Feed button in location bar.
- Old Search ui for __Firefox 43+__.
- Movable status-bar panel
- Additional location bar.
- Combine stop & reload buttons.
- Hide location bars stop & reload buttons.
- Hide private browsing mask.
- Find bar on top or bottom.
- 'Icons & Text' and 'Text only' modes.
- Add [iconsize="large"]/[iconsize="small"] attributes to #nav-bar node.
- Compact panel menus. __(bookmarks, history...)__
- Green/blue site identity button for verified websites and secure connections.
- Replace context menu icons with labels. __(Back, Forward...)__
- Add up to 20 additional toolbars.
- Restore tabs empty favicon.
- Replace generic favicon __(empty and dotted)__ with sheet favicon.
- Favicon in urlbars identity box. __(location bars left)__
- Different padlock icons.
- AeroBlue toolbar colors for Windows 8/Classic, Linux, MacOSX.
- Hide navigation tool-bar.
- Inverted __(white)__ tool-bar button icons.
- Tool-bar settings to alter colors, sizes, borders.
- Disable some ui animations.
- Force some toolbars to appear in fullscreen mode.
- Remove title/menu/tabs toolbars background for __Windows 10__.
- Disable browsers Loop __(chat)__, Reader & Pocket features.

### Features (not on options window):

- about:preferences keeps last selected category/tab.
- Enable/disable 'Add-on Bar' __(tool-bar context menu)__.
- Toggle 'Add-on Bar' using 'Ctrl + /' btw. 'Cmd + /'
- Enable/disable 'Additional Tool-bar' __(tool-bar context menu)__.
- Spaces, Flexible spaces, Separators.
- Bookmarks menu & sidebar buttons.
- History menu & sidebar buttons.
- Additional movable reload & stop buttons.
- Movable url bar container.
- Movable __(Firefox main)__ menu button.
- Movable alltabs-button, webrtc-status-button, social-share-button.

#### Squared tabs

Default 'curved tabs' can be optionally replaced with classic 'squared tabs'. Tabs on MacOSX look more like 
Windows tabs with MacOSX colors on purpose.

#### Curved alternative tabs

All tabs are curved and use colours known from squared tabs.

#### Tabs 'not' on top

Simulates **'tabs.onTop=false'** setting and moves tabs below navigation tool-bar. On MacOSX tabs also get a
'reversed appearance'.

#### Application button / application menu settings

#### Application button on [Firefox] title-bar [Windows only]

The title-bar button is fixed on title-bars left side like on Firefox since version 4.0. It is enabled by default on 
Windows systems.

#### Application button on tool-bars

The button can also be used on tool-bars and appears like a default tool-bar button.

#### Application button colours

On tabs tool-bar and title-bar application button can be orange, blue __(Aurora), black (Nightly)__, red, green and 
gray in normal browsing mode and purple in private browsing mode like on previous Firefox versions.

####Note: 
The new appmenu is not an exact copy of the old one, but looks as original as possible. The 'splitmenu' is not 
yet restored, menuitems and submenus are placed in a row. 
The appmenu also misses some menuitems, which can not be duplicated.

#### Small navigation tool-bar buttons

Navigation tool-bar buttons get alternative margins and paddings to simulate old 'small icon view'.

#### Hide 'Navigation Tool-bar'

Hiding navigation toolbar might be interesting after all items got moved to other tool-bars.

#### 'Add-on Bar'

A tool-bar at the bottom of the window. All movable buttons and items can be placed on it. Add-on bar can 
be enabled/disabled using tool-bars context menu __(right-click on a tool-bar)__ or using 'Ctrl + /' __(Windows/Linux)__ 
btw. 'Cmd + /' __(MacOSX)__.

#### 'Additional Tool-bar'

A tool-bar between navigation tool-bar and bookmarks tool-bar. It can be enabled/disabled using tool-bars 
context menu (right-click on a tool-bar).

#### Icons + text / text only mode

Simulates old modes where text was displayed below tool-bar buttons or button icons got hidden.

#### Bookmarks menu button

A default 'menu button' which opens the 'classic' bookmarks menu. Moved to bookmarks tool-bar it also shows 
its label.

#### Bookmarks and history sidebar buttons

Buttons which toggle bookmarks and history sidebar.

#### Back-forward, reload and stop buttons

Browsers default buttons got merged with url bar and cannot be moved to different tool-bar positions or to 
different tool-bars. CTR adds duplicates of these buttons to the customization palette.

#### Combined reload-stop button

Place reload button AFTER stop button and enable the corresponding option on CTRs preference window. 
Hovering the option on preference window to get extra information. Tool-bar: [something]...[stop-button][reload-button]...[something]

#### Spaces, flexible spaces and separators

These tool-bar items appear in customizing mode and can be moved to tool-bars like on previous Firefox versions.

#### Windows - Linux - MacOSX

This add-on was tested on Windows 7 __(AeroBasic, AeroGlass, Classic)__ & 8**(.1)** & 10 & XP __(Classic, Luna-Blue/Silver/Olive, Zune, Royale)__, 
Linux Mint KDE, Ubuntu and MacOSX 10.8/10.9/10.10/10.11. On other Systems or non OS-default themes tab colors may look wrong. 
Bookmarks, history, stop, reload, back and forward toolbar buttons use default OS icons __(Firefox Windows icons on Windows systems, 
Firefox Mac icons on MacOSX and Firefox Linux icons on Linux systems)__.

#### Info, known 'issues', 'glitches', problems

- __(1)__ Application menus 'cut', 'copy' and 'paste' buttons do not always work like they should.
- __(2)__ Switching between AeroGlass and AeroBasic on Windows 7/Vista can change application buttons position, if the menubar is disabled. Maximizing/restoring browsers main window or restarting Firefox resolves the problem. This glitch is caused by Microsoft Windows and titlebars behavior and not by this add-on.
- __(3)__ Entering and leaving customizing mode 'disables' right-click menu items for bookmarks inside bookmarks menu button. A restart resolves this issue.
- __(4)__ Tab colors on MacOSX fit to current ui instead of using Firefox 28 colors. This is intended and not a bug.
- __(5)__ It is strongly recommended to remove Foxtab and Shareaholic before installing Firefox 29 or newer, because both add-ons break Firefox ui in Fx29+. Using Foxtab and/or Shareaholic with CTR causes even more errors, because CTR allows to move/remove more items than the default Firefox does.
If one of these add-ons has corrupted the ui, the add-ons manager has to be accessed via menubar __(right-click on a toolbar -> select menubar, Tools -> add-ons)__ and Shareaholic and Foxtab have to be uninstalled and CTR has to be disabled. After a browser restart, CTR can be enabled again. After another restart "restore defaults" in customizing mode has to be hit once.

Quoted from [original addons page] (https://addons.mozilla.org/en-US/firefox/addon/classicthemerestorer#addon-description) 

Note: This list was current at the time of quoting and may have changed during this time.

### Localization:

Dedicated thread for [CyberCTR Localization] (https://8pecxstudios.com/Forums/viewtopic.php?f=13&t=536)


###  To build (Platform):

- `Windows:` __CTRL + SHIFT + B__
- `Linux:` __CTRL + SHIFT + B__
- `Mac:` __CMD + SHIFT + B__


#### Task Runner (Visual Studio Code):

- `Windows:` __CTRL + SHIFT + P__
- `Linux:` __CTRL + SHIFT + P__
- `Mac:` __CMD + SHIFT + P__

| Task | Command | Result |
|----------|:-------------:|------:|
| Build | task build | Builds addon *.xpi |

##### You must set the version number in the arguments field of tasks.json when bumping the **XPI** package version.


#### Build Notes (Visual Studio Code) (Platform):

- `Windows:` You must have __python 2.7__ or higher installed to run the build script.
- `Linux:` You must on the __`build.py`__ set in its properties permissions tab, To allow execution or __`EACCESS`__ error will ensue.

### Credits:

Built from popular open source addon.
* Classic Theme Restorer by ([Aris](https://addons.mozilla.org/en-US/firefox/user/aris-t2/))
* Git repository for [Classic Theme Restorer] (https://github.com/Aris-t2/ClassicThemeRestorer)

Using popular open source projects.
* UiKit ([MIT License](http://opensource.org/licenses/MIT))
* jQuery ([MIT License](http://opensource.org/licenses/MIT))
* normalize.css ([MIT License](http://opensource.org/licenses/MIT))
* FontAwesome ([CC BY 3.0 License](http://creativecommons.org/licenses/by/3.0/))