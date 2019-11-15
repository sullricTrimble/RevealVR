// DETECT CONTROLLER TYPE
// https://github.com/chenzlabs/auto-detect-controllers/
// - modified 
//   - removes gaze cursor if controllers detected
//   - uses laser-controls instead of tracked-controls
// - TODO:
//   > use 'controllerconnected' / 'controllerdisconnected' events instead of a timer (see aframe-input-mapping-component.min.js)
//   > reconnect disconnected controllers. 

let _cursorColor = "white";
let _cursorIntersectedColor = "springgreen";
let _rayCasterObjects = ".mylink"; // "objects: .link,.mylink"

AFRAME.registerComponent("auto-detect-controllers", {
    schema: {
        hand: { type: "string", default: "right" },
        trackedcontrols: { type: "boolean", default: false },
        model: { type: "boolean", default: true },
        singlehand: { type: "string", default: "right" }
    },

    init: function () {
        var el = this.el;
        var self = this;
        this.rescheduleCheck = true;
        this.injectedControls = false;
        this.checkControllerType = this.checkControllerType.bind(this);
        this.rescheduleControllerTypeCheck = this.rescheduleControllerTypeCheck.bind(
            this
        );
        // allow mock for testing
        this.getGamepads = function () {
            return navigator.getGamepads && navigator.getGamepads();
        };
    },

    update: function () {
        var data = this.data;
        var el = this.el;
        // TODO
    },

    play: function () {
        this.rescheduleControllerTypeCheck();
    },

    pause: function () {
        this.rescheduleCheck = false;
        if (this.rescheduleCheckTimeout) {
            clearTimeout(this.rescheduleCheckTimeout);
            delete this.rescheduleCheckTimeout;
        }
    },

    injectOculusTouch: function () {
        // var component = this.data.trackedcontrols ? 'tracked-controls' : 'oculus-touch-controls';
        // var options = '';
        // if (this.data.trackedcontrols) {
        //     options += 'id:Oculus Touch ' + (this.data.hand === 'left' ? '(Left)' : '(Right)');
        //     options += ';controller:0';
        // } else {
        //     options += 'model:' + this.data.model;
        // }
        // options += ';hand:' + this.data.hand; // although tracked-controls doesn't use this yet
        // this.el.setAttribute(component, options);

        let component = "laser-controls";
        let options = "id:" + (this.data.hand === "left" ? "lefthand" : "righthand");
        options += ";controller:0";
        options += ";hand:" + this.data.hand; // although tracked-controls doesn't use this yet
        this.el.setAttribute(component, options);

        setCommonControllerProperties(this.el);

        this.injectedControls = true;
    },

    injectVive: function () {
        // var component = this.data.trackedcontrols ? 'tracked-controls' : 'vive-controls';
        // var options = '';
        // if (this.data.trackedcontrols) {
        //     options += 'id:OpenVR Gamepad';
        //     options += ';controller:' + (this.data.hand === 'left' ? 1 : 0);
        // } else {
        //     options += 'model:' + this.data.model;
        // }
        // options += ';hand:' + this.data.hand; // although tracked-controls doesn't use this yet
        // this.el.setAttribute(component, options);

        let component = "laser-controls";
        let options = "id:" + (this.data.hand === "left" ? "lefthand" : "righthand");
        options += ";controller:" + (this.data.hand === "left" ? 1 : 0);
        options += ";hand:" + this.data.hand; // although tracked-controls doesn't use this yet
        this.el.setAttribute(component, options);

        this.injectedControls = true;
    },

    injectGearVR: function () {
        if (this.data.hand === this.data.singlehand) {
            // this.el.setAttribute("gearvr-controls", "hand", this.data.hand);

            let component = "laser-controls";
            let options = "id: righthand";
            options += ";hand:" + this.data.hand;
            this.el.setAttribute(component, options);
        }
        this.injectedControls = true;
    },

    checkControllerType: function () {
        if (this.injectedControls || !this.getGamepads) {
            return;
        }

        var gamepads = this.getGamepads();
        if (gamepads) {
            for (var i = 0; i < gamepads.length; i++) {
                var gamepad = gamepads[i];
                if (gamepad) {
                    if (gamepad.id.indexOf("Oculus") === 0) {
                        this.injectOculusTouch();

                        clearCursor();

                        break;
                    }
                    if (gamepad.id.indexOf("OpenVR") === 0) {
                        this.injectVive();

                        clearCursor();

                        break;
                    }
                }
            }
        }

        if (
            AFRAME.utils.gearVRControls &&
            AFRAME.utils.gearVRControls.isControllerPresent()
        ) {
            this.injectGearVR();

            clearCursor();
        }
    },

    rescheduleControllerTypeCheck: function () {
        this.checkControllerType();

        this.rescheduleCheck = !this.injectedControls;
        if (this.rescheduleCheck) {
            let sceneEl = getScene();
            let cursor = sceneEl.querySelector("#cursor");
            if (!cursor) {
                console.log("added cursor");
                cursor = createCursorController();
                let camEl = sceneEl.querySelector("#cam");
                camEl.appendChild(cursor);
            }

            this.rescheduleCheckTimeout = setTimeout(
                this.rescheduleControllerTypeCheck,
                1000
            );
        }
    }
});


function setCommonControllerProperties(elController)
{
    // <a-entity id="lefthand"
    //     laser-controls="hand: left"
    //     raycaster="objects: .mylink; far: 100"
    //     line="color: green; opacity:0.75"></a-entity>

    let el = elController;
    el.setAttribute("line", {
        color: _cursorColor,
        opacity: "0.75"
    });

    el.setAttribute("raycaster", {
        objects: _rayCasterObjects,
        far: 100
    });

    el.addEventListener("raycaster-intersection", function(evt)
    {
        el.setAttribute("line", "color:" + _cursorIntersectedColor);
    });
    el.addEventListener("raycaster-intersection-cleared", function(evt)
    {
        el.setAttribute("line", "color:" + _cursorColor);
    });
}

function createCursorController() {
    // <a-cursor id="cursor"
    //           event-set__mouseenter="_event: mouseenter; color: springgreen"
    //           event-set__mouseleave="_event: mouseleave; color: black"
    //           color="black"
    //           fuse="true"
    //           raycaster="objects: .link,.mylink"></a-cursor>

    let el = document.createElement("a-cursor");

    setAttributes(el, {
        id: "cursor",
        color: _cursorColor,
        fuse: true
    });

    el.setAttribute("raycaster", {
        objects: _rayCasterObjects
    });

    el.setAttribute("event-set__mouseenter", {
        _event: "mouseenter",
        color: _cursorIntersectedColor
    });
    el.setAttribute("event-set__mouseleave", {
        _event: "mouseleave",
        color: _cursorColor
    });

    return el;
}

function clearCursor() {
    let sceneEl = getScene();
    let cursor = sceneEl.querySelector("#cursor");
    removeItem(cursor);
}

// AFRAME.registerComponent('detect-controllers',
// {
//     init: function()
//     {
//         var el = this.sceneEl;

//         el.addEventListener('controllerconnected', function(evt)
//         {
//             _controllersConnectedCount = _controllersConnectedCount + 1;
//             refreshControllers();
//         });
//         el.addEventListener('controllerdisconnected', function(evt)
//         {
//             _controllersConnectedCount = _controllersConnectedCount - 1;
//             refreshControllers();
//         });
//     }
// });
// function refreshControllers()
// {
//     console.log("detected controllers: " + _controllersConnectedCount);

//     if (_controllersConnectedCount === 0)
//     {
//         clearCursor();

//         var cursor = createCursorController();
//         let sceneEl = getScene();

//         let camEl = sceneEl.querySelector('#cam')
//         camEl.appendChild(cursor);
//     }
//     else if (_controllersConnectedCount > 0)
//     {
//         clearCursor();

//         var right = createLaserController();
//         right.setAttribute("id", "righthand");
//         right.setAttribute("laser-controls", "hand: right");
//         var left = createLaserController();
//         left.setAttribute("id", "lefthand");
//         left.setAttribute("laser-controls", "hand: left");

//         let sceneEl = getScene();
//         sceneEl.appendChild(right);
//         sceneEl.appendChild(left);
//     }
// }







