import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // console.log('file in multer', file)
    cb(null, "public/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    let fn =
      uniqueSuffix +
      file.originalname.slice(file.originalname?.lastIndexOf("."));
    cb(null, fn);
  },
});

export const upload = multer({ storage: storage });
