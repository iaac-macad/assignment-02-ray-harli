// Import libraries here...
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { Rhino3dmLoader } from 'three/addons/loaders/3DMLoader.js'
import { HDRCubeTextureLoader } from 'three/addons/loaders/HDRCubeTextureLoader.js';

// declare variables to store scene, camera, and renderer
let scene, camera, renderer
const model = 'base_model.3dm'
window.addEventListener('click', onClick);
const mouse = new THREE.Vector2()

// call functions
init()
animate()

// function to setup the scene, camera, renderer, and load 3d model
function init () {

    // Rhino models are z-up, so set this as the default
    // THREE.Object3D.DefaultUp = new THREE.Vector3( 0, 0, 1 )

    // create a scene and a camera
    scene = new THREE.Scene()
    scene.background = new THREE.Color(1,1,1)
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
    camera.position.z = 30

    // create the renderer and add it to the html
    renderer = new THREE.WebGLRenderer( { antialias: true } )
    renderer.setSize( window.innerWidth, window.innerHeight )
    document.body.appendChild( renderer.domElement )

    // add some controls to orbit the camera
    const controls = new OrbitControls( camera, renderer.domElement )

    // add a directional light
    const directionalLight = new THREE.DirectionalLight( 0xffffff )
    directionalLight.intensity = 2
    scene.add( directionalLight )

    //////////////////////////////////////////////
    // load materials and cube maps

    let material, cubeMap

    // load a pbr material
    const tl = new THREE.TextureLoader()
    tl.setPath('materials/PBR/streaked-metal1/')
    material = new THREE.MeshPhysicalMaterial()
    material.map          = tl.load('streaked-metal1_base.png')
    material.aoMmap       = tl.load('streaked-metal1_ao.png')
    material.normalMap    = tl.load('streaked-metal1_normal.png')
    material.metalnessMap = tl.load('streaked-metal1_metallic.png')
    material.metalness = 0.2
    material.roughness = 0.0

    // or create a material
    // material = new THREE.MeshStandardMaterial( {
    //     color: 0xffffff,
    //     metalness: 0.0,
    //     roughness: 0.0
    // } )

    // load hdr cube map
    // cubeMap = new HDRCubeTextureLoader()
    //     .setPath( './textures/cube/pisaHDR/' )
    //     .setDataType( THREE.HalfFloatType )
    //     .load( [ 'px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr' ] )
    
    // or, load cube map
    cubeMap = new THREE.CubeTextureLoader()
        .setPath('./skybox/')
        .load( [ 'right.jpg', 'left.jpg', 'top.jpg', 'bottom.jpg', 'front.jpg', 'back.jpg' ] )
    
    scene.background = cubeMap
    material.envMap = scene.background

    //////////////////////////////////////////////
// Get the slider element
const scaleSlider = document.getElementById("scale-slider");

// load the model
    const loader = new Rhino3dmLoader()
    loader.setLibraryPath( 'https://cdn.jsdelivr.net/npm/rhino3dm@7.11.1/' )

    loader.load( model, function ( object ) {

// Apply the scale value from the slider to the 3D model
     scaleSlider.addEventListener("input", function() {
    object.scale.set(scaleSlider.value, scaleSlider.value, scaleSlider.value);
  });



    // load the model
    // const loader = new Rhino3dmLoader()
    // loader.setLibraryPath( 'https://cdn.jsdelivr.net/npm/rhino3dm@7.11.1/' )

    // loader.load( model, function ( object ) {

        //////////////////////////////////////////////
        // apply material to meshes

        object.traverse( function (child) { 
            if (child.isMesh) {
                child.material = material
                // couldn't get cube map to work with DefaultUp so rotate objects instead
                child.rotateX(-0.5 * Math.PI)
            }
        }, false)

        //////////////////////////////////////////////

        scene.add( object )

        // hide spinner when model loads
        // document.getElementById('loader').remove()

    } )

}

function onClick( event ) {

    console.log( `click! (${event.clientX}, ${event.clientY})`)

	// calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1
    
    raycaster.setFromCamera( mouse, camera )

	// calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects( scene.children, true )

    let container = document.getElementById( 'container' )
    if (container) container.remove()

    // reset object colours
    scene.traverse((child, i) => {
        if (child.isMesh) {
            child.material.color.set( 'white' )
        }
    });

    if (intersects.length > 0) {

        // get closest object
        const object = intersects[0].object
        console.log(object) // debug

        object.material.color.set( 'yellow' )

        // get user strings
        let data, count
        if (object.userData.attributes !== undefined) {
            data = object.userData.attributes.userStrings
        } else {
            // breps store user strings differently...
            data = object.parent.userData.attributes.userStrings
        }

        // do nothing if no user strings
        if ( data === undefined ) return

        console.log( data )
        
        // create container div with table inside
        container = document.createElement( 'div' )
        container.id = 'container'
        
        const table = document.createElement( 'table' )
        container.appendChild( table )

        for ( let i = 0; i < data.length; i ++ ) {

            const row = document.createElement( 'tr' )
            row.innerHTML = `<td>${data[ i ][ 0 ]}</td><td>${data[ i ][ 1 ]}</td>`
            table.appendChild( row )
        }

        document.body.appendChild( container )
    }

}


// function to continuously render the scene
function animate() {

    requestAnimationFrame( animate )
    renderer.render( scene, camera )



}



