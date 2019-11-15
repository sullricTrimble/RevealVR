// BUTTON MAPPINGS
// - https://blog.mozvr.com/input-mapping/
// - uses input-mapping-component

AFRAME.registerComponent('setup-button-mappings',
{
    schema:{},
    init: function()
    {
        console.log("setup controls");
        initMappings();
    }
});

function initMappings()
{
    let sceneEl = getScene();

    // To be exposed by the application
    let inputActions = {
        set1: {
            changeTask: { label: 'change scheme' },
            logdefault: { label: 'Test Log' },
            logtask1: { label: 'Test Log Task 1' },
            logtask2: { label: 'Test Log Task 2' },
            lefthand: { label: 'Left hand' },
            righthand: { label: 'Right hand' },
            longpress: { label: 'Long press' },
            doubletouch: { label: 'Double touch' },
            doublepress: { label: 'Double press' }
        },
        set2: {
            changeTask: { label: 'change scheme' },
            logdefault: { label: 'Test Log' },
            logtask1: { label: 'Test Log Task 1' },
            logtask2: { label: 'Test Log Task 2' }
        }
    }

    AFRAME.registerInputActions(inputActions, 'set1');
    // Could be defined by default by the app or the user, custom UI, external request, etc.
    let mappings = {
        behaviours: {
            default: {
                'vive-controls': {
                    trackpad: 'dpad'
                }
            }
        },
        mappings: {
            set1: {
                common: {
                    triggerdown: { left: 'lefthand', right: 'righthand' }
                },
                'vive-controls': {
                    'grip.down': 'changeTask',
                    'trackpad.down': 'logtask1',
                    'trackpad.doubletouch': 'doubletouch',
                    'trackpad.doublepress': 'doublepress',
                    // Activators for down, up, touchstart and touchend are optionals you can just write the event without the .
                    'trackpaddpadleftdown': 'dpadleft',
                    'trackpaddpadright.longpress': 'dpadrightlong'
                },
                'oculus-touch-controls': {
                    'abutton.down': 'changeTask',
                    'bbutton.down': 'logdefault'
                },
                'windows-motion-controls': {
                    'grip.down': 'changeTask'
                },
                keyboard: {
                    't_up': 'logdefault',
                    'c_up': 'changeTask'
                }
            },
            set2: {
                'vive-controls': {
                    'trigger.down': 'logtask2',
                    'grip.down': 'changeTask'
                },
                'oculus-touch-controls': {
                    'abutton.down': 'changeTask',
                    'bbutton.down': 'logtask1'
                },
                'windows-motion-controls': {
                    'trigger.down': 'logtask2',
                    'grip.down': 'changeTask'
                },
                keyboard: {
                    'y_up': 'logtask2',
                    'c_up': 'changeTask'
                }
            }
        }
    };
    AFRAME.registerInputMappings(mappings);

    // DEBUG
    function logButtonEvent(event) {
        let type = event.type;
        let currentMappingActions = AFRAME.inputActions[AFRAME.currentInputMapping];
        let text = currentMappingActions[type] ? currentMappingActions[type].label : type;
        console.log(text);
        drawButtonsText(text, true);
    }

    drawMappingText('Current mapping: ' + AFRAME.currentInputMapping, false);
    let keys = Object.keys(inputActions);

    sceneEl.addEventListener('changeTask', function (evt) {
        let next = (keys.indexOf(AFRAME.currentInputMapping) + 1) % keys.length;
        AFRAME.currentInputMapping = keys[next];
        drawMappingText('Current mapping: ' + AFRAME.currentInputMapping, false);
        logButtonEvent(event);
    });
    let events = ['dpadleft', 'dpadrightlong', 'dpad', 'logtask1', 'logtask2', 'logdefault', 'righthand', 'lefthand', 'doubletouch', 'doublepress', 'longpress'];
    for (let i = 0; i < events.length; i++) {
        sceneEl.addEventListener(events[i], function (event) {
            logButtonEvent(event);
        });
    }
    
}


// uses a-frame's camera.zoom property
// https://stackoverflow.com/questions/44459356/a-frame-zoom-on-wheel-scroll
// ALT:
// instead of doing zoom which zooms the entire screen, maybe scale an inverted sphere
window.addEventListener("wheel", event => {
    let delta = -Math.sign(event.deltaY);
    //getting the mouse wheel change (120 or -120 and normalizing it to 1 or -1)
    let mycam = document.getElementById('cam').getAttribute('camera');
    let finalZoom = document.getElementById('cam').getAttribute('camera').zoom + delta;
    //limiting the zoom so it doesnt zoom too much in or out
    if (finalZoom < 1)
        finalZoom = 1;
    if (finalZoom > 5)
        finalZoom = 5;

    mycam.zoom = finalZoom;
    //setting the camera element
    document.getElementById('cam').setAttribute('camera', mycam);
});


// DEBUG


let _timeoutMappingText = null;
let _timeoutButtonsText = null;

function getMappingsText() {
    return document.getElementById('textmapping');
}
function drawMappingText(message, isTimeout) {
    drawDebugButtonsText(getMappingsText(), _timeoutMappingText, message, isTimeout);
}
function drawButtonsText(message, isTimeout){
    drawDebugButtonsText(document.getElementById('textbuttons'), _timeoutButtonsText, message, isTimeout);
}

function drawDebugButtonsText(el, timeout, message, isTimeout)
{
    let textEl = el;
    if (!textEl)
        return;

    textEl.setAttribute('text', {value: message});
    clearTimeout(timeout);

    if (isTimeout)
    {
        timeout = setTimeout(() => {
            textEl.setAttribute('text', { value: '' });
        }, 1000);    
    }
}