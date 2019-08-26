const pixelator = (function (){
    let boxSize, 
    image,
    canvas = document.createElement('canvas'),
    gridCanvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d'),
    gridCtx = gridCanvas.getContext('2d'),
    _width,
    _height;

    pixelate = function(file, opts = {}){
        _applyOptions(opts);
        
        return new Promise((resolve, reject) => {
            image = new Image();
            image.onload = () => {
                _setSize(image)
                _createCanvas(canvas, ctx);
                _drawInputImage();
                _transform();
                _applyGrid(image);
                _getImage()
                .then(resolve);
            };
            image.src = URL.createObjectURL(file);
        });
    },

    _applyGrid = function(){
        if(gridSize){
            _width += gridSize * (Math.floor(_width / boxSize) - 1);
            _height += gridSize * (Math.floor(_height / boxSize) - 1);
            
            _createCanvas(gridCanvas, gridCtx);
            _drawGridImage();
        }
    },

    _applyOptions = function(opts){
        boxSize = opts.boxSize || 10;
        gridSize = opts.gridSize && opts.gridSize > 0 ? opts.gridSize : 0;
        gridColor = opts.gridColor ? opts.gridColor : 'transparent';
    },

    _drawGridImage = function(){
        let w = h = boxSize;
        _drawGridBackgound();

        for(let y = 0, y2 = 0; y < _height; y += boxSize, y2++){
            for(let x = 0, x2 = 0; x < _width; x += boxSize, x2++){
                let d = ctx.getImageData(x, y, 1, 1).data;
                let raw = {
                    r: d[0],
                    g: d[1],
                    b: d[2],
                    a: d[3]
                };
                
                _drawGridBox(raw, x + x2 * gridSize, y + y2 * gridSize, w, h);
            }
        }
    },

    _drawGridBackgound = function(){
        gridCtx.fillStyle = gridColor;
        gridCtx.fillRect(0, 0, _width, _height);
    },

    _drawGridBox = function(raw, x, y, w, h){
        gridCtx.fillStyle = `rgba(${raw.r}, ${raw.g}, ${raw.b}, ${raw.a})`;
        gridCtx.fillRect(x, y, w, h);
    },

    _setSize = function({ width, height }){
        _width = width - (width % boxSize);
        _height = height - (height % boxSize);
    },

    _getImage = function(){
        return new Promise((resolve, reject) => {
            canvas.toBlob(blob => {
                let file = _blobToFile(blob, 'Pxl.png');
                if(gridSize){
                    gridFile = _getGridImage().then(gf => {
                        resolve({ file: file, gridFile: gf });
                    });
                }
                else{
                    resolve({ file: file });
                }                  
            });
        });
    },

    _getGridImage = function(){
        return new Promise(resolve => {
            gridCanvas.toBlob(gridBlob => resolve(_blobToFile(gridBlob, 'PxlGrd.png')));
        });
    },

    _blobToFile = function(blob, name){
        blob.lastModifiedDate = new Date();
        blob.name = name;
        return blob;
    },

    _createCanvas = function(_canvas, _ctx){
        _canvas.style.visibility = 'hidden';
        _canvas.style.display = 'none';
        _canvas.width = _width;
        _canvas.height = _height;
    },

    _drawInputImage = function(){
        ctx.drawImage(image, 0, 0, image.width, image.height);
        URL.revokeObjectURL(image.src);
    },

    _transform = function(){
        let sw = sh = boxSize;

        for(let sy = 0; sy < _height; sy += boxSize){
            for(let sx = 0; sx < _width; sx += boxSize){
                _transformPixel(sx, sy, sw, sh);
            }
        }
    },

    _transformPixel = function(sx, sy, sw, sh){
        let raw = {
            r: 0,
            g: 0,
            b: 0,
            a: 0
        };
        ctx.getImageData(sx, sy, sw, sh).data.reduce(_sumPixels, raw);
        _getMedianPixel(raw);
        _drawMedianPixel(raw, sx, sy, sw, sh);
    },

    _sumPixels = function(prev, curr, i){
        let type = i % 4;
        switch(type){
            case 0: prev.r += curr; break;
            case 1: prev.g += curr; break;
            case 2: prev.b += curr; break;
            case 3: prev.a += curr; break;
        }
        return prev;
    },

    _drawMedianPixel = function(raw, sx, sy, sw, sh){
        ctx.fillStyle = `rgba(${raw.r}, ${raw.g}, ${raw.b}, ${raw.a})`;
        ctx.fillRect(sx, sy, sw, sh);
    },

    _getMedianPixel = function(raw){
        Object.keys(raw).forEach(key => raw[key] = Math.floor(raw[key] / (boxSize * boxSize)));
    };

    return { pixelate: pixelate }
})();