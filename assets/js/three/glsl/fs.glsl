precision highp float;

varying vec2 vUv;

uniform float uOpacity;
uniform sampler2D uTexture;
uniform vec2 uResolution; // The resolution of the video
uniform vec2 uPlaneSize; // The size of the plane

void main() {
  vec2 uv = vUv;

vec2 s = uPlaneSize;               // Plane size
    vec2 i = uResolution;        // Texture size cropped
    float rs = s.x / s.y;
    float ri = i.x / i.y;
    vec2 new = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
    vec2 offset = (rs < ri ? vec2((new.x - s.x) / 2.0, 0.0) : vec2(0.0, (new.y - s.y) / 2.0)) / new;
    uv = vUv * s / new + offset;
    uv -= vec2(0.5);
    uv += vec2(0.5);

  vec4 texColor = texture2D(uTexture, uv);

  gl_FragColor = vec4(texColor.xyz, uOpacity);
}