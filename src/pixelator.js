function Pixelator(){
    this.image;
    this.canvas;
    this.ctx;

    this.pixelate = function(file, opts = {}){
        return new Promise((resolve, reject) => {
            this.image = new Image();
            this.image.onload = () => {
                this._createCanvas(this.image);
                this._drawInputImage();
                this._transform(opts);
                this._getImage()
                .then(resolve);
            };
            this.image.src = URL.createObjectURL(file);
        });
    }

    this._getImage = function(){
        return new Promise((resolve, reject) => this.canvas.toBlob(blob => resolve(this._blobToFile(blob))));
    }

    this._blobToFile = function(blob){
        blob.lastModifiedDate = new Date();
        blob.name = 'Pixelated.png';
        return blob;
    }

    this._createCanvas = function({ width, height }){
        this.canvas = document.createElement('canvas');
        this.canvas.style.visibility = 'hidden';
        this.canvas.style.display = 'none';
        this.canvas.width = width;
        this.canvas.height = height;

        this.ctx = this.canvas.getContext('2d');
    }

    this._drawInputImage = function(){
        this.ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height);
        URL.revokeObjectURL(this.image.src);
    }

    this._transform = function({ boxSize = 10 }){
        let sw = sh = boxSize;
        let width = this.image.width - (this.image.width % boxSize);
        let height = this.image.height - (this.image.height % boxSize);

        for(let sy = 0; sy < height; sy += boxSize){
            for(let sx = 0; sx < width; sx += boxSize){
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
                
                this._getMedianPixel(raw, boxSize);
                this._drawMedianPixel(raw, sx, sy, sw, sh);
            }
        }
    }

    this._drawMedianPixel = function(raw, sx, sy, sw, sh){
        this.ctx.fillStyle = `rgba(${raw.r}, ${raw.g}, ${raw.b}, ${raw.a})`;
        this.ctx.fillRect(sx, sy, sw, sh);
    }

    this._getMedianPixel = function(raw, boxSize){
        Object.keys(raw).forEach(key => raw[key] = Math.floor(raw[key] / (boxSize * boxSize)));
    }
}