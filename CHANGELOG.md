# 4.3.2
- Added key actions on trigger zooming and moving on key events
- Added methods: centralize, manualMove, manualZoom
- New props: 
|centred|no|centralize content in visible area|false|
|key-actions|no|enable key press events for zooming and moving|false|
|tabindex|no|tabindex attribute for the visible area|0 if keyActions enabled, value is required for key events|
|key-zoom-velocity|no|zoom velocity when zooming by key events|0.2|
|key-move-velocity|no|move velocity when moving by key events|10|
|key-controls|no|Records of keyCode and actions|See PinchScrollZoomDefaultControls ('+', '-', arrows)|

