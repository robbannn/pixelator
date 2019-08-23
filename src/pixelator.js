function Pixelator(){
    this.boxSize;
    this.image;
    this.canvas;
    this.gridCanvas;
    this.ctx;
    this.gridCtx;
    this.width;
    this.height;

    this.pixelate = function(file, opts = {}){
        this.boxSize = opts.boxSize || 10;
        this.gridSize = opts.gridSize && opts.gridSize > 0 ? opts.gridSize : 0;

        return new Promise((resolve, reject) => {
            this.image = new Image();
            this.image.onload = () => {
                this._setSize(this.image)
                this._createCanvas();
                this._drawInputImage();
                this._transform();
                this._applyGrid(this.image);
                this._getImage()
                .then(resolve);
            };
            this.image.src = URL.createObjectURL(file);
        });
    }

    this._applyGrid = function({ width, height }){
        if(this.gridSize){
            this.width += this.gridSize * (Math.floor(this.width / this.boxSize) - 1);
            this.height += this.gridSize * (Math.floor(this.height / this.boxSize) - 1);
            
            this._createGridCanvas();
            this._drawGridImage();
        }
    }

    this._drawGridImage = function(){
        let w = h = this.boxSize;

        for(let y = 0, y2 = 0; y < this.height; y += this.boxSize, y2++){
            for(let x = 0, x2 = 0; x < this.width; x += this.boxSize, x2++){
                let d = this.ctx.getImageData(x, y, 1, 1).data;
                let raw = {
                    r: d[0],
                    g: d[1],
                    b: d[2],
                    a: d[3]
                };
                
                this._drawGridBox(raw, x + x2 * this.gridSize, y + y2 * this.gridSize, w, h);
            }
        }
    }

    this._drawGridBox = function(raw, x, y, w, h){
        this.gridCtx.fillStyle = `rgba(${raw.r}, ${raw.g}, ${raw.b}, ${raw.a})`;
        this.gridCtx.fillRect(x, y, w, h);
    }

    this._setSize = function({ width, height }){
        this.width = width - (width % this.boxSize);
        this.height = height - (height % this.boxSize);
    }

    this._getImage = function(){
        return new Promise((resolve, reject) => {
            this.canvas.toBlob(blob => {
                let file = this._blobToFile(blob, 'Pxl.png');
                if(this.gridSize){
                    gridFile = this._getGridImage().then(gf => {
                        resolve({ file: file, gridFile: gf });
                    });
                }
                else{
                    resolve({ file: file });
                }                  
            });
        });
    }

    this._getGridImage = function(){
        return new Promise(resolve => {
            this.gridCanvas.toBlob(gridBlob => resolve(this._blobToFile(gridBlob, 'PxlGrd.png')));
        });
    }

    this._blobToFile = function(blob, name){
        blob.lastModifiedDate = new Date();
        blob.name = name;
        return blob;
    }

    this._createGridCanvas = function(){
        this.gridCanvas = document.createElement('canvas');
        this.gridCanvas.style.visibility = 'hidden';
        this.gridCanvas.style.display = 'none';
        this.gridCanvas.width = this.width;
        this.gridCanvas.height = this.height;

        this.gridCtx = this.gridCanvas.getContext('2d');
    }

    this._createCanvas = function(){
        this.canvas = document.createElement('canvas');
        this.canvas.style.visibility = 'hidden';
        this.canvas.style.display = 'none';
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.ctx = this.canvas.getContext('2d');
    }

    this._drawInputImage = function(){
        this.ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height);
        URL.revokeObjectURL(this.image.src);
    }

    this._transform = function(){
        let sw = sh = this.boxSize;

        for(let sy = 0; sy < this.height; sy += this.boxSize){
            for(let sx = 0; sx < this.width; sx += this.boxSize){
                this._transformPixel(sx, sy, sw, sh);
            }
        }
    }

    this._transformPixel = function(sx, sy, sw, sh){
        let raw = {
            r: 0,
            g: 0,
            b: 0,
            a: 0
        };
        this.ctx.getImageData(sx, sy, sw, sh).data.reduce(this._sumPixels.bind(this), raw);
        this._getMedianPixel(raw);
        this._drawMedianPixel(raw, sx, sy, sw, sh);
    }

    this._sumPixels = function(prev, curr, i){
        let type = i % 4;
        switch(type){
            case 0: prev.r += curr; break;
            case 1: prev.g += curr; break;
            case 2: prev.b += curr; break;
            case 3: prev.a += curr; break;
        }
        return prev;
    }

    this._drawMedianPixel = function(raw, sx, sy, sw, sh){
        this.ctx.fillStyle = `rgba(${raw.r}, ${raw.g}, ${raw.b}, ${raw.a})`;
        this.ctx.fillRect(sx, sy, sw, sh);
    }

    this._getMedianPixel = function(raw){
        Object.keys(raw).forEach(key => raw[key] = Math.floor(raw[key] / (this.boxSize * this.boxSize)));
    }
}