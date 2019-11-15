        let idKey = "id";
        let nameKey = "name";
        let typeKey = "type";
        let thumbsourceKey = "thumbsource";
        let panosourceKey = "panosource";
        let stationsKey = "stations";
        let hotspotsKey = "hotspots";
        let targetKey = "target";
        let pathsKey = "paths";
        let cacheKey = "cache";

        let audioKey = "audio";
        let imageKey = "image";
        let sourceKey = "src";

        let spotIdKey = "spotid";

        let clickSoundName = "click-sound";
        let locationPin1ImageName = "location-pin1";
        let locationPin2ImageName = "location-pin2";
        let _generalAssets = {}; // name, assetIdName

        let _sceneData;
 
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

            // load scene
            clearScene();

            let sceneEl = document.querySelector('a-scene');

            let camId = camData["id"];
            let camName = camData[nameKey];
            let camSrc = camData[panosourceKey];
            let hotspots = camData[hotspotsKey];

            for (let j = 0; j < hotspots.length; j++) {

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

                let targetCamId = hotspots[j][targetKey];
                let targetCam = getCam(targetCamId);

                let hotspotEnt = document.createElement('a-entity');
                //hotspotEnt.setAttribute('template', "src: #mylink"); // not working
                hotspotEnt.setAttribute('geometry',
                    {
                        primitive: 'plane',
                        height: .5,
                        width: .5
                    });
                hotspotEnt.setAttribute('look-at',
                    {
                        //src: "#cam",
                        src: { x: 0, y: 0, z: 0},
                        checkSrcEveryFrame: false
                    });

                let thumb = targetCam[thumbsourceKey];
                if (thumb === undefined || thumb === "") {
                    thumb = _generalAssets[locationPin2ImageName];
                }

                hotspotEnt.setAttribute('material',
                    {
                        shader: 'flat',
                        transparent: true,
                        src: "#" + thumb
                        //color: "#F00"
                    });

                //let spotPosArr = hotspots[j]["pos"].split(' ');
                //hotspotEnt.setAttribute('position', { x: spotPosArr[0], y: spotPosArr[1], z: spotPosArr[2] });
                let spotPosX = hotspots[j]["posx"];
                let spotPosY = hotspots[j]["posy"];
                let spotPosZ = hotspots[j]["posz"];
                hotspotEnt.setAttribute('position', { x: spotPosX, y: spotPosZ, z: -spotPosY });

                //let spotRotArr = hotspots[j]["rot"].split(' ');
                //hotspotEnt.setAttribute('rotation', { x: spotRotArr[0], y: spotRotArr[1], z: spotRotArr[2] });

                // events

                //hotspotEnt.setAttribute('cursor',
                //    {
                //        fuse: true
                //    });

                hotspotEnt.setAttribute('event-set__mouseenter',
                    {
                        scale: { x: 1.3, y: 1.3, z: 1 }
                    });
                hotspotEnt.setAttribute('event-set__mouseleave',
                    {
                        scale: { x: 1, y: 1, z: 1 }
                    });
                //hotspotEnt.setAttribute('sound',
                //    {
                //        on: "click",
                //        src: "#click-sound"
                //    });

                let skySrc = targetCam[panosourceKey];

                //hotspotEnt.setAttribute('event-set__click',
                //    {
                //        event: "_target: #image-360",
                //        _delay: 300,
                //        material: "src: #" + targetCam["src"]
                //    });
                //hotspotEnt.setAttribute('proxy-event',
                //    {
                //        event: "click",
                //        to: "#image-360",
                //        as: "fade"
                //    });


                // meta
                setAttributes(hotspotEnt,
                    {
                        class: "mylink",
                        id: camData[idKey],
                        spotid: hotspots[j][targetKey] 
                    });

                // get child and set the visible attributes on the child?
                let x = 0;
                
                //hotspotEnt.setAttribute('material', 'color', 'red');

                hotspotEnt.addEventListener('click', function (evt) {
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

                sceneEl.appendChild(hotspotEnt);

            }
        };

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

            let sceneEl = document.querySelector('a-scene');
            let links = sceneEl.querySelectorAll('.mylink');
            console.log("hello clearScene");


            let numRemoved = 0;
            for (let i = 0; i < links.length; i++) {
                links[i].parentNode.removeChild(links[i]);

                numRemoved++;

                let x = 0;
            }

            console.log("entities cleared: ", numRemoved);

        }

        // init scene
        // TODO: move to something.js
        AFRAME.registerComponent('sceneinit',
        {
            schema: {},
            init: function() {

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

                        let sceneEl = document.querySelector('a-scene');

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
                            function(evt) {
                                console.log("sky fade");
                                let e = evt;
                                let name = evt.detail.name;

                                let spotid = this.getAttribute(spotIdKey);

                                let skyAssetId = getCam(spotid)[panosourceKey];
                                this.setAttribute("src", "#" + skyAssetId);
                                let x = 0;
                            });
                        sky.addEventListener("animationcomplete__fadeback",
                            function(evt) {
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
        
        // uses a-frame's camera.zoom property
        // https://stackoverflow.com/questions/44459356/a-frame-zoom-on-wheel-scroll
        // ALT:
        // intead of doing zoom which zooms the entire screen, maybe scale an inverted sphere

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
        

        // DEBUG functions
        
        // log
        // TODO: move to log.js
        AFRAME.registerComponent('log',
            {
                schema: { type: 'string' },
                init: function() {
                    let stringToLog = this.data;
                    console.log(stringToLog);
                }
            });

        AFRAME.registerComponent('change-color-on-click', {
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

            let sceneEl = document.querySelector('a-scene');

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