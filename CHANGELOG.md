# 4.3.4
- Added key actions on trigger zooming and moving on key events
- Added methods: centralize, manualMove, manualZoom
- New props: 
|centered|no|centralize content in visible area|false|
|key-actions|no|enable key press events for zooming and moving|false|
|tabindex|no|tabindex attribute for the visible area|0 if keyActions enabled, value is required for key events|
|key-zoom-velocity|no|zoom velocity when zooming by key events|0.2|
|key-move-velocity|no|move velocity when moving by key events|10|
|key-controls|no|Records of keyCode and actions|See PinchScrollZoomDefaultControls ('+', '-', arrows)|

# 4.3.5
- Fixed a bug: The setData method does not respect within props
- Added using translate3d transformation