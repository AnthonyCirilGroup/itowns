#if NUM_VS_TEXTURES > 0
    struct Layer {
        float scale;
        float bias;
        int mode;
        float zmin;
        float zmax;
    };

    uniform Layer       elevationLayers[NUM_VS_TEXTURES];
    uniform sampler2D   elevationTextures[NUM_VS_TEXTURES];
    uniform vec4        elevationOffsetScales[NUM_VS_TEXTURES];
    uniform int         elevationTextureCount;
    uniform float       geoidHeight;

    const float PackUpscale = 256. / 255.; // fraction -> 0..1 (including 1)
    const float UnpackDownscale = 255. / 256.; // 0..1 -> fraction (excluding 1)

    const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256.,  256. );
    const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );

    highp float decode32(highp vec4 rgba) {
        highp float Sign = 1.0 - step(128.0,rgba[0])*2.0;
        highp float Exponent = 2.0 * mod(rgba[0],128.0) + step(128.0,rgba[1]) - 127.0;
        highp float Mantissa = mod(rgba[1],128.0)*65536.0 + rgba[2]*256.0 +rgba[3] + float(0x800000);
        highp float Result =  Sign * exp2(Exponent) * (Mantissa * exp2(-23.0 ));
        return Result;
    }


    //  Decode height when encoded using Mapbox formula: height = -10000 + ((R * 256 * 256 + G * 256 + B) * 0.1)
    highp float decodeMPRGB(highp vec3 rgb) {
        if(rgb == vec3(0.0, 0.0, 0.0))
            return 0.0;
        highp float Result =  -10000.0 + ((rgb[0] * 256.0 * 256.0 + rgb[1] * 256.0 + rgb[2]) * 0.1);
       return Result;
    }


    float unpackRGBAToDepth( const in vec4 v ) {
        return dot( v, UnpackFactors );
    }



    float getElevationMode(vec2 uv, sampler2D tex, int mode) {
        if (mode == ELEVATION_RGBA)
            return decodeMPRGB(texture2D( tex, uv ).rgb * 255.0); 
          
        if (mode == ELEVATION_DATA || mode == ELEVATION_COLOR)
        #if defined(WEBGL2)
            return texture2D( tex, uv ).r;
        #else
            return texture2D( tex, uv ).w;
        #endif
        return 0.;
    }


    float getElevation(vec2 uv, sampler2D tex, vec4 offsetScale, Layer layer) {
        uv = uv * offsetScale.zw + offsetScale.xy;
        float d = getElevationMode(uv, tex, layer.mode);
        if (layer.mode == ELEVATION_RGBA)
            return d * layer.scale;        
        d = clamp(d, layer.zmin , layer.zmax);            
        return d * layer.scale + layer.bias;
    }
#endif
