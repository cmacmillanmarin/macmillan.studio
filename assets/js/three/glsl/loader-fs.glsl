precision highp float;

varying vec2 vUv;
uniform sampler2D uTxt;  

void main() {
    vec2 uv = vUv;
    gl_FragColor = texture2D(uTxt, uv);
}