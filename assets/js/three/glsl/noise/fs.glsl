precision highp float;

varying vec2 vUv;

uniform int uFrame;
uniform float uTime;
uniform float uOpacity;
uniform vec2 uPlaneSize;  
uniform float uDevicePixelRatio;

float hash(uint n) {
    n = (n << 13U) ^ n;
    n = n * (n * n * 15731U + 789221U) + 1376312589U;
    return float(n & uint(0x7fffffffU)) / float(0x7fffffff);
}

void main() {
    vec2 uv = vUv;
    float time = 0.5 * sin(uTime) + 0.5; // from 0 to 1
    uvec2 psI = uvec2(uPlaneSize.xy);
    uvec2 uvI = uvec2(uv.xy * uPlaneSize.x * uPlaneSize.y * uDevicePixelRatio);
    uint frameI = uint(uFrame);
    float random = hash(uvI.x + psI.x * uvI.y + (psI.x * psI.y) * frameI);
    gl_FragColor = vec4(vec3(0.0), random * 0.2 * uOpacity);
}