const express = require("express");
const router = express.Router();

const checkAuth = require("../middleware/check-auth");
const extractFile = require("../middleware/file");

const Post = require("../models/post");
const PostsController = require("../controllers/posts");

const objectRepository = {
    PostModel: Post
};

router.post("", checkAuth, extractFile, PostsController.createPost(objectRepository));

router.put("/:id", checkAuth, extractFile, PostsController.updatePost(objectRepository)); 
    
router.get("", PostsController.getPosts(objectRepository));

router.get("/:id", PostsController.getPost(objectRepository));

router.delete("/:id", checkAuth, PostsController.deletePost(objectRepository));

module.exports = router;