function getShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
        console.log(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShaders(gl, vertex_shader_source, fragment_shader_source) {
    var vertexShader = getShader(gl, gl.VERTEX_SHADER, vertex_shader_source);
    var fragmentShader = getShader(gl, gl.FRAGMENT_SHADER, fragment_shader_source);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program.");
    }

    gl.useProgram(shaderProgram);

    return shaderProgram;
}

function initWebGL(canvas) {
    gl = null;

    try {
        gl = canvas.getContext("webgl2") || canvas.getContext("experimental-webgl");
    }
    catch(e) {}

    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        gl = null;
    }

    return gl;
}

function loadTexture(gl, src) {
    const img = new Image();
    img.crossOrigin = "anonymous";

    const tex = gl.createTexture();

    img.onload = function() {
        gl.activeTexture(gl.TEXTURE7);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        gl.generateMipmap(gl.TEXTURE_2D);
    };
    img.src = src;

    return tex;
}

function bindTextureToSlot(gl, shaderProgram, texture, name, slot) {
    gl.activeTexture(gl.TEXTURE0 + slot);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    const texLoc = gl.getUniformLocation(shaderProgram, name);
    gl.uniform1i(texLoc, slot);
}

var clientX, clientY;
function handleMouseMove(e) {
    clientX = e.clientX;
    clientY = e.clientY;
}

function start(next_func) {
    var canvas = document.getElementById("glcanvas");

    const gl = initWebGL(canvas);
    if (!gl) return;

    gl.viewport(0, 0, canvas.width, canvas.height);

    next_func(gl);
}
