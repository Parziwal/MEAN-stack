const expect = require("chai").expect;
const PostsController = require("../../../controllers/posts");

describe("updatePost method", function () {
  it("should update the post and return with 200 status code", function (done) {
    const fakePostModel = class FakePostModel {
      constructor(post) {
        this.post = post;
      }

      static updateOne(filter, post) {
        expect(filter).to.be.eql({
          _id: 10,
          creator: "UserId",
        });
        expect(post.post).to.be.eql({
          _id: 10,
          content: "PostContent",
          creator: "UserId",
          imagePath: "http://postserver/images/PostFile",
          title: "PostTitle",
        });
        return {
          then: (cb) => {
            cb({ n: 1 });
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
            expect(code).to.be.eql(200);
            expect(post).to.be.eql({ message: "Update successful!" });
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
        imagePath: "ImagePath",
        id: 10,
        title: "PostTitle",
        content: "PostContent",
      },
      file: {
        filename: "PostFile",
      },
      userData: {
        userId: "UserId",
      },
      params: {
        id: 10,
      },
    };

    PostsController.updatePost({
      PostModel: fakePostModel,
    })(req, res, {});
  });

  it("should not update the post because user is not authorized and return with 401 status code", function (done) {
    const fakePostModel = class FakePostModel {
      constructor() {}

      static updateOne() {
        return {
          then: (cb) => {
            cb({ n: 0 });
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
            expect(code).to.be.eql(401);
            expect(post).to.be.eql({ message: "Not authorized!" });
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
        imagePath: "ImagePath",
        id: 10,
        title: "PostTitle",
        content: "PostContent",
      },
      file: {
        filename: "PostFile",
      },
      userData: {
        userId: "UserId",
      },
      params: {
        id: 10,
      },
    };

    PostsController.updatePost({
      PostModel: fakePostModel,
    })(req, res, {});
  });

  it("should fail during the post update and return with 500 status code", function (done) {
    const fakePostModel = class FakePostModel {
      constructor() {}

      static updateOne() {
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
            expect(post).to.be.eql({ message: "Couldn't update post!" });
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
        imagePath: "ImagePath",
        id: 10,
        title: "PostTitle",
        content: "PostContent",
      },
      file: {
        filename: "PostFile",
      },
      userData: {
        userId: "UserId",
      },
      params: {
        id: 10,
      },
    };

    PostsController.updatePost({
      PostModel: fakePostModel,
    })(req, res, {});
  });
});
