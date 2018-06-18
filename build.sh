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
cat www/assets/script/jquery-1.7.1.js www/assets/script/jquery.easing.js www/assets/script/jquery.transition.js www/assets/script/jquery.fileClickjack.js www/assets/script/intro.js www/assets/script/MicroEvent.js www/assets/script/Rect.js www/assets/script/ImgInput.js www/assets/script/SpriteCanvas.js www/assets/script/SpriteCanvasView.js www/assets/script/InlineEdit.js www/assets/script/CssOutput.js www/assets/script/Toolbar.js www/assets/script/pageLayout.js www/assets/script/FeatureTest.js www/assets/script/featureTests.js www/assets/script/base.js | uglifyjs -cm > build/assets/$ver/script/mainmin.js
node-sass --output-style compessed www/assets/style/all.scss build/assets/$ver/style/all-min.css
