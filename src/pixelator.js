function Pixelator(inCanvas, outCanvas){
    this.image;
    this.canvasInput = inCanvas;
    this.outputCanvas = outCanvas;
    this.ctx = inCanvas.getContext('2d');
    this.oCtx = this.outputCanvas.getContext('2d');

    this.readImage = function(file){
        this.image = new Image(300,300);
        this.image.onload = this._drawInputImage.bind(this);
        this.image.src = URL.createObjectURL(file);
    }

    this._drawInputImage = function(){
        this.ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height);
        URL.revokeObjectURL(this.image.src);
        this.pixelate();
    }

    this.pixelate = function(boxSize = 3){
        let sw = sh = boxSize;

        for(let sy = 0; sy < this.canvasInput.height; sy += boxSize){
            for(let sx = 0; sx < this.canvasInput.width; sx += boxSize){
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
                
                this.getMedianPixel(raw, boxSize);
                this.drawMedianPixel(raw, sx, sy, sw, sh);
            }
        }
    }

    this.drawMedianPixel = function(raw, sx, sy, sw, sh){
        this.oCtx.fillStyle = `rgba(${raw.r}, ${raw.g}, ${raw.b}, ${raw.a})`;
        this.oCtx.fillRect(sx, sy, sw, sh);
    }

    this.getMedianPixel = (raw, boxSize) => Object.keys(raw).forEach(key => raw[key] = Math.floor(raw[key] / (boxSize * boxSize)));
}