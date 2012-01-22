#!/bin/bash
ver=6
cat www/assets/$ver/script/{jquery-1.6.2,jquery.easing,jquery.transition,jquery.fileClickjack,intro,MicroEvent,Rect,ImgInput,SpriteCanvas,SpriteCanvasView,CssOutput,Toolbar,pageLayout,FeatureTest,featureTests,base}.js | node bin/uglify.js > www/assets/$ver/script/mainmin.js
cat www/assets/$ver/style/base.css | java -jar bin/yuicompressor-2.4.8pre.jar --type css -o www/assets/$ver/style/mainmin.css