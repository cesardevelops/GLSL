#ifdef GL_ES
precision highp float;
#endif
uniform float u_time;
uniform vec2 resolution;
varying vec2 v_texcoord;
//user defined variables
uniform sampler2D u_image;
uniform float u_verticalMovement;
uniform float u_repetitions;
uniform float u_brightness;
uniform float u_contrast;
uniform float u_lineStrenght;

//This helps us remap the gradient, it is sometimes helpful when trying to fine tune the ramp
float RemapValueRange(float Input, float InputLow, float InputHigh, float TargetLow, float TargetHigh)
    {
        float result =
            (
                (
                    (Input - InputLow)/(InputHigh-InputLow)
                )
                *
                (TargetHigh-TargetLow)
            )
            +
            TargetLow;
            return result;
    }

//Artists are used to handling Photoshop, so why not provide a way to do
//the same for the line
float brightnessContrast(float value, float brightness, float contrast)
    {
        float final;
        final = (value - 0.5) * contrast + 0.5 + brightness;
        if (final < 0.0) {final = 0.0;}
        if (final > 1.0) {final = 1.0;}
        return final;
    }

void main(void)
    {
        //I imagine the artist will like to move the lines as an old TV
        float speed = u_time * u_verticalMovement;
        //Here we add the speed to the UVs to make things move
        vec2 uv = -1. + 2. * v_texcoord + speed;

        //UVs are upside-down for the image, so here we flip them
        vec2 invertedUVs = v_texcoord;
        invertedUVs.y = 1.0 - invertedUVs.y;
        //Here we get the image from the unform
        vec4 image = texture2D(u_image, invertedUVs);

        //smoothstep works great to attain a soft line.
        //we have to do this two times so we get both the left and right side
        float barsA = smoothstep(0.0, 1.0, mod(uv.y * u_repetitions, 0.2));
        float barsB = smoothstep(0.0, 1.0, mod(-uv.y * u_repetitions, 0.2));
        //since this is a black and white result, we just add it together
        float final = barsA + barsB;
        final = RemapValueRange(final, 0.0, 1.0, -0.5, 9.0);
        //here we call brightness and contrast to fine tune the look of the line
        final = brightnessContrast(final, u_brightness, u_contrast);

        //normally i do a more specialize type of blending, but if we want
        //to just darken a bit, we can just substract from the image
        vec4 finalColor =  image - (vec4(final) * u_lineStrenght);


        gl_FragColor = finalColor;
    }
