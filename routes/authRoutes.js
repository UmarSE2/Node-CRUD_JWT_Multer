// const express = require('express');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const Account = require("../models/SignupModel");
// const B2 = require("backblaze-b2");
// const multer = require('multer');
// const router = express.Router();

// const JWT_TOKEN = process.env.JWT_TOKEN || "burak_token";

// const b2 = new B2({
//     applicationKeyId: "4b4d6469cc0e",
//     applicationKey: "00317b16ec70b3545d145bbb661a7344accbf74b93"
// })

// b2.authorize()
//     .then(() => { console.log("Authorized") })
//     .catch((err) => { console.log("Error authorizing b2", err) })

// const uploadFile = async (file) => {
//     const bucketResponse = await b2.getBucket({
//         bucketName: "personal-practice-1130",
//     });

//     // Get the upload URL
//     const uploadUrlResponse = await b2.getUploadUrl({
//         bucketId: bucketResponse.data.buckets[0].bucketId,
//     });
//     const fileName = file.originalname.split(".");
//     // Upload the file
//     const uploadFileResponse = await b2.uploadFile({
//         uploadUrl: uploadUrlResponse.data.uploadUrl,
//         uploadAuthToken: uploadUrlResponse.data.authorizationToken,
//         fileName: `${Date.now()}_media.${fileName[fileName.length - 1]}`,
//         data: file.buffer,
//     });

//     return `https://personal-practice-1130.s3.eu-central-003.backblazeb2.com/${uploadFileResponse.data.fileName}`;
// };

// // User signup
// router.post("/signup", multer().single('profile_pic'), async (req, res) => {
//     const { name, age, cnic, username, email, password } = req.body;
//     const profile_pic = await uploadFile(req.file)

//     try {
//         const existingUser = await Account.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ message: "Email already registered" });
//         }
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const addUser = await Account.create({ name, age, cnic, username, profile_pic, email, password: hashedPassword });
//         res.status(201).json({
//             user: addUser._id,
//             message: "User added successfully"
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Server error" });
//     }
// });

// // User login
// router.post("/login", async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const user = await Account.findOne({ email });
//         if (!user) {
//             return res.status(400).json({ message: "User not found" });
//         }
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(400).json({ message: "Invalid credentials" });
//         }
//         const token = jwt.sign(
//             { id: user._id, email: user.email },
//             JWT_TOKEN,
//             { expiresIn: "1h" }
//         );
//         res.cookie("jwt", token, { httpOnly: true, maxAge: 3 * 24 * 60 * 60 * 1000 });
//         res.status(200).json({
//             message: "Login successful",
//             token,
//             user: { id: user._id, email: user.email }
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Server error" });
//     }
// });

// // Logout User
// router.get("/logout", (req, res) => {
//     res.clearCookie('jwt');
//     res.status(200).json({ message: "Logout successful, token cleared" });
// });

// module.exports = router;

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Account = require("../models/SignupModel");
const B2 = require("backblaze-b2");
const multer = require('multer');
const router = express.Router();

const JWT_TOKEN = process.env.JWT_TOKEN || "burak_token";

// Backblaze B2 Configuration
const b2 = new B2({
    applicationKeyId: "4b4d6469cc0e",
    applicationKey: "00317b16ec70b3545d145bbb661a7344accbf74b93"
});

b2.authorize()
    .then(() => { console.log("Authorized") })
    .catch((err) => { console.log("Error authorizing b2", err) });

// Multer setup
const storage = multer.memoryStorage(); // In-memory storage
const uploadSingle = multer({ storage }).single('profile_pic');
const uploadArray = multer({ storage }).array('files', 5); // 5 is the max number of files
const uploadAny = multer({ storage }).any();
const uploadFields = multer({ storage }).fields([{ name: 'file1', maxCount: 1 }, { name: 'file2', maxCount: 5 }]);

// File Upload Function
const uploadFile = async (file) => {
    try {
        const bucketResponse = await b2.getBucket({
            bucketName: "personal-practice-1130",
        });

        const uploadUrlResponse = await b2.getUploadUrl({
            bucketId: bucketResponse.data.buckets[0].bucketId,
        });

        const fileName = file.originalname.split(".");
        const uploadFileResponse = await b2.uploadFile({
            uploadUrl: uploadUrlResponse.data.uploadUrl,
            uploadAuthToken: uploadUrlResponse.data.authorizationToken,
            fileName: `${Date.now()}_media.${fileName[fileName.length - 1]}`,
            data: file.buffer,
        });

        return `https://personal-practice-1130.s3.eu-central-003.backblazeb2.com/${uploadFileResponse.data.fileName}`;
    } catch (err) {
        console.error("Error uploading file to B2:", err);
        throw err;
    }
};

router.post("/upload-fields", uploadFields, async (req, res) => {
    try {
        const profile_pic = req.files["file1"] ? await uploadFile(req.files["file1"][0]) : undefined;
        const documetns = req.files["file2"] ? await Promise.all(req.files['file2'].map(uploadFile)) : [];

        res.status(200).json({
            message: "Files uploaded successfully",
            profilePic: profile_pic,
            documents: documetns,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
})

// User signup
router.post("/signup", uploadSingle, async (req, res) => {
    const { name, age, cnic, username, email, password } = req.body;
    const profile_pic = await uploadFile(req.file);

    try {
        const existingUser = await Account.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const addUser = await Account.create({ name, age, cnic, username, profile_pic, email, password: hashedPassword });
        res.status(201).json({
            user: addUser._id,
            message: "User added successfully"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Example route for uploading multiple files
router.post("/upload-multiple", uploadArray, async (req, res) => {
    try {
        if (req.files.length > 5) {
            return res.status(400).json({ message: "Limit exceeded, can't upload more than 5 images" });
        }
        const uploadedFiles = await Promise.all(req.files.map(uploadFile));
        res.status(200).json({
            message: "Files uploaded successfully",
            files: uploadedFiles,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Example route for uploading any type of files
router.post("/upload-any", uploadAny, async (req, res) => {
    try {
        const uploadedFiles = await Promise.all(req.files.map(uploadFile));
        res.status(200).json({
            message: "Files uploaded successfully",
            files: uploadedFiles,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// User login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Account.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_TOKEN,
            { expiresIn: "1h" }
        );
        res.cookie("jwt", token, { httpOnly: true, maxAge: 3 * 24 * 60 * 60 * 1000 });
        res.status(200).json({
            message: "Login successful",
            token,
            user: { id: user._id, email: user.email }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Logout User
router.get("/logout", (req, res) => {
    res.clearCookie('jwt');
    res.status(200).json({ message: "Logout successful, token cleared" });
});

module.exports = router;