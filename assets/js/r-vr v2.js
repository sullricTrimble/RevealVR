
// CONSTANTS
let idKey = "id";
let nameKey = "name";
let typeKey = "type";
let thumbsourceKey = "thumbsource";
let panosourceKey = "panosource";
let stationsKey = "stations";
let hotspotsKey = "hotspots";
let pathsKey = "paths";
let cacheKey = "cache";

let audioKey = "audio";
let imageKey = "image";
let sourceKey = "source";

let spotIdKey = "spotid";

let hotspotClass = "mylink";
let captionClass = "caption";

let clickSoundName = "click-sound";
let locationPin1ImageName = "location-pin1";
let locationPin2ImageName = "location-pin2";
let _generalAssets = {}; // name, assetIdName

let _sceneEl;
let _sceneData;
let _controllersConnectedCount = 0;

function getScene()
{
    if (_sceneEl === undefined)
        _sceneEl = document.querySelector('a-scene');

    return _sceneEl;
};

function loadAssets() {

    let assetGroups = _sceneData["assetgroups"];

    for (let i = 0; i < assetGroups.length; i++) {
        loadAssetSet(assetGroups[i]);
    }
};

function loadAssetSet(assetGroup) {

    let assetsEl = document.querySelector('a-assets');

    let groupName = assetGroup[nameKey];
    let isCache = assetGroup[cacheKey];
    let paths = assetGroup[pathsKey];
    let assets = assetGroup["assets"];

    let isGeneralAssetGroup = groupName.toLowerCase() === "general-assets";

    for (let i = 0; i < assets.length; i++) {

        let asset = assets[i];
        let id = asset[idKey];
        let assetName = asset[nameKey];
        let type = asset[typeKey];

        if (type === imageKey) {

            let el = document.createElement("img");
            setAttributes(el,
                {
                    id: id,
                    name: assetName,
                    src: paths[imageKey] + asset[sourceKey]
                });


            assetsEl.appendChild(el);
        } else if (type === audioKey) {

            let el = document.createElement("audio");
            setAttributes(el,
                {
                    id: id,
                    name: assetName,
                    src: paths[audioKey] + asset[sourceKey]
                });

            assetsEl.appendChild(el);
        }

        if (isGeneralAssetGroup)
            _generalAssets[assetName] = id;
    }

}

function loadScene(sceneId) {
    console.log("loadScene: ", sceneId);

    let camData = getCam(sceneId);

    // just keep the same scene if can't change scene
    if (camData === undefined)
        return;


    let camId = camData["id"];
    let camName = camData[nameKey];
    let camSrc = camData[panosourceKey];
    let hotspots = camData[hotspotsKey];

    for (let j = 0; j < hotspots.length; j++) {

        let hotspotData = hotspots[j];
        if (hotspotData[typeKey]=="camera"){
            loadCameraHotspot(camData, hotspotData);
        }
        else if (hotspotData[typeKey]=="evidence"){
            // TODO:
            let e = 0;
        }
        else if (hotspotData[typeKey]=="note"){
            // TODO:
            let n = 0;
        }

    }
};

let _camSpotColor = "yellow";
function loadCameraHotspot(camData, hotspotData)
{
    // creating the following object
    //<a-entity class="link"
    //geometry="primitive: plane; height: 1; width: 1"
    //material="shader: flat; src: ${thumb}"
    //event-set__mouseenter="scale: 1.2 1.2 1"
    //event-set__mouseleave="scale: 1 1 1"
    //event-set__click="_target: #image-360; _delay: 300; material.src: ${src}"
    //proxy-event="event: click; to: #image-360; as: fade"
    //sound="on: click; src: #click-sound"
    //change-color-on-click
    //    ></a-entity>

    let sceneEl = getScene();

    let targetCamId = hotspotData[sourceKey];

    let targetCam = getCam(targetCamId);

    let spotHgt = 0.7;
    let spotWid = 0.7;
    let hotspotEl = document.createElement('a-entity');
    hotspotEl.setAttribute('geometry',
        {
            primitive: 'plane',
            height: spotHgt,
            width: spotWid
        });


    let thumb = targetCam[thumbsourceKey];
    if (thumb === undefined || thumb === "") {
        thumb = _generalAssets[locationPin2ImageName];
    }

    hotspotEl.setAttribute('material',
        {
            shader: 'flat',
            transparent: true,
            src: "#" + thumb,
            color: "white"
            // color: _camSpotColor
            // color: "#F00"
        });

    // XYZ space is different in AFRAME space, so need to translate
    let spotPosX = hotspotData["posx"];
    let spotPosZ = -hotspotData["posy"];
    let spotPosY = hotspotData["posz"];
    hotspotEl.object3D.position.set(spotPosX, spotPosY, spotPosZ);

    // target camera at origin
    // hotspotEl.setAttribute('look-at',
    //     {
    //         //src: "#cam",
    //         src: { x: 0, y: 0, z: 0 },
    //         checkSrcEveryFrame: false
    //     });
    setLookAt(hotspotEl, new THREE.Vector3(0,0,0));

    // events

    hotspotEl.setAttribute('event-set__mouseenter',
        {
            scale: { x: 1.3, y: 1.3, z: 1 }
        });
    hotspotEl.setAttribute('event-set__mouseleave',
        {
            scale: { x: 1, y: 1, z: 1 }
        });

    let skySrc = targetCam[panosourceKey];

    // meta
    setAttributes(hotspotEl,
        {
            class: hotspotClass,
            id: camData[idKey],
            spotid: hotspotData[sourceKey]
        });

    // get child and set the visible attributes on the child?
    let x = 0;

    //hotspotEl.setAttribute('material', 'color', 'red');

    hotspotEl.addEventListener('click', function (evt) {
        // change scene
        console.log("change-scene: click()");
        let hotspotTarget = evt.target;
        let destid = hotspotTarget.getAttribute("spotid");

        if (getCam(destid) === undefined)
            return;

        clearScene();

        // click
        // TODO: if target is cam then play default sound?
        let audioEl = document.querySelector("#myClickSound");
        let audio = audioEl.components.sound;
        audio.playSound();

        let sky = document.querySelector('#image-360');
        sky.setAttribute("spotid", destid);
        sky.emit("fade");
    });

    sceneEl.appendChild(hotspotEl);

    // DEBUG
    // let captionText = targetCam["name"];
    // let p = createPanel();
    // p.setAttribute("material", "color:#F00");
    // setUpOffsetAndLookAt(hotspotEl, p, (spotHgt / 2) + .2);
    // sceneEl.appendChild(p);

    // text
    let captionText = targetCam["name"];

    let captionEl = document.createElement('a-entity');
    captionEl.setAttribute("class", captionClass);
    // captionEl.setAttribute("geometry", {
    //     primitive: "plane",
    //     width: 1,
    //     height: "auto"
    // });
    captionEl.setAttribute("material", "color:blue");

    captionEl.setAttribute("text",
    {
        align: "center",
        color: _camSpotColor,
        width: 10,
        value: captionText
    });

    // // captionEl.setPosition(spotPosX, spotPosY + (spotHgt / 2.0), spotPosZ);
    // captionEl.object3D.position.set(capPos[0], capPos[1], capPos[2]);
    // captionEl.object3D.position.set(0,0,-8);
    setUpOffsetAndLookAt(hotspotEl, captionEl, spotHgt/2 + .2);


    sceneEl.appendChild(captionEl);

    // a-text
    // let capEl = document.createElement('a-text');
    // // myCaption.setAttribute("align", "center");
    // setAttributes(capEl,
    //     {
    //         color: "blue",
    //         align: "center",
    //         baseline: "bottom",
    //         width: 10,
    //         value: captionText
    //     });
    // setUpOffsetAndLookAt(hotspotEl, capEl, spotHgt/2 + 1);
    // // capEl.object3D.position.set(0,0,-8);
    // sceneEl.appendChild(capEl);
}

function setUpOffsetDebug(srcEl)
{
        // DEBUG: create own lookat
        // let lookForward = srcEl.object3D.position.clone();
        // lookForward.normalize();
        // lookForward.multiplyScalar(-1);

        // let rotMatrix = new THREE.Matrix4().lookAt(lookForward, new THREE.Vector3(0,0,0),new THREE.Vector3(0,1,0));

        // // var qt = new THREE.Quaternion().setFromRotationMatrix(mx);
        // // var rotation = new THREE.Euler().setFromQuaternion( qt, 'XYZ');

        // let p = createPanel();
        // p.setAttribute("material", "color:#F00");
        // p.object3D.rotation.setFromRotationMatrix(rotMatrix);

        // let pPos = new THREE.Vector3(spotPosX, spotPosY, spotPosZ);
        // pPos.normalize();
        // pPos.multiplyScalar(3);
        // // p.setAttribute('position', {x: pPos.x, y: pPos.y, z: pPos.z});
        // p.object3D.position.set(pPos.x, pPos.y, pPos.z);
        // sceneEl.appendChild(p);


        // let p2 = createPanel();
        // p2.setAttribute("material", "color:#0F0");
        // p2.object3D.rotation.setFromRotationMatrix(rotMatrix);
        // let lookUp = new THREE.Vector3(0,1,0).applyMatrix4(rotMatrix).normalize();
        // lookUp.multiplyScalar(.2); // 1/2 of height of src + 1/2 of height of target
        // p2.object3D.position.set(pPos.x + lookUp.x, pPos.y + lookUp.y, pPos.z + lookUp.z);
        // sceneEl.appendChild(p2);
}

function setLookAt(srcEl, targetPosition)
{
    // let lookForward = sourcePosition.clone();
    let lookForward = srcEl.object3D.position.clone();
    lookForward.sub(targetPosition);
    lookForward.normalize();
    lookForward.multiplyScalar(-1);
    let rotMatrix = new THREE.Matrix4().lookAt(lookForward, new THREE.Vector3(0,0,0),new THREE.Vector3(0,1,0));

    srcEl.object3D.rotation.setFromRotationMatrix(rotMatrix);
}

// places targetEl(a-entity) in the up-vector direction of srcEl(a-entity) by reUpOffset(float) amount
function setUpOffsetAndLookAt(srcEl, targetEl, relUpOffset)
{
    // assuming srcEl is relative to 0,0,0
    let srcPos = srcEl.object3D.position.clone();
    let lookForward = srcPos.clone();
    let distance = srcPos.length();
    lookForward.normalize();
    lookForward.multiplyScalar(-1);

    let rotMatrix = new THREE.Matrix4().lookAt(lookForward, new THREE.Vector3(0,0,0),new THREE.Vector3(0,1,0));

    // var qt = new THREE.Quaternion().setFromRotationMatrix(mx);
    // var rotation = new THREE.Euler().setFromQuaternion( qt, 'XYZ');

    let pPos = new THREE.Vector3(srcPos.x, srcPos.y, srcPos.z);
    pPos.normalize();
    pPos.multiplyScalar(distance*0.95);

    targetEl.object3D.rotation.setFromRotationMatrix(rotMatrix);
    let lookUp = new THREE.Vector3(0,1,0).applyMatrix4(rotMatrix).normalize();
    lookUp.multiplyScalar(relUpOffset); // 1/2 of height of src + 1/2 of height of target
    targetEl.object3D.position.set(pPos.x + lookUp.x, pPos.y + lookUp.y, pPos.z + lookUp.z);
}

function createPanel()
{
    let p = document.createElement('a-entity');
    // p.setAttribute('geometry',
    //     {
    //         primitive: 'box',
    //         height: .3,
    //         width: .3,
    //         depth: 0
    //     });
    p.setAttribute('geometry',
    {
        primitive: 'plane',
        height: .4,
        width: .4
    });
    p.setAttribute('material',
    {
        shader: 'flat',
        // transparent: true,
        color: "#F00"
        // opacity: 1
    });

    return p;
}

function getCam(id) {

    let cams = _sceneData[stationsKey];
    let camData = undefined;
    for (let i = 0; i < cams.length; i++) {

        if (cams[i][idKey] === id) {
            //console.log("loadScene: found id");
            camData = cams[i];

            break;
        }
    }

    return camData;
}

function setAttributes(el, attributes) {
    Object.keys(attributes).forEach(key => el.setAttribute(key, attributes[key]));
}

function clearScene() {

    let sceneEl = getScene();

    console.log("> clearing scene");

    let classTypes = [hotspotClass, captionClass];
    let numRemoved = 0;    
    for (let i=0; i<classTypes.length; i++)
    {
        let classType = classTypes[i];
        let links = sceneEl.querySelectorAll('.' + classType);

        numRemoved += removeItems(links);

        console.log(classType + " cleared: " + numRemoved);
    }
}
function removeItems(items)
{
    let numRemoved = 0;
    for (let i = 0; i < items.length; i++) {
        // items[i].parentNode.removeChild(items[i]);
        if (removeItem(items[i]))
            numRemoved++;

        let x = 0;
    }

    return numRemoved;
}
function removeItem(item)
{
    if (item != undefined)
    {
        item.parentNode.removeChild(item);
        return true;
    }
    return false;
}

// init scene
// TODO: move to something.js
AFRAME.registerComponent('sceneinit',
    {
        schema: {},
        init: function () {

            $.getJSON("userdata/scene.json",
                function (data) {

                    console.log("scene init: try load json");

                    _sceneData = data;

                    let version = data["version"];
                    let initial = data["initial"];

                    console.log("scene init: json success");

                    loadAssets();

                    // DEBUG
                    addCompass();

                    // initial scene

                    let sceneEl = getScene();

                    // set initial sky
                    let camInit = getCam(initial);
                    if (camInit == undefined) {
                        let cams = _sceneData[stationsKey];
                        camInit = cams[0];
                    }

                    let initialSky = camInit[panosourceKey];
                    let sky = document.querySelector('#image-360');
                    sky.setAttribute("src", "#" + initialSky);

                    // listen to sky animations
                    sky.addEventListener("animationcomplete__fade",
                        function (evt) {
                            console.log("sky fade");
                            let e = evt;
                            let name = evt.detail.name;

                            let spotid = this.getAttribute(spotIdKey);

                            let skyAssetId = getCam(spotid)[panosourceKey];
                            this.setAttribute("src", "#" + skyAssetId);
                            let x = 0;
                        });
                    sky.addEventListener("animationcomplete__fadeback",
                        function (evt) {
                            console.log("sky fadeback");
                            let e = evt;
                            let name = evt.detail.name;

                            let spotid = this.getAttribute(spotIdKey);
                            loadScene(spotid);
                            let x = 0;
                        });

                    // set click sound
                    let soundAssetKey = _generalAssets["click-sound"];
                    let clickSoundEl = document.createElement('a-sound');
                    setAttributes(clickSoundEl, {
                        id: "myClickSound",
                        src: "#" + soundAssetKey
                    });
                    sceneEl.appendChild(clickSoundEl);

                    loadScene(initial);
                });
        }
    });





// laser tests

// AFRAME.registerComponent('intersect-color-change', {
//     init: function () {
//         var el = this.el;
//         var material = el.getAttribute('material');
//         var initialColor = material.color;
//         var self = this;

//         el.addEventListener('mousedown', function (evt) {
//             el.setAttribute('material', 'color', '#EF2D5E');
//         });

//         el.addEventListener('mouseup', function (evt) {
//             el.setAttribute('material', 'color', self.isMouseEnter ? '#24CAFF' : initialColor);
//         });

//         el.addEventListener('mouseenter', function () {
//             el.setAttribute('material', 'color', '#24CAFF');
//             self.isMouseEnter = true;
//         });

//         el.addEventListener('mouseleave', function () {
//             el.setAttribute('material', 'color', initialColor);
//             self.isMouseEnter = false;
//         });
//     }
// });


// DEBUG functions

// log
// TODO: move to log.js
AFRAME.registerComponent('log',
    {
        schema: { type: 'string' },
        init: function () {
            let stringToLog = this.data;
            console.log(stringToLog);
        }
    });

AFRAME.registerComponent('change-color-on-click', 
    {
    // Could use a schem to preserve the color! then simply change it on update
    // if clicked?
    init: function () {
        let COLORS = [
            'pink',
            //'blue',
            'yellow',
            'red',
            'peachpuff',
            '#2EAFAC',
            '#BAE'];
        this.el.addEventListener('click', function (evt) {
            let randomIndex = Math.floor(Math.random() * COLORS.length);
            let newColor = COLORS[randomIndex];
            this.setAttribute('material', 'color', newColor);
            //console.log('I was clicked at: ', evt.detail.intersection.point, "and my new color is: ", newColor);
            //console.log(evt);

            let id1 = evt.target.parentEl.id;

            let x = 0;

        });
    }
    });

function addCompass() {

    let sceneEl = getScene();

    let delta = 9.5;

    let n = createBox();
    n.setAttribute('material', 'color:red');
    n.setAttribute('position', { x: 0, y: 0, z: -delta });
    n.setAttribute('rotation', { x: 0, y: 0, z: 45 });
    sceneEl.appendChild(n);

    let e = createBox();
    e.setAttribute('material', 'color:green');
    e.setAttribute('position', { x: delta, y: 0, z: 0 });
    e.setAttribute('rotation', { x: 45, y: 0, z: 0 });
    sceneEl.appendChild(e);

    let s = createBox();
    s.setAttribute('material', 'color:blue');
    s.setAttribute('position', { x: 0, y: 0, z: delta });
    s.setAttribute('rotation', { x: 0, y: 0, z: 45 });
    sceneEl.appendChild(s);

    let w = createBox();
    w.setAttribute('material', 'color:yellow');
    w.setAttribute('position', { x: -delta, y: 0, z: 0 });
    w.setAttribute('rotation', { x: 45, y: 0, z: 0 });
    sceneEl.appendChild(w);

}

function createBox() {
    let el = document.createElement('a-box');
    el.setAttribute('geometry',
        {
            primitive: 'box',
            height: .3,
            width: .3,
            depth: .3
        });
    el.setAttribute('material',
        {
            shader: 'flat',
            //src: "#city-thumb"
            color: 'red'
        });

    el.setAttribute('class', 'myBox');

    return el;
}

let _timeoutGeneralText = null;

function drawGeneralText(message, isTimeout)
{
    drawDebuggingText(document.getElementById('textgen'), _timeoutGeneralText, message, isTimeout);
}
function drawDebuggingText(el, timeout, message, isTimeout)
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


