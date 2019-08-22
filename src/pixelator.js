function Pixelator(){
    this.boxSize;
    this.image;
    this.canvas;
    this.ctx;
    this.width;
    this.height;

    this.pixelate = function(file, opts = {}){
        this.boxSize = opts.boxSize || 10;
        return new Promise((resolve, reject) => {
            this.image = new Image();
            this.image.onload = () => {
                this._setSize(this.image)
                this._createCanvas();
                this._drawInputImage();
                this._transform();
                this._getImage()
                .then(resolve);
            };
            this.image.src = URL.createObjectURL(file);
        });
    }

    this._setSize = function({ width, height }){
        this.width = width - (width % this.boxSize || 10);
        this.height = height - (height % this.boxSize || 10);
    }

    this._getImage = function(){
        return new Promise((resolve, reject) => this.canvas.toBlob(blob => resolve(this._blobToFile(blob))));
    }

    this._blobToFile = function(blob){
        blob.lastModifiedDate = new Date();
        blob.name = 'Pixelated.png';
        return blob;
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
                let raw = {
                    r: 0,
                    g: 0,
                    b: 0,
                    a: 0
                };

                this.ctx.getImageData(sx, sy, sw, sh).data.reduce((prev, curr, i) => {
                    let type = i % 4;
                    switch(type){
                        case 0: prev.r += curr; break;
                        case 1: prev.g += curr; break;
                        case 2: prev.b += curr; break;
                        case 3: prev.a += curr; break;
                    }
                    return prev;
                }, raw);
                
                this._getMedianPixel(raw);
                this._drawMedianPixel(raw, sx, sy, sw, sh);
            }
        }
    }

    this._drawMedianPixel = function(raw, sx, sy, sw, sh){
        this.ctx.fillStyle = `rgba(${raw.r}, ${raw.g}, ${raw.b}, ${raw.a})`;
        this.ctx.fillRect(sx, sy, sw, sh);
    }

    this._getMedianPixel = function(raw){
        Object.keys(raw).forEach(key => raw[key] = Math.floor(raw[key] / (this.boxSize * this.boxSize)));
    }
}