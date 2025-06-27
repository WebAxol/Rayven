precision mediump float;

uniform vec2 u_resolution;
uniform sampler2D sampler;

varying vec2 v_texCoord;
varying vec4 v_color;

void main() {

    vec2 normalizedCoord = (2.0 * gl_FragCoord.xy - u_resolution) / u_resolution;

    vec4 texColor = texture2D(sampler,v_texCoord);

    if(texColor.a < 0.1) discard;

    vec4 mixed = mix(texColor,v_color,0.5);

    float minLight = 0.5;
    float maxLight = 2.0;
    float lightIndex = 5.0;

    normalizedCoord *= 3.0;

    float depth = length(vec3(1.0 / gl_FragCoord.w, normalizedCoord));

    float lightLevel = min(max(lightIndex / pow(depth,2.0),minLight), maxLight);

    vec4 shaded = vec4(mixed.rgb * lightLevel, v_color.a); 
    

    gl_FragColor = shaded;
}
