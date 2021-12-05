const expect = require("chai").expect;
const PostsController = require("../../../controllers/posts");

describe("createPost method", function () {
  it("should create a post and return the post with 201 status code", function (done) {
    const fakePostModel = class FakePostModel {
      constructor(post) {
        this.post = post;
      }

      save() {
        return {
          then: (cb) => {
            cb({ ...this.post, _id: 10 });
            return {
              catch: () => {},
            };
          },
        };
      }
    };

    const res = {
      status: (code) => {
        return {
          json: (post) => {
            expect(code).to.be.eql(201);
            expect(post).to.be.eql({
              message: "Post added!",
              post: {
                content: "PostContent",
                creator: "UserId",
                id: 10,
                _id: 10,
                imagePath: "http://postserver/images/PostFile",
                title: "PostTitle",
              },
            });
            done();
          },
        };
      },
    };

    const req = {
      protocol: "http",
      get: () => {
        return "postserver";
      },
      body: {
        title: "PostTitle",
        content: "PostContent",
      },
      file: {
        filename: "PostFile",
      },
      userData: {
        userId: "UserId",
      },
    };

    PostsController.createPost({
      PostModel: fakePostModel,
    })(req, res, {});
  });

  it("should fail during post creation and return with 500 status code", function (done) {
    const fakePostModel = class FakePostModel {
      constructor() {}

      save() {
        return {
          then: () => {
            return {
              catch: (cb) => {
                cb();
              },
            };
          },
        };
      }
    };

    const res = {
      status: (code) => {
        return {
          json: (post) => {
            expect(code).to.be.eql(500);
            expect(post).to.be.eql({ message: "Creating a post failed!" });
            done();
          },
        };
      },
    };

    const req = {
      protocol: "http",
      get: () => {
        return "postserver";
      },
      body: {
        title: "PostTitle",
        content: "PostContent",
      },
      file: {
        filename: "PostFile",
      },
      userData: {
        userId: "UserId",
      },
    };

    PostsController.createPost({
      PostModel: fakePostModel,
    })(req, res, {});
  });
});
