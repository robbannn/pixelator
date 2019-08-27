const pixelator = (function (){
    let _boxSize, 
    _gridSize,
    _gridColor,
    _image,
    _canvas = document.createElement('canvas'),
    _gridCanvas = document.createElement('canvas'),
    _ctx = _canvas.getContext('2d'),
    _gridCtx = _gridCanvas.getContext('2d'),
    _width,
    _height;

    function pixelate(file, opts = {}){
        _applyOptions(opts);
        
        return new Promise(resolve => {
            _image = new Image();
            _image.onload = () => {
                _setSize(_image)
                _createCanvas(_canvas, _ctx);
                _drawInputImage();
                _transform();
                _applyGrid(_image);
                _getImage()
                .then(resolve);
            };
            _image.src = URL.createObjectURL(file);
        });
    };

    function _applyGrid(){
        if(_gridSize){
            _width += _gridSize * (Math.floor(_width / _boxSize) - 1);
            _height += _gridSize * (Math.floor(_height / _boxSize) - 1);
            
            _createCanvas(_gridCanvas, _gridCtx);
            _drawGridImage();
        }
    }

    function _applyOptions(opts){
        _boxSize = opts.boxSize || 10;
        _gridSize = opts.gridSize && opts.gridSize > 0 ? opts.gridSize : 0;
        _gridColor = opts.gridColor ? opts.gridColor : 'transparent';
    }

    function _drawGridImage(){
        let w = h = _boxSize;
        _drawGridBackgound();

        for(let y = 0, y2 = 0; y < _height; y += _boxSize, y2++){
            for(let x = 0, x2 = 0; x < _width; x += _boxSize, x2++){
                let d = _ctx.getImageData(x, y, 1, 1).data;
                let raw = {
                    r: d[0],
                    g: d[1],
                    b: d[2],
                    a: d[3]
                };
                
                _drawGridBox(raw, x + x2 * _gridSize, y + y2 * _gridSize, w, h);
            }
        }
    }

    function _drawGridBackgound(){
        _gridCtx.fillStyle = _gridColor;
        _gridCtx.fillRect(0, 0, _width, _height);
    }

    function _drawGridBox(raw, x, y, w, h){
        _gridCtx.fillStyle = `rgba(${raw.r}, ${raw.g}, ${raw.b}, ${raw.a})`;
        _gridCtx.fillRect(x, y, w, h);
    }

    function _setSize({ width, height }){
        _width = width - (width % _boxSize);
        _height = height - (height % _boxSize);
    }

    function _getImage(){
        return new Promise(resolve => {
            _canvas.toBlob(blob => {
                let file = _blobToFile(blob, 'Pxl.png');
                if(_gridSize){
                    gridFile = _getGridImage().then(gf => {
                        resolve({ file: file, gridFile: gf });
                    });
                }
                else{
                    resolve({ file: file });
                }                  
            });
        });
    }

    function _getGridImage(){
        return new Promise(resolve => _gridCanvas.toBlob(gridBlob => resolve(_blobToFile(gridBlob, 'PxlGrd.png'))));
    }

    function _blobToFile(blob, name){
        blob.lastModifiedDate = new Date();
        blob.name = name;
        return blob;
    }

    function _createCanvas(_canvas, _ctx){
        _canvas.style.visibility = 'hidden';
        _canvas.style.display = 'none';
        _canvas.width = _width;
        _canvas.height = _height;
    }

    function _drawInputImage(){
        _ctx.drawImage(_image, 0, 0, _image.width, _image.height);
        URL.revokeObjectURL(_image.src);
    }

    function _transform(){
        let sw = sh = _boxSize;

        for(let sy = 0; sy < _height; sy += _boxSize){
            for(let sx = 0; sx < _width; sx += _boxSize){
                _transformPixel(sx, sy, sw, sh);
            }
        }
    }

    function _transformPixel(sx, sy, sw, sh){
        let raw = {
            r: 0,
            g: 0,
            b: 0,
            a: 0
        };
        _ctx.getImageData(sx, sy, sw, sh).data.reduce(_sumPixels, raw);
        _getMedianPixel(raw);
        _drawMedianPixel(raw, sx, sy, sw, sh);
    }

    function _sumPixels(prev, curr, i){
        let type = i % 4;
        switch(type){
            case 0: prev.r += curr; break;
            case 1: prev.g += curr; break;
            case 2: prev.b += curr; break;
            case 3: prev.a += curr; break;
        }
        return prev;
    }

    function _drawMedianPixel(raw, sx, sy, sw, sh){
        _ctx.fillStyle = `rgba(${raw.r}, ${raw.g}, ${raw.b}, ${raw.a})`;
        _ctx.fillRect(sx, sy, sw, sh);
    }

    function _getMedianPixel(raw){
        Object.keys(raw).forEach(key => raw[key] = Math.floor(raw[key] / (_boxSize * _boxSize)));
    }

    return { pixelate: pixelate };
})();