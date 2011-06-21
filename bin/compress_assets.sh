#!/bin/bash
ver=2
cat www/assets/$ver/script/{jquery-1.6.1,jquery.transition,intro,MicroEvent,Rect,ImgInput,SpriteCanvas,SpriteCanvasView,CssOutput,Toolbar,pageLayout,FeatureTest,featureTests,base}.js | bin/uglify/bin/uglifyjs --unsafe -o www/assets/$ver/script/mainmin.js
cat www/assets/$ver/style/base.css | java -jar bin/yuicompressor-2.4.5.jar --type css -o www/assets/$ver/style/mainmin.css