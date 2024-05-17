precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform float uOpacity;
uniform float uPixel;
uniform sampler2D uTexture;
uniform vec2 uTextureSize;  
uniform vec2 uPlaneSize;    

void main() {
  vec2 uv = vUv;

  vec2 s = uPlaneSize;          // Plane size
  vec2 i = uTextureSize;        // Texture size cropped
  float rs = s.x / s.y;
  float ri = i.x / i.y;
  vec2 new = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
  vec2 offset = (rs < ri ? vec2((new.x - s.x) / 2.0, 0.0) : vec2(0.0, (new.y - s.y) / 2.0)) / new;
  uv = vUv * s / new + offset;
  uv -= vec2(0.5);
  uv += vec2(0.5);

  
  float pct = distance(uv, vec2(0.5)) * 2.0;

  // vec2 grid_uv = round(uv * float(uPixel)) / float(uPixel);
  // float x = 1.0 - smoothstep(0.0, 0.5, uv.x);
  // if (uv.x > .5) x = smoothstep(0.5, 1.0, uv.x);
  // float y = 1.0 - smoothstep(0.0, 0.5, uv.y);
  // if (uv.y > .5) y = smoothstep(0.5, 1.0, uv.y);
  // float maxPixelRatio = 20.0;
  // float pixelRatio = maxPixelRatio + (uPlaneSize.x - maxPixelRatio) * pct ;
  // vec2 grid_uv = round(uv * pixelRatio) / pixelRatio;
  
  vec2 grid_uv = round(uv * uPixel) / uPixel;
  
  float time = 0.5 * sin(uTime) + 0.5; // from 0 to 1

  vec4 texColor1 = texture2D(uTexture, grid_uv);
  vec4 texColor2 = texture2D(uTexture, uv);
  vec4 texColor = mix(texColor1, texColor2, time);
  gl_FragColor = vec4(texColor.xyz, uOpacity);
  // gl_FragColor = vec4(vec3(y), uOpacity);
  // gl_FragColor = vec4(vec3(pct), uOpacity);
  // gl_FragColor = vec4(vec3(0.5 * sin(uTime) + 0.5), uOpacity);
}