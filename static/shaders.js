const vertex_shader_source = `#version 300 es
in vec2 aPos;

out vec2 uv;

void main(void) {
    gl_Position = vec4(aPos, 0.0, 1.0);
    uv = aPos * 0.5 + 0.5;
    uv = vec2(uv.x, 1.0 - uv.y);
}`;

const fragment_shader_source = `#version 300 es
precision mediump float;

#define PI 3.1415926538

const float EPSILON = 0.0001;

uniform float uTime;
uniform vec2 uMouse;

uniform sampler2D tex;
uniform sampler2D tex2;

in vec2 uv;

out vec4 FragColor;

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float get_l(vec3 pixel) {
    return pixel.r * 0.3 + pixel.g * 0.55 + pixel.b * 0.15;
}

float get_p(vec3 pixel) {
    //float k = smoothstep(0.3, 0.1, distance(uv, uMouse));
    return 5.0 * rgb2hsv(pixel).b - 6.0;
}

vec3 transition_color(vec3 a, vec3 b, float t) {
    t = t + get_p(b);

    float aa = smoothstep(1.2, 0.0, t);
    float ab = smoothstep(0.8, 2.0, t);
    float ac = smoothstep(0.8, 1.0, t) * smoothstep(1.2, 1.0, t);

    vec3 hsv = rgb2hsv(b);
    return a * aa + b * ab + ac * hsv2rgb(vec3(hsv.rg, 0.5 + 0.5 * hsv.b));
}

void main(void) {
    vec3 pixel = texture(tex, uv).rgb;
    vec3 pixel2 = texture(tex2, uv).rgb;

    float t = mod(1.0 * uTime, 15.0);

    vec3 color = transition_color(pixel, pixel2, t);
    color = transition_color(color, pixel, t - 7.0);

    FragColor = vec4(color, 1.0);
}`

function run_shaders(gl) {
    const shaderProgram = initShaders(gl, vertex_shader_source, fragment_shader_source);

    vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

    var vertices = [-1.0, -1.0, 1.0, -1.0, 1.0, 1.0,
                    -1.0, -1.0, 1.0,  1.0, -1.0, 1.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aPos");
    gl.enableVertexAttribArray(vertexPositionAttribute);
    gl.vertexAttribPointer(vertexPositionAttribute, 2, gl.FLOAT, false, 2 * 4, 0);
    
    texture = loadTexture(gl, '/static/image.jpg');
    bindTextureToSlot(gl, shaderProgram, texture, 'tex', 0);

    texture2 = loadTexture(gl, '/static/image2.jpg');
    bindTextureToSlot(gl, shaderProgram, texture2, 'tex2', 1);

    setInterval(() => { draw(gl, shaderProgram) }, 1);
}

function draw(gl, shaderProgram) {
    const canvas = document.getElementById('glcanvas');

    gl.clearColor(0.0, 0.0, 0.0, 1.0);                      
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.cullFace(gl.FRONT_AND_BACK);

    gl.uniform1f(gl.getUniformLocation(shaderProgram, 'uTime'), performance.now() / 1000);

    const x = Math.max(0, Math.min(1, (clientX - canvas.offsetLeft) / canvas.width));
    const y = Math.max(0, Math.min(1, (clientY - canvas.offsetTop) / canvas.height));

    gl.uniform2f(gl.getUniformLocation(shaderProgram, 'uMouse'), x, y);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);
}

