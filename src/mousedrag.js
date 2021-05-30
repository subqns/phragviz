function init(id) {
    mouseCtrl(id, getFloatCtrl, scaledIntCtrl);
}

function getFloatCtrl(o) { return(parseFloat(o.value)); }
function getIntCtrl(o) { return(parseInt(o.value)); }

function mouseCtrl(n, getCtrl, setCtrl) {
    var ctrl; // DOM object for the input control
    var startpos; // starting mouse position
    var startval; // starting input control value
    // find the input element to allow mouse control on
    ctrl = document.getElementById(n);
    console.log([ctrl,n])
    // on mousedown start tracking mouse relative position
    ctrl.onmousedown = function(e) {
	startpos = e.clientX;
	startval = getCtrl(ctrl);
	if (isNaN(startval)) startval = 0;
	document.onmousemove = function(e) {
	    var delta = Math.ceil(e.clientX - startpos);      
	    setCtrl(ctrl, startval, delta);
	};
	document.onmouseup = function() {
	    document.onmousemove = null; // remove mousemove to stop tracking
	};
    };
    /*
      ctrl.addEventListener('touchstart', function(e) {
      e.preventDefault();
      startpos = e.touches[0].pageX;
      startval = getCtrl(ctrl);
      }, false);
      ctrl.addEventListener('touchmove', function(e) {
      e.preventDefault();
      var delta = Math.ceil(e.touches[0].clientX - startpos);        
      setCtrl(ctrl, startval, delta);
      }, false);
    */
}

// takes current value and relative mouse coordinate as arguments
function scaledIntCtrl(o, i, x) {
    var incVal = Math.round(Math.sign(x) * Math.pow(Math.abs(x)/10, 1.6));
    var newVal = i + incVal;
    if (newVal < 0) newVal = 0;
    if (Math.abs(incVal)>1) o.value = newVal; // allow small deadzone
    o.dispatchEvent(new Event('change'));
}

export { init }
