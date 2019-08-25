# pixelator
Pixelate an image, with or without grid.

## pixelator API
---
### pixelate(file, ?options) => Promise()

#### Parameters
* `file`    - (`File`) The image to pixelate.
* `options` - (Object) Optional.
   * `boxSize`: (Number) The resulting image will consist of boxSize * boxSize squares.
   * `gridSize`: (Number) The squares in the resulting image will be separated by a distance of gridSize

#### Return type
`Promise({ file: File, ?gridFile: File })`

* `file`     - The pixelated file
* `gridFile` - This is only available if a grid value (gridSize) > 0 is given as input in the                 `options`-object.

#### Example use
```
let pixelator = new Pixelator();

let options = {
    boxSize: 50     // Size of the sides of the box, this will result in a 50x50 pixel square
    gridSize: 2     // This will create a 2 pixel wide separation between the boxes. Defaults
};                  // to 0.

pixelator.pixelate(file, options).then(resultObject => {
    let pixelatedFile = resultObject.file;
    let gridFile = resultObject.gridFile; // If options.gridSize < 1 || !options.gridSize,
});                                       // this will not be generated

```