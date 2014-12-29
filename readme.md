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

- Button color Aurora (Light).
- Button color Cyberfox (Default Cyberfox Button Color).
- Button color Green (Dark).
- Button color Orange (Dark).
- Button color Red (Dark).
- Button color Salmon.

### Shipped Pre-Sets:

- Australis pre-set

### Additional Features:

- Pre-Configure CyberCTR Settings [FAQ article] (https://8pecxstudios.com/Forums/viewtopic.php?f=8&t=672)
- Pre-Configure CyberCTR Settings file change detection & notification.
- Tab text in title-bar.

Plus many under the hood changes and many more visual changes to come.

### Main features (on options window):


- Tab appearance: Squared classic tabs
- Tab appearance: Curved tabs (all colored and visible)
- Tabs not on top + [tabsontop="false/true"] attribute
- Tabs min/max-width settings
- Tab close on all tabs, active tab, tool-bars start/end
- Custom colors for tab backgrounds, text and text shadow
- Application button on tool-bars
- Application button on title-bar [Windows only]
- Custom application button colors
- Small navigation tool-bar buttons
- Movable back-forward button
- Star button in url bar
- Feed button in url bar
- Movable status-bar panel
- Combine stop & reload buttons
- Hide url bars stop & reload buttons
- Hide private browsing mask
- Find bar on top & at the bottom
- 'Icons & Text' and 'Text only' modes
- Add [iconsize="large"]/[iconsize="small"] attributes to #nav-bar element
- Compact panel menus (bookmarks, history...)
- Green/blue identity-box colors for verified websites
- Replace context icons with labels
- Restore tabs empty favicon
- Replace generic favicon (empty and dotted) with sheet favicon
- Favicon in url bars identity box (url bars left)
- Different padlock icons
- Hide navigation tool-bar
- Inverted (white) tool-bar button icons
- Double click on tabs tool-bar opens a 'new' tab
- Hide tabs tool-bar with one visible tab
- Tool-bar settings to alter colors, sizes, borders
- Disable unneeded animations

### Features (not on options window):

- Enable/disable 'Add-on Bar' (tool-bar context menu)
- Toggle 'Add-on Bar' using 'Ctrl + /' btw. 'Cmd + /'
- Enable/disable 'Additional Tool-bar' (tool-bar context menu)
- Spaces, Flexible spaces, Separators
- Activity indicator on tool-bars (v1.2.4+)
- Bookmarks menu & sidebar buttons
- History menu & sidebar buttons
- Additional movable reload & stop buttons
- Movable url bar container
- Movable (Firefox main) menu button
- Movable alltabs-button, webrtc-status-button, social-share-button

#### Squared tabs

Default 'curved tabs' can be optionally replaced with classic 'squared tabs'. Tabs on MacOSX look more like 
Windows tabs with MacOSX colors on purpose.

#### Curved alternative tabs

All tabs are curved and use colours known from squared tabs.

#### Tabs 'not' on top

Simulates 'tabs.onTop=false' setting and moves tabs below navigation tool-bar. On MacOSX tabs also get a
'reversed appearance'.

#### Application button / application menu settings

#### Application button on [Firefox] title-bar [Windows only]

The title-bar button is fixed on title-bars left side like on Firefox since version 4.0. It is enabled by default on 
Windows systems.

#### Application button on tool-bars

The button can also be used on tool-bars and appears like a default tool-bar button.

#### Application button colours

On tabs tool-bar and title-bar application button can be orange, blue (Aurora), black (Nightly), red, green and 
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
be enabled/disabled using tool-bars context menu (right-click on a tool-bar) or using 'Ctrl + /' (Windows/Linux) 
btw. 'Cmd + /' (MacOSX).

#### 'Additional Tool-bar'

A tool-bar between navigation tool-bar and bookmarks tool-bar. It can be enabled/disabled using tool-bars 
context menu (right-click on a tool-bar).

#### Icons + text / text only mode

Similates old modes where text was displayed below tool-bar buttons or button icons got hidden.

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

#### Spaces, flexible spaces ans separators

These tool-bar items appear in customizing mode and can be moved to tool-bars like on previous Firefox versions.

Quoted from [original addons page] (https://addons.mozilla.org/en-US/firefox/addon/classicthemerestorer#addon-description) 

Note: This list was current at the time of quoting and may have changed during this time.

### Credits:

Built from popular open source addon.
* Classic Theme Restorer by ([Aris](https://addons.mozilla.org/en-US/firefox/user/aris-t2/))
* Git repository for [Classic Theme Restorer] (https://github.com/Aris-t2/ClassicThemeRestorer)

Using popular open source projects.
* UiKit ([MIT License](http://opensource.org/licenses/MIT))
* jQuery ([MIT License](http://opensource.org/licenses/MIT))
* normalize.css ([MIT License](http://opensource.org/licenses/MIT))
* FontAwesome ([CC BY 3.0 License](http://creativecommons.org/licenses/by/3.0/))