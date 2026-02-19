const express = require("express");
const router = express.Router();
const cloudinary = require("../lib/Cloudinary");
const BookModal = require("../modals/Books");
const isloggin = require("../middleware/authMiddleware");

router.post("/", isloggin, async (req, res) => {
  try {
    console.log("🔥 CREATE BOOK ROUTE HIT");
    const { title, caption, image, rating, pdf } = req.body;

    let imageUrl = "";
    let pdfUrl = "";

    /* ---------- IMAGE UPLOAD ---------- */
    if (image) {
      const imageUpload = await cloudinary.uploader.upload(image, {
        folder: "books/images",
      });
      imageUrl = imageUpload.secure_url;
    }

    /* ---------- PDF UPLOAD ---------- */
    if (pdf) {
      console.log("📡 Uploading PDF to Cloudinary...");

      const pdfUpload = await cloudinary.uploader.upload(pdf, {
        folder: "books/pdfs",
        resource_type: "raw",
      });

      if (!pdfUpload.secure_url) {
        throw new Error("PDF upload failed – no URL returned");
      }

      pdfUrl = pdfUpload.secure_url;
      console.log("✅ PDF Uploaded:", pdfUrl);
    }

    console.log("🧾 Saving to DB with pdfUrl:", pdfUrl);

    /* ---------- SAVE TO DB ---------- */
    const book = await BookModal.create({
  title,
  caption,
  image: imageUrl,
  pdfUrl,
  rating,
  user: req.user._id,
});


    res.status(201).json({
      message: "Book created successfully",
      book,
    });
  } catch (err) {
    console.error("❌ Upload Error:", err);
    res.status(500).json({
      message: "Upload failed",
      error: err.message,
    });
  }
});




router.get('/',isloggin, async (req, res) => {
  //"https//api/books/page=1/limit=5"
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const skip = (page - 1) * limit;

    const books = await BookModal.find()
      .sort({ createdAt: -1 })
      .skip(skip).
      limit(limit)
      .populate("user", "username image");

    const totalBook = await BookModal.countDocuments();

    res.send({
      books,
      currentpage: page,
      totalBook,
      totalPage: Math.ceil(totalBook / limit),
    })
  } catch (error) {

  }
})

router.delete('/:id',isloggin,async (req,res)=>{
  try {
    const book=await BookModal.findById(req.params.id);
    if(!book) return res.status(404).json({message:"Book Not Found"});

    if(book.user.toString()!==req.user._id.toString()){
      return res.status(401).json({message:"Unauthorized"});
    }

    if(book.image&&book.image.includes("cloudinary"))
    {
      try {
        const publicId=book.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId)
      } catch (error) {
        console.log(err);
      }
    }

    await book.deleteOne();
  } catch (error) {
    
  }
})

router.get('/user',isloggin,async (req,res)=>{
  try {
    const books=await BookModal.find({user:req.user._id}).sort({createdAt:-1})
    res.json(books);
  } catch (error) {
    console.log("Error:",err);
    res.status(404).json({message:"Server Error"});
  }
})

module.exports = router;
