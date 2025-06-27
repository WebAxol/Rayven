precision mediump float;

uniform sampler2D floorTexture;
uniform sampler2D skyTexture;

uniform vec3  u_cameraPosition;
uniform float u_cameraAngle;
uniform float u_time;
uniform vec2  u_resolution;

varying float v_height; 

const float PI = 3.14159265359;

// Linear Transformations

vec3 rotateX(vec3 v, float angle){

    mat3 rotationX = mat3(
        1,cos(angle), -sin(angle),
        0,sin(angle), cos(angle),
        0,0,  1
    );

    return rotationX * v;
}

vec3 rotateY(vec3 v, float angle){

    mat3 rotationY = mat3(
        cos(angle),0, -sin(angle),
        0,1.0,0,
        sin(angle),0,  cos(angle)
    );

    return rotationY * v;
}

// Primitives

struct Box {
    vec3 pos;
    vec3 dim;
};

struct Sphere {
    vec3  pos;
    float radius;
};

// Distance Functions

float sdSphere(vec3 p, Sphere spr){
    return length(abs(p - spr.pos)) - spr.radius;
}

float sdBox( vec3 p, Box b ){

    vec3 q = abs(p - b.pos) - b.dim;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

// RayMarching Operators

float opUnion( float d1, float d2 )
{
    return min(d1,d2);
}
float opSubtraction( float d1, float d2 )
{
    return max(-d1,d2);
}
float opIntersection( float d1, float d2 )
{
    return max(d1,d2);
}
float opXor(float d1, float d2 )
{
    return max(min(d1,d2),-max(d1,d2));
}

float opSmoothUnion( float d1, float d2, float k )
{
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h);
}

float opSmoothSubtraction( float d1, float d2, float k )
{
    float h = clamp( 0.5 - 0.5*(d2+d1)/k, 0.0, 1.0 );
    return mix( d2, -d1, h ) + k*h*(1.0-h);
}

float opSmoothIntersection( float d1, float d2, float k )
{
    float h = clamp( 0.5 - 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) + k*h*(1.0-h);
}

// Ray Marching scene setup

float map(vec3 p) {

    p.y -= 5.0;

    Box  b1 = Box(vec3(15.0,10.0,15.0), vec3(2.0,2.0,2.0));
    Box  b2 = Box(vec3(15.0,10.0,0.0), vec3(2.0,2.0,2.0));


    Sphere sp2 = Sphere(vec3(15.0- cos(u_time / 30.0) * 0.0,10.0 - sin(u_time / 30.0) * 5.0,15.0 - sin(u_time / 30.0) * 5.0),20.0);

    float res = 1000.0;

    p.xz += u_time / 10.0;
    vec3 p2 = p;

    p2.z -= 15.0;
    p2 = mod(-abs(p2),30.0);
    
    res = opSmoothUnion(res,sdBox(p2,b1),5.0);
    res = opSmoothUnion(res,sdBox(p2,b2),5.0);

    float size = 1.0;


    p = mod(-1.0 * abs(p),150.0);

    p = floor(p / size) * size;

    res = opSmoothUnion(res,sdSphere(p, sp2),15.0);

    float t = u_time / 5.0;

    return res;
}

// Sky sphere

float intersectSphere(vec3 rayDir, vec3 center, float radius) {
    vec3 oc = u_cameraPosition - center;
    float b = dot(oc, rayDir);
    float c = dot(oc, oc) - radius * radius;
    float h = b * b - c;
    if (h < 0.0) return -1.0;
    return -b - sqrt(h);
}

vec2 getSkyUV(vec3 hitPoint) {
    vec3 p = normalize(hitPoint); // dirección desde el centro

    float theta = atan(p.z, p.x);
    float phi   = acos(clamp(p.y, -1.0, 1.0));
    float u = theta / (2.0 * PI) + 0.5; 
    float v = phi / PI;
    return vec2(-u, -v);
}

bool renderSky(vec3 rayDir) {

    vec3 center = vec3(0.0,0.0,0);

    float radius = 200.0;         // grande pero finito

    float t = intersectSphere(rayDir, center, radius);

    if(t > 0.0) return false;

    vec3 hitPoint = u_cameraPosition + rayDir * t;
    vec2 uv = getSkyUV(hitPoint);

    gl_FragColor = texture2D(skyTexture, uv);
    return true;
}

bool marchRay(vec3 rayDir){

    vec3 col;
    float t = 0.0;
    float d;

    for(float i = 0.0; i < 80.0; i++){

        vec3  p = u_cameraPosition + rayDir * t;

        p.y /= 1.5;

        d = map(p);   

        t += d;

        if (d <= 0.1){
            col = vec3(mod(t/30.0,3.0),mod(t/30.0,2.0),1) / t * 20.2;   
            gl_FragColor = vec4(col, 0.05 *i);
            return true;
        }
        if (t > 500.) break; // early stop if too far
    }

    return false;
}

void main() {

    // Initial Calculations

    const float znear = 1.0 / tan(radians(50.0));
    vec3 color = vec3(1.0,1.0,1.0);

    vec2 normalizedCoord = (2.0 * gl_FragCoord.xy - u_resolution) / u_resolution;
    
    vec3 rayDir  =   vec3(normalizedCoord.xy, znear);

    rayDir /= length(rayDir); // Normalized ray direction

    float u_cameraAngle = -u_cameraAngle + radians(90.0);
    
    mat3 rotation = mat3(
        cos(u_cameraAngle),0, -sin(u_cameraAngle),
        0,1.0,0,
        sin(u_cameraAngle),0,  cos(u_cameraAngle)
    );
    
    rayDir =  rotateY(rayDir,u_cameraAngle); // Transformed ray direction
    
    // Ceiling/floor Texture Rendering

    float lambda = abs(1.0 / rayDir.y);

    vec3  textureCoord = (u_cameraPosition) + (rayDir * lambda) + vec3(900.0,900.0,1.0) * 0.5;

    float minLight = 0.4;
    float maxLight = 3.0;
    float lightIndex = 5.0;
    float depth = gl_FragCoord.w;

    float lightLevel = min(max(lightIndex / pow(lambda,2.0),minLight), maxLight);
    
    vec2 texCoord = vec2(textureCoord.x,textureCoord.z);
    vec4 texColor = texture2D(floorTexture, texCoord);

    vec4 mixed  = mix(texColor, vec4(vec3(255, 180, 0) / 255.0, 0.01),0.1);
    vec4 shaded = mix(vec4(0,0,0,1), mixed, lightLevel);

    shaded.w = 0.99;

    if(v_height > 0.0) gl_FragColor = vec4(0,0.2,0.5, 0);

    else{
        gl_FragColor = shaded;
        return;
    }

    // Background Ambientation (RayMarching)
    
    //if(marchRay(rayDir)) return;

    renderSky(rayDir);
}