#!/bin/bash
ver=7
cat www/assets/$ver/script/{jquery-1.7.1,jquery.easing,jquery.transition,jquery.fileClickjack,intro,MicroEvent,Rect,ImgInput,SpriteCanvas,SpriteCanvasView,CssOutput,Toolbar,pageLayout,FeatureTest,featureTests,base}.js | node bin/uglify.js > www/assets/$ver/script/mainmin.js
~/dev/sass/bin/sass --style compressed www/assets/$ver/style/all.scss:www/assets/$ver/style/all-min.css