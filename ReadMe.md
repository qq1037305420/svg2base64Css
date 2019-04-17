This tool converts svg images to css classes with background-image of svgs.

Classes will be name prefix-icon-svgname.

base size is also included

example:

        ./svg/abc.svg
        
        =>
        
        prefix-icon-abc {
            background-image: url(base64 encoded with the svg)
        }
        

##first step

    *put your images into svg folder*

##second step

    *node export.js*
    *input your prefix and size*
    *css file will be name export.css in your directory*
