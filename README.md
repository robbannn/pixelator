# pixelator
Pixelate an image, with or without grid.

Example:



![Original image](https://robbannn-github-resources.s3.eu-central-1.amazonaws.com/pixelator/original.jpg "Original image") 

![Pixelated image](https://robbannn-github-resources.s3.eu-central-1.amazonaws.com/pixelator/pixelated.png "Pixelated image") ![Pixelated grid image](https://robbannn-github-resources.s3.eu-central-1.amazonaws.com/pixelator/pixelated-grid.png "Pixelated grid image")

"Why something like pixelator", you might ask... "Why not?", is my answer :)

## pixelator API
---
### pixelate(file, ?options) => Promise({ File, ?File})

#### Parameters
* `file`    - (`File`) The image to pixelate.
* `options` - (Object) Optional.
   * `boxSize`: (Number) The resulting image will consist of boxSize * boxSize squares.
   * `gridSize`: (Number) The squares in the resulting image will be separated by a distance of gridSize
   * `gridColor`: (String) RGB hex value e.g. `#ff0000`. Defaults to `transparent`.

#### Return type
`Promise({ file: File, ?gridFile: File })`

* `file`     - The pixelated file
* `gridFile` - This is only available if a grid value (gridSize) > 0 is given as input in the                 `options`-object.

#### Example use
```
let options = {
    boxSize: 50          // Size of the sides of the squares, this will result in 50x50 pixel squares.
    gridSize: 2,         // This will create a 2 pixel wide separation between the boxes. Defaults to 0.
    gridColor: '#ff0000' // This sets the grid color to red.
};

pixelator.pixelate(file, options).then(resultObject => {
    let pixelatedFile = resultObject.file;
    let gridFile = resultObject.gridFile; // If options.gridSize < 1 || !options.gridSize,
});                                       // this will not be generated

```
