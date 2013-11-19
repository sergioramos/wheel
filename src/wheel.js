var mousewheel = require('mousewheel')

var nullLowestDeltaTimeout, lowestDelta
var callbacks = {}


module.exports.bind = function (el, callback, capture) {
  var handle = function (ev) {
    var delta = 0
    var absDelta = 0
    var deltaX = 0
    var deltaY = 0

    // Old school scrollwheel delta
    if('detail' in ev)
      deltaY = ev.detail * -1
    if('wheelDelta' in ev)
      deltaY = ev.wheelDelta
    if('wheelDeltaY' in ev)
      deltaY = ev.wheelDeltaY
    if('wheelDeltaX' in ev)
      deltaX = ev.wheelDeltaX * -1

    // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
    if ('axis' in ev && ev.axis === ev.HORIZONTAL_AXIS) {
      deltaX = deltaY * -1;
      deltaY = 0;
    }

    // Set delta to be deltaY or deltaX if deltaY is 0 for backwards compatabilitiy
    delta = deltaY === 0 ? deltaX : deltaY;

    // New school wheel delta (wheel event)
    if('deltaY' in ev) {
      deltaY = ev.deltaY * -1;
      delta  = deltaY;
    }
    if('deltaX' in ev) {
      deltaX = ev.deltaX;
      if(deltaY === 0) delta  = deltaX * -1
    }

    // No change actually happened, no reason to go any further
    if(deltaY === 0 && deltaX === 0) return

    // Store lowest absolute delta to normalize the delta values
    absDelta = Math.max(Math.abs(deltaY), Math.abs(deltaX))
    if (!lowestDelta || absDelta < lowestDelta)
      lowestDelta = absDelta

    // Get a whole, normalized value for the deltas
    delta  = Math[delta >= 1 ? 'floor' : 'ceil'](delta/lowestDelta)
    deltaX = Math[deltaX >= 1 ? 'floor' : 'ceil'](deltaX/lowestDelta)
    deltaY = Math[deltaY >= 1 ? 'floor' : 'ceil'](deltaY/lowestDelta)

    // Clearout lowestDelta after sometime to better
    // handle multiple device types that give different
    // a different lowestDelta
    // Ex: trackpad = 3 and mouse wheel = 120
    function nullLowestDelta() {
      lowestDelta = null;
    }

    if(nullLowestDeltaTimeout) clearTimeout(nullLowestDeltaTimeout)
    nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200)


    callback({
      original: ev,
      delta: delta,
      absDelta: absDelta,
      deltaX: deltaX,
      deltaY: deltaY
    })
  }

  mousewheel.bind(el, handle, capture)
  callbacks[callback] = handle
}

module.exports.unbind = function (el, callback, capture) {
  if(!callbacks[callback]) return
  mousewheel.unbind(el, callbacks[callback], capture)
}