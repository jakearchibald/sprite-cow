ver=9

rm -r build

mkdir build
mkdir build/assets
mkdir build/assets/$ver
mkdir build/assets/$ver/script
mkdir build/assets/$ver/style

cp www/assets/favicon.ico build/assets/$ver/
cp www/assets/tutorial-sprite.png build/assets/$ver/
cp -r www/assets/style/fonts build/assets/$ver/style/
cp -r www/assets/style/imgs build/assets/$ver/style/
sed -e 's/\/$ver\//\/'"$ver"'\//g' www/index.html > build/index.html
sed -e 's/\/$ver\//\/'"$ver"'\//g' www/offline.appcache > build/offline.appcache
cat www/assets/script/{jquery-1.7.1,jquery.easing,jquery.transition,jquery.fileClickjack,intro,MicroEvent,Rect,ImgInput,SpriteCanvas,SpriteCanvasView,InlineEdit,CssOutput,Toolbar,pageLayout,FeatureTest,featureTests,base}.js | uglifyjs -cm > build/assets/$ver/script/mainmin.js
node-sass --output-style compessed www/assets/style/all.scss build/assets/$ver/style/all-min.css
